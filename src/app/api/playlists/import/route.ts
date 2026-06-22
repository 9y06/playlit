import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import type { Track } from "@/lib/mock-data";
import { saveImportedPlaylist } from "@/server/playlists";

type ImportPlaylistBody = {
  title?: string;
  description?: string;
  platform?: Track["platform"];
  tracks?: Track[];
  isPublic?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ImportPlaylistBody;
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.warn("Session lookup failed for playlist import.", error);
  }

  const tracks = body.tracks ?? [];

  if (!body.title || tracks.length === 0 || !body.platform) {
    return NextResponse.json(
      {
        ok: false,
        message: "Title, platform, and tracks are required.",
      },
      { status: 400 },
    );
  }

  const result = await saveImportedPlaylist({
    ownerEmail: session?.user?.email ?? undefined,
    ownerName: session?.user?.name ?? undefined,
    title: body.title,
    description: body.description,
    sourcePlatform: body.platform,
    tracks,
    isPublic: body.isPublic,
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
