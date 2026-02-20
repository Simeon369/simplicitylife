import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAuthFromRequest } from "@/lib/auth";

const BUCKET = "blog-images";

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    console.error("Supabase admin client error:", e);
    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? "SUPABASE_SERVICE_ROLE_KEY is not set. Add it in .env.local for image uploads."
            : "Image upload is not configured.",
      },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "File must be an image (JPEG, PNG, GIF, WebP)",
        },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Image size must be less than 5MB" },
        { status: 400 },
      );
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error || !data) {
      console.error("Supabase upload error:", error);
      const message =
        process.env.NODE_ENV === "development" && error?.message
          ? error.message
          : "Failed to upload image. Ensure the storage bucket '" +
            BUCKET +
            "' exists and is configured in Supabase.";
      return NextResponse.json(
        { success: false, error: message },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    if (!publicUrl) {
      return NextResponse.json(
        { success: false, error: "Failed to get image URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: unknown) {
    console.error("Image upload error:", error);
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Failed to upload image";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
