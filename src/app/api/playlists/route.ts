import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import type { Track } from "@/lib/mock-data";
import { saveCreatedPlaylist } from "@/server/playlists";

type CreatePlaylistBody = {
  title?: string;
  description?: string;
  tags?: string[];
  tracks?: Track[];
  isPublic?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CreatePlaylistBody;
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.warn("Session lookup failed for playlist create.", error);
  }

  const tracks = body.tracks ?? [];
  const tags = body.tags ?? [];

  if (!body.title?.trim() || tracks.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "Title and tracks are required.",
      },
      { status: 400 },
    );
  }

  const result = await saveCreatedPlaylist({
    ownerEmail: session?.user?.email ?? undefined,
    ownerName: session?.user?.name ?? undefined,
    title: body.title.trim(),
    description: body.description,
    sourcePlatform: "Playlit",
    tracks,
    tags,
    isPublic: body.isPublic,
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
