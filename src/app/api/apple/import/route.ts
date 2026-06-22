import { NextResponse } from "next/server";
import { importAppleMusicPlaylist } from "@/server/apple";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("url")?.trim() ?? "";

  if (!input) {
    return NextResponse.json(
      {
        tracks: [],
        source: "demo",
        platform: "Apple Music",
        message: "Playlist URL is required.",
      },
      { status: 400 },
    );
  }

  const result = await importAppleMusicPlaylist(input);
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
