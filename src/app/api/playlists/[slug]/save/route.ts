import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { db } from "@/server/db";

type SavePlaylistRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: SavePlaylistRouteProps,
) {
  const { slug } = await params;
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.warn("Session lookup failed for playlist save.", error);
  }

  const ownerEmail = session?.user?.email ?? process.env.PLAYLIT_DEMO_USER_EMAIL ?? "demo@playlit.local";
  const ownerName = session?.user?.name ?? "Me";

  const playlist = await db.playlist.findUnique({
    where: { slug },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!playlist) {
    return NextResponse.json(
      {
        ok: false,
        message: "Playlist not found.",
      },
      { status: 404 },
    );
  }

  const user =
    (await db.user.findUnique({ where: { email: ownerEmail } })) ??
    (await db.user.create({
      data: {
        email: ownerEmail,
        name: ownerName,
      },
    }));

  if (playlist.ownerId === user.id) {
    return NextResponse.json({
      ok: true,
      saved: true,
      message: "This playlist is already yours.",
    });
  }

  const existing = await db.savedPlaylist.findFirst({
    where: {
      userId: user.id,
      playlistId: playlist.id,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    await db.$transaction([
      db.savedPlaylist.create({
        data: {
          userId: user.id,
          playlistId: playlist.id,
        },
      }),
      db.playlist.update({
        where: { id: playlist.id },
        data: {
          saveCount: {
            increment: 1,
          },
        },
      }),
    ]);
  }

  return NextResponse.json({
    ok: true,
    saved: true,
  });
}
