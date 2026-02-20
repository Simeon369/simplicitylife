import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, getSupabaseAdmin } from "@/lib/supabase/server";
import { getAuthFromRequest } from "@/lib/auth";
import type { ApiResponse, BlogPost, Tag } from "@/types";

// Helper to generate slug from a title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
};

// Transform raw DB rows into the BlogPost shape (including tags)
const mapPostRowToBlogPost = (row: any, tags: Tag[] = []): BlogPost => {
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    slug: row.slug,
    body: row.body,
    excerpt: row.excerpt,
    status: row.status,
    headerImage: row.header_image,
    views: row.views ?? 0,
    authorId: row.author_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags,
  };
};

// GET /api/posts
// List posts with optional filters and pagination.
export async function GET(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");
  const rawStatus = searchParams.get("status");
  const status = rawStatus === "all" ? null : rawStatus || "published";
  const tagSlug = searchParams.get("tag");
  const search = searchParams.get("search") ?? "";
  const slug = searchParams.get("slug");

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (rawStatus === "all" || rawStatus === "draft") {
    const auth = await getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    // Base query for posts
    let postsQuery = supabase
      .from("posts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) {
      postsQuery = postsQuery.eq("status", status);
    }

    if (slug) {
      postsQuery = postsQuery.eq("slug", slug);
    }

    if (search) {
      postsQuery = postsQuery.or(
        `title.ilike.%${search}%,excerpt.ilike.%${search}%`,
      );
    }

    // If a tag filter is present, we first need matching post_ids
    let filteredPostIds: string[] | null = null;

    if (tagSlug) {
      const { data: tagRows, error: tagError } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagSlug)
        .limit(1);

      if (tagError) {
        throw tagError;
      }

      const tag = tagRows?.[0];
      if (!tag) {
        const emptyResponse: ApiResponse<BlogPost[]> = {
          success: true,
          data: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
        };
        return NextResponse.json(emptyResponse);
      }

      const { data: postTags, error: postTagsError } = await supabase
        .from("post_tags")
        .select("post_id")
        .eq("tag_id", tag.id);

      if (postTagsError) {
        throw postTagsError;
      }

      filteredPostIds = (postTags || []).map((pt: any) => pt.post_id);

      if (filteredPostIds.length === 0) {
        const emptyResponse: ApiResponse<BlogPost[]> = {
          success: true,
          data: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
        };
        return NextResponse.json(emptyResponse);
      }

      postsQuery = postsQuery.in("id", filteredPostIds);
    }

    const { data: postRows, error, count } = await postsQuery;

    if (error) {
      throw error;
    }

    const postIds = (postRows || []).map((p: any) => p.id);

    let tagsByPostId: Record<string, Tag[]> = {};

    if (postIds.length > 0) {
      const { data: postTagsWithTag, error: tagsError } = await supabase
        .from("post_tags")
        .select("post_id, tags ( id, name, label )")
        .in("post_id", postIds);

      if (tagsError) {
        throw tagsError;
      }

      tagsByPostId = (postTagsWithTag || []).reduce(
        (acc: Record<string, Tag[]>, row: any) => {
          const t = row.tags;
          if (!t) return acc;
          const tag: Tag = {
            id: t.id,
            name: t.name,
            label: t.label ?? undefined,
          };
          if (!acc[row.post_id]) acc[row.post_id] = [];
          acc[row.post_id].push(tag);
          return acc;
        },
        {},
      );
    }

    const posts: BlogPost[] = (postRows || []).map((row: any) =>
      mapPostRowToBlogPost(row, tagsByPostId[row.id] || []),
    );

    const total = count ?? posts.length;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

    const response: ApiResponse<BlogPost[]> = {
      success: true,
      data: posts,
      total,
      totalPages,
      currentPage: page,
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Error fetching posts:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch posts",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/posts
// Create a new post (admin only). Expects JSON in the request body.
export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();

  try {
    const {
      title,
      body,
      excerpt,
      status = "draft",
      tags = [],
      headerImageUrl = null,
      slug,
    } = await request.json();

    if (!title || !body) {
      const response: ApiResponse = {
        success: false,
        error: "Title and body are required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const auth = await getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      const response: ApiResponse = {
        success: false,
        error: "You must be logged in as admin",
      };
      return NextResponse.json(response, { status: 401 });
    }

    const finalSlug = slug || generateSlug(title);

    // Use admin client so insert is not blocked by RLS (we already verified admin via JWT)
    const admin = getSupabaseAdmin();

    const { data: inserted, error: insertError } = await admin
      .from("posts")
      .insert({
        title,
        slug: finalSlug,
        body,
        excerpt,
        status,
        header_image: headerImageUrl,
        author_id: auth.userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting post:", insertError);
      const response: ApiResponse = {
        success: false,
        error: "Failed to create post",
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Attach tags if provided (array of tag IDs or full Tag objects)
    const tagIds: string[] = (tags || []).map((t: any) =>
      typeof t === "string" ? t : t.id,
    );

    if (tagIds.length > 0) {
      const postTagsRows = tagIds.map((tagId) => ({
        post_id: inserted.id,
        tag_id: tagId,
      }));

      const { error: postTagsError } = await admin
        .from("post_tags")
        .insert(postTagsRows);

      if (postTagsError) {
        console.error("Error attaching tags to post:", postTagsError);
      }
    }

    // Fetch tags for the new post
    const { data: postTagsWithTag } = await admin
      .from("post_tags")
      .select("post_id, tags ( id, name, label )")
      .eq("post_id", inserted.id);

    const tagsForPost: Tag[] =
      postTagsWithTag?.map((row: any) => ({
        id: row.tags.id,
        name: row.tags.name,
        label: row.tags.label ?? undefined,
      })) ?? [];

    const response: ApiResponse<BlogPost> = {
      success: true,
      data: mapPostRowToBlogPost(inserted, tagsForPost),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    console.error("Error creating post:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to create post",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
