import { getServerSupabase } from "@/lib/supabase/server";
import type { BlogPost, Tag } from "@/types";

const mapPostRowToBlogPost = (row: any, tags: Tag[] = []): BlogPost => ({
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
});

export interface GetPostsParams {
  page?: number;
  limit?: number;
  tag?: string | null;
  search?: string;
  status?: "published" | "draft" | null;
}

export interface GetPostsResult {
  posts: BlogPost[];
  total: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Server-only: fetch posts with optional tag, search, and pagination.
 * Used by the blog listing page (server component).
 */
export async function getPostsForBlog(params: GetPostsParams = {}): Promise<GetPostsResult> {
  const supabase = await getServerSupabase();
  const page = params.page ?? 1;
  const limit = params.limit ?? 9;
  const status = params.status ?? "published";
  const tagSlug = params.tag ?? null;
  const search = params.search ?? "";
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let postsQuery = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) {
    postsQuery = postsQuery.eq("status", status);
  }

  if (search) {
    postsQuery = postsQuery.or(
      `title.ilike.%${search}%,excerpt.ilike.%${search}%`,
    );
  }

  let filteredPostIds: string[] | null = null;

  if (tagSlug) {
    const { data: tagRows, error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tagSlug)
      .limit(1);

    if (tagError || !tagRows?.[0]) {
      return { posts: [], total: 0, totalPages: 0, currentPage: page };
    }

    const { data: postTags, error: postTagsError } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", tagRows[0].id);

    if (postTagsError) {
      return { posts: [], total: 0, totalPages: 0, currentPage: page };
    }

    filteredPostIds = (postTags || []).map((pt: any) => pt.post_id);
    if (filteredPostIds.length === 0) {
      return { posts: [], total: 0, totalPages: 0, currentPage: page };
    }
    postsQuery = postsQuery.in("id", filteredPostIds);
  }

  const { data: postRows, error, count } = await postsQuery;

  if (error) {
    console.error("getPostsForBlog error:", error);
    return { posts: [], total: 0, totalPages: 0, currentPage: page };
  }

  const postIds = (postRows || []).map((p: any) => p.id);
  let tagsByPostId: Record<string, Tag[]> = {};

  if (postIds.length > 0) {
    const { data: postTagsWithTag, error: tagsError } = await supabase
      .from("post_tags")
      .select("post_id, tags ( id, name, label )")
      .in("post_id", postIds);

    if (!tagsError && postTagsWithTag) {
      tagsByPostId = postTagsWithTag.reduce(
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
  }

  const posts: BlogPost[] = (postRows || []).map((row: any) =>
    mapPostRowToBlogPost(row, tagsByPostId[row.id] || []),
  );

  const total = count ?? posts.length;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  return { posts, total, totalPages, currentPage: page };
}

/**
 * Server-only: fetch a single published post by slug (for blog detail page).
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await getServerSupabase();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !post) {
    return null;
  }

  const { data: postTagsWithTag } = await supabase
    .from("post_tags")
    .select("post_id, tags ( id, name, label )")
    .eq("post_id", post.id);

  const tags: Tag[] =
    postTagsWithTag?.map((row: any) => ({
      id: row.tags.id,
      name: row.tags.name,
      label: row.tags.label ?? undefined,
    })) ?? [];

  return mapPostRowToBlogPost(post, tags);
}

/**
 * Server-only: fetch related posts by tag (for blog detail page).
 */
export async function getRelatedPostsByTag(
  tagIds: string[],
  excludePostId: string,
  limit = 3,
): Promise<BlogPost[]> {
  if (tagIds.length === 0) return [];

  const supabase = await getServerSupabase();

  const { data: postTagRows } = await supabase
    .from("post_tags")
    .select("post_id")
    .in("tag_id", tagIds)
    .neq("post_id", excludePostId);

  const postIds = [...new Set((postTagRows || []).map((r: any) => r.post_id))].slice(
    0,
    limit * 2,
  );

  if (postIds.length === 0) return [];

  const { data: postRows } = await supabase
    .from("posts")
    .select("*")
    .in("id", postIds)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!postRows?.length) return [];

  const { data: postTagsWithTag } = await supabase
    .from("post_tags")
    .select("post_id, tags ( id, name, label )")
    .in("post_id", postRows.map((p: any) => p.id));

  const tagsByPostId: Record<string, Tag[]> = {};
  (postTagsWithTag || []).forEach((row: any) => {
    const t = row.tags;
    if (!t) return;
    const tag: Tag = { id: t.id, name: t.name, label: t.label ?? undefined };
    if (!tagsByPostId[row.post_id]) tagsByPostId[row.post_id] = [];
    tagsByPostId[row.post_id].push(tag);
  });

  return postRows.map((row: any) =>
    mapPostRowToBlogPost(row, tagsByPostId[row.id] || []),
  );
}

/**
 * Server-only: fetch all tags (for blog filter UI).
 */
export async function getAllTags(): Promise<Tag[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, label")
    .order("name", { ascending: true });

  if (error) return [];
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    label: row.label ?? undefined,
  }));
}
