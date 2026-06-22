import { NextResponse } from "next/server";
import { importSpotifyPlaylist } from "@/server/spotify";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("url")?.trim() ?? "";
  const rawLimit = Number(searchParams.get("limit") ?? "12");
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 20) : 12;

  if (!input) {
    return NextResponse.json(
      {
        tracks: [],
        source: "demo",
        platform: "Spotify",
        message: "Playlist URL is required.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await importSpotifyPlaylist(input, limit);
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
        platform: "Spotify",
        message,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
