import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { db } from "@/server/db";
import type { Track } from "@/lib/mock-data";

type PlaylistRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

type UpdatePlaylistBody = {
  title?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  tracks?: Track[];
};

async function getCurrentUser() {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.warn("Session lookup failed for playlist mutation.", error);
  }

  const ownerEmail =
    session?.user?.email ?? process.env.PLAYLIT_DEMO_USER_EMAIL ?? "demo@playlit.local";
  const ownerName = session?.user?.name ?? "Me";

  const user =
    (await db.user.findUnique({ where: { email: ownerEmail } })) ??
    (await db.user.create({
      data: {
        email: ownerEmail,
        name: ownerName,
      },
    }));

  return user;
}

export async function PATCH(
  request: Request,
  { params }: PlaylistRouteProps,
) {
  const { slug } = await params;
  const body = (await request.json()) as UpdatePlaylistBody;

  const playlist = await db.playlist.findUnique({
    where: { slug },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!playlist) {
    return NextResponse.json(
      { ok: false, message: "Playlist not found." },
      { status: 404 },
    );
  }

  const user = await getCurrentUser();

  if (playlist.ownerId !== user.id) {
    return NextResponse.json(
      { ok: false, message: "You can only edit your own playlist." },
      { status: 403 },
    );
  }

  await db.playlist.update({
    where: { id: playlist.id },
    data: {
      title: body.title?.trim(),
      description: body.description?.trim(),
      tags: body.tags ?? undefined,
      isPublic: typeof body.isPublic === "boolean" ? body.isPublic : undefined,
    },
  });

  return NextResponse.json({
    ok: true,
  });
}

export async function DELETE(
  request: Request,
  { params }: PlaylistRouteProps,
) {
  const { slug } = await params;

  const playlist = await db.playlist.findUnique({
    where: { slug },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!playlist) {
    return NextResponse.json(
      { ok: false, message: "Playlist not found." },
      { status: 404 },
    );
  }

  const user = await getCurrentUser();

  if (playlist.ownerId !== user.id) {
    return NextResponse.json(
      { ok: false, message: "You can only delete your own playlist." },
      { status: 403 },
    );
  }

  await db.playlist.delete({
    where: { id: playlist.id },
  });

  return NextResponse.json({
    ok: true,
  });
}
