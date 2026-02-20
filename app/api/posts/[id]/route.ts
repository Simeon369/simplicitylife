import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, getSupabaseAdmin } from "@/lib/supabase/server";
import { getAuthFromRequest } from "@/lib/auth";
import type { ApiResponse, BlogPost, Tag } from "@/types";

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

// GET /api/posts/[id] - fetch a single post by id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await getServerSupabase();
  const { id: postId } = await params;

  try {

    const { data: post, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error || !post) {
      const response: ApiResponse = {
        success: false,
        error: "Post not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Increment views (best-effort, ignore errors)
    void supabase
      .from("posts")
      .update({ views: (post.views ?? 0) + 1 })
      .eq("id", postId);

    const { data: postTagsWithTag } = await supabase
      .from("post_tags")
      .select("post_id, tags ( id, name, label )")
      .eq("post_id", postId);

    const tags: Tag[] =
      postTagsWithTag?.map((row: any) => ({
        id: row.tags.id,
        name: row.tags.name,
        label: row.tags.label ?? undefined,
      })) ?? [];

    const response: ApiResponse<BlogPost> = {
      success: true,
      data: mapPostRowToBlogPost(post, tags),
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Error fetching post:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch post",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH /api/posts/[id] - update a post (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await getServerSupabase();
  const { id: postId } = await params;

  try {
    const payload = await request.json();

    const auth = await getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      const response: ApiResponse = {
        success: false,
        error: "Only the admin can update posts",
      };
      return NextResponse.json(response, { status: 403 });
    }

    const admin = getSupabaseAdmin();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.body !== undefined) updateData.body = payload.body;
    if (payload.excerpt !== undefined) updateData.excerpt = payload.excerpt;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.headerImageUrl !== undefined)
      updateData.header_image = payload.headerImageUrl;

    const { data: updated, error: updateError } = await admin
      .from("posts")
      .update(updateData)
      .eq("id", postId)
      .select()
      .single();

    if (updateError || !updated) {
      console.error("Error updating post:", updateError);
      const response: ApiResponse = {
        success: false,
        error: "Failed to update post",
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Sync tags if provided (array of tag IDs or Tag objects)
    let tagsForPost: Tag[] = [];

    if (Array.isArray(payload.tags)) {
      const tagIds: string[] = payload.tags.map((t: any) =>
        typeof t === "string" ? t : t.id,
      );

      // Clear existing tag links
      const { error: deleteError } = await admin
        .from("post_tags")
        .delete()
        .eq("post_id", postId);

      if (deleteError) {
        console.error("Error clearing post_tags relationships:", deleteError);
      }

      if (tagIds.length > 0) {
        const postTagsRows = tagIds.map((tagId) => ({
          post_id: postId,
          tag_id: tagId,
        }));

        const { error: insertError } = await admin
          .from("post_tags")
          .insert(postTagsRows);

        if (insertError) {
          console.error(
            "Error inserting post_tags relationships:",
            insertError,
          );
        }

        const { data: postTagsWithTag } = await admin
          .from("post_tags")
          .select("post_id, tags ( id, name, label )")
          .eq("post_id", postId);

        tagsForPost =
          postTagsWithTag?.map((row: any) => ({
            id: row.tags.id,
            name: row.tags.name,
            label: row.tags.label ?? undefined,
          })) ?? [];
      }
    } else {
      // If tags not included in payload, load current tags
      const { data: postTagsWithTag } = await admin
        .from("post_tags")
        .select("post_id, tags ( id, name, label )")
        .eq("post_id", postId);

      tagsForPost =
        postTagsWithTag?.map((row: any) => ({
          id: row.tags.id,
          name: row.tags.name,
          label: row.tags.label ?? undefined,
        })) ?? [];
    }

    const response: ApiResponse<BlogPost> = {
      success: true,
      data: mapPostRowToBlogPost(updated, tagsForPost),
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Error updating post:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to update post",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/posts/[id] - delete a post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params;

  try {
    const auth = await getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      const response: ApiResponse = {
        success: false,
        error: "Only the admin can delete posts",
      };
      return NextResponse.json(response, { status: 403 });
    }

    const admin = getSupabaseAdmin();

    // Delete post_tags first, then the post
    const { error: postTagsDeleteError } = await admin
      .from("post_tags")
      .delete()
      .eq("post_id", postId);

    if (postTagsDeleteError) {
      console.error("Error deleting post_tags:", postTagsDeleteError);
    }

    const { error: deleteError } = await admin
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      console.error("Error deleting post:", deleteError);
      const response: ApiResponse = {
        success: false,
        error: "Failed to delete post",
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Post deleted successfully",
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Error deleting post:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to delete post",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
