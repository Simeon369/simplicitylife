import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, visitorId } = body;

    if (!postId || !visitorId) {
      return NextResponse.json(
        { success: false, error: "Missing postId or visitorId" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("post_views").upsert(
      {
        post_id: postId,
        visitor_id: visitorId,
        viewed_at: new Date().toISOString(),
      },
      {
        onConflict: "post_id,visitor_id",
        ignoreDuplicates: true,
      }
    );

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, duplicate: true });
      }
      console.error("Error recording view:", error);
      return NextResponse.json(
        { success: false, error: "Failed to record view" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("View tracking error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Missing postId" },
        { status: 400 }
      );
    }

    const { count, error } = await supabase
      .from("post_views")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) {
      console.error("Error fetching view count:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch view count" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, views: count ?? 0 });
  } catch (err) {
    console.error("View count error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
