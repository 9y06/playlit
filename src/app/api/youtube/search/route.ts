import { NextResponse } from "next/server";
import { searchYouTubeTracks } from "@/server/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const rawLimit = Number(searchParams.get("limit") ?? "8");
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 20) : 8;

  if (query.length < 2) {
    return NextResponse.json(
      {
        tracks: [],
        source: "demo",
        message: "Query must be at least 2 characters.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await searchYouTubeTracks(query, limit);
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
        message,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
