import { type NextRequest, NextResponse } from "next/server";
import { getIPInfo, isPrivateIP } from "@/lib/ip-info";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ error: "Missing query parameter q" }, { status: 400 });
  }

  if (isPrivateIP(query)) {
    return NextResponse.json({ error: "Private/local IP addresses cannot be looked up" }, { status: 400 });
  }

  const info = await getIPInfo(query, null);
  return NextResponse.json(info);
}
