import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getAuthFromRequest } from "@/lib/auth";
import type { ApiResponse, Tag } from "@/types";

// GET /api/tags - list all tags
export async function GET() {
  const supabase = await getServerSupabase();

  try {
    const { data, error } = await supabase
      .from("tags")
      .select("id, name, label")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    const tags: Tag[] =
      data?.map((row: any) => ({
        id: row.id,
        name: row.name,
        label: row.label ?? undefined,
      })) ?? [];

    const response: ApiResponse<Tag[]> = {
      success: true,
      data: tags,
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Error fetching tags:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch tags",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/tags - create a new tag (admin only)
export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();

  try {
    const { name, label } = await request.json();

    if (!name || typeof name !== "string") {
      const response: ApiResponse = {
        success: false,
        error: "Tag name is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const normalizedName = name.trim().toLowerCase();

    const auth = await getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      const response: ApiResponse = {
        success: false,
        error: "Only the admin can create tags",
      };
      return NextResponse.json(response, { status: 403 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("tags")
      .select("id")
      .eq("name", normalizedName)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing tag:", existingError);
    }

    if (existing) {
      const response: ApiResponse = {
        success: false,
        error: "Tag with this name already exists",
      };
      return NextResponse.json(response, { status: 409 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("tags")
      .insert({
        name: normalizedName,
        label: label || name,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      console.error("Error creating tag:", insertError);
      const response: ApiResponse = {
        success: false,
        error: "Failed to create tag",
      };
      return NextResponse.json(response, { status: 500 });
    }

    const tag: Tag = {
      id: inserted.id,
      name: inserted.name,
      label: inserted.label ?? undefined,
    };

    const response: ApiResponse<Tag> = {
      success: true,
      data: tag,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    console.error("Error creating tag:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to create tag",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
