import { supabase } from "@/lib/supabase/client";
import { BlogPost, ApiResponse, Tag } from "@/types";

// Helper to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
};

// Transform database post to frontend format
const transformPostFromDB = (post: any): BlogPost => {
  if (!post) return {} as BlogPost;

  return {
    _id: post.id,
    id: post.id,
    title: post.title,
    slug: post.slug,
    body: post.body,
    excerpt: post.excerpt,
    category: post.category,
    status: post.status,
    headerImage: post.header_image,
    views: post.views || 0,
    authorId: post.author_id,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    // When using the legacy client-side API, tags are not loaded; default to empty.
    tags: [] as Tag[],
  };
};

// Blog API functions using Supabase
export const blogAPI = {
  // Get all posts with optional filters
  getAllPosts: async (params: any = {}): Promise<ApiResponse<BlogPost[]>> => {
    const {
      page = 1,
      limit = 10,
      category,
      sort = "-createdAt",
      status,
    } = params;

    let query = supabase.from("posts").select("*", { count: "exact" });

    if (category) {
      query = query.eq("category", category);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (sort) {
      const isDescending = sort.startsWith("-");
      const column = isDescending ? sort.slice(1) : sort;
      const columnMap: Record<string, string> = {
        createdAt: "created_at",
        updatedAt: "updated_at",
        views: "views",
      };
      const actualColumn = columnMap[column] || column;
      query = query.order(actualColumn, { ascending: !isDescending });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const transformedData = data.map(transformPostFromDB);

    return {
      success: true,
      data: transformedData,
      total: count,
      totalPages: Math.ceil(count! / limit),
      currentPage: page,
    };
  },

  // Get single post by slug or ID
  getPost: async (identifier: string): Promise<ApiResponse<BlogPost>> => {
    let { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", identifier)
      .single();

    if (error && error.code === "PGRST116") {
      const result = await supabase
        .from("posts")
        .select("*")
        .eq("id", identifier)
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      throw error;
    }

    if (data) {
      await supabase
        .from("posts")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", data.id);
    }

    return {
      success: true,
      data: transformPostFromDB(data),
    };
  },

  // Get recent posts
  getRecentPosts: async (limit = 6): Promise<ApiResponse<BlogPost[]>> => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data.map(transformPostFromDB),
    };
  },

  // Search posts
  searchPosts: async (query: string): Promise<ApiResponse<BlogPost[]>> => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .or(
        `title.ilike.%${query}%,body.ilike.%${query}%,excerpt.ilike.%${query}%`,
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data.map(transformPostFromDB),
    };
  },

  // Create post (admin only)
  createPost: async (formData: FormData): Promise<ApiResponse<BlogPost>> => {
    const postData = {
      title: formData.get("title") as string,
      body: formData.get("body") as string,
      category: formData.get("category") as string,
      status: (formData.get("status") as string) || "draft",
      slug:
        (formData.get("slug") as string) ||
        generateSlug(formData.get("title") as string),
      excerpt: formData.get("excerpt") as string,
    };
    const imageFile = formData.get("headerImage") as File;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in to create posts");
    }

    let headerImageUrl: string | null = null;
    let uploadError: string | null = null;

    try {
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        headerImageUrl = await uploadImage(imageFile);
      }
    } catch (error: any) {
      console.error("Image upload failed, continuing without image:", error);
      uploadError = error.message;
      // Continue without image - post will still be created
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: postData.title,
        body: postData.body,
        category: postData.category,
        status: postData.status,
        slug: postData.slug,
        excerpt: postData.excerpt || postData.body?.substring(0, 150) + "...",
        header_image: headerImageUrl,
        author_id: user.id,
        views: 0,
      })
      .select()
      .single();

    if (error) {
      // If we had an upload error, include it in the message
      if (uploadError) {
        throw new Error(`Post creation failed. Also: ${uploadError}`);
      }
      throw error;
    }

    const response: ApiResponse<BlogPost> = {
      success: true,
      data: transformPostFromDB(data),
    };

    // Add warning if image upload failed
    if (uploadError) {
      response.message = `Post created successfully, but image upload failed: ${uploadError}`;
    }

    return response;
  },

  // Update post (admin only)
  updatePost: async (
    id: string,
    formData: FormData,
  ): Promise<ApiResponse<BlogPost>> => {
    const postData = {
      title: formData.get("title") as string,
      body: formData.get("body") as string,
      category: formData.get("category") as string,
      status: formData.get("status") as string,
      slug: formData.get("slug") as string,
      excerpt: formData.get("excerpt") as string,
    };
    const imageFile = formData.get("headerImage") as File;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (postData.title) updateData.title = postData.title;
    if (postData.body) updateData.body = postData.body;
    if (postData.category) updateData.category = postData.category;
    if (postData.status) updateData.status = postData.status;
    if (postData.slug) updateData.slug = postData.slug;
    if (postData.excerpt) updateData.excerpt = postData.excerpt;

    if (imageFile && imageFile instanceof File) {
      updateData.header_image = await uploadImage(imageFile);
    }

    const { data, error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: transformPostFromDB(data),
    };
  },

  // Delete post (admin only)
  deletePost: async (id: string): Promise<ApiResponse> => {
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "Post deleted successfully",
    };
  },

  // Get blog stats (admin only)
  getStats: async (): Promise<ApiResponse> => {
    const { data, error, count } = await supabase
      .from("posts")
      .select("*", { count: "exact" });

    if (error) {
      throw error;
    }

    const totalViews = data.reduce(
      (sum: number, post: any) => sum + (post.views || 0),
      0,
    );
    const published = data.filter((p: any) => p.status === "published").length;
    const drafts = data.filter((p: any) => p.status === "draft").length;

    return {
      success: true,
      data: {
        totalPosts: count,
        totalViews,
        published,
        drafts,
      },
    };
  },
};

// Upload image to Supabase Storage with better error handling
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file provided");
    }

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      throw new Error("File must be an image (JPEG, PNG, GIF, WebP)");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image size must be less than 5MB");
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    console.log("Uploading image:", filePath, file.size, "bytes");

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase upload error:", error);

      // Handle specific errors
      if (
        error.message.includes("bucket") ||
        error.message.includes("not found")
      ) {
        throw new Error("Storage bucket not configured. Please contact admin.");
      }

      if (
        error.message.includes("permission") ||
        error.message.includes("policy")
      ) {
        throw new Error("You don't have permission to upload images.");
      }

      throw new Error(`Upload failed: ${error.message}`);
    }

    if (!data) {
      throw new Error("Upload failed - no data returned");
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("blog-images").getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error("Failed to get image URL");
    }

    console.log("Image uploaded successfully:", publicUrl);
    return publicUrl;
  } catch (error: any) {
    console.error("Image upload error:", error);

    // Re-throw with user-friendly message
    if (
      error.message.startsWith("File must be") ||
      error.message.startsWith("Image size must") ||
      error.message.startsWith("Invalid file")
    ) {
      throw error; // Already user-friendly
    }

    throw new Error("Failed to upload image. Please try again.");
  }
};
