import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const supabase = await getServerSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", auth.userId)
    .maybeSingle();

  const name = profile?.name ?? auth.name;
  const role = profile?.role === "admin" ? "admin" : auth.role;

  return NextResponse.json({
    success: true,
    user: {
      id: auth.userId,
      email: auth.email,
      name,
      role,
    },
  });
}
