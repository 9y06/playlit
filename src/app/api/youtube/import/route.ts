import { NextResponse } from "next/server";
import { importYouTubePlaylist } from "@/server/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("url")?.trim() ?? "";

  if (!input) {
    return NextResponse.json(
      {
        tracks: [],
        source: "demo",
        platform: "YouTube Music",
        message: "Playlist URL is required.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await importYouTubePlaylist(input, 12);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        tracks: [],
        source: "demo",
        platform: "YouTube Music",
        message,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
