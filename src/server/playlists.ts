import "server-only";

import type { Locale } from "@/i18n/config";
import {
  getAllTags as getDemoTags,
  getCreatedPlaylists as getDemoCreatedPlaylists,
  getPlaylistBySlug as getDemoPlaylistBySlug,
  getPlaylistTracks as getDemoPlaylistTracks,
  getPublicPlaylists as getDemoPublicPlaylists,
  getSavedPlaylists as getDemoSavedPlaylists,
  playlists as demoPlaylists,
  tracks as demoTracks,
  type Playlist,
  type Track,
} from "@/lib/mock-data";
import { db } from "./db";
import { hydrateSpotifyPreviewUrls } from "./spotify";
import { searchYouTubeTracks } from "./youtube";
import { randomUUID } from "crypto";

type DbPlaylistWithRelations = Awaited<
  ReturnType<typeof db.playlist.findFirst>
> & {
  tracks: Array<{
    position: number;
      track: {
        id: string;
        title: string;
        artist: string;
        album: string;
        duration: string;
        platform: string;
        imageUrl: string | null;
        externalUrl: string | null;
      };
  }>;
  owner: {
    name: string | null;
    email: string | null;
  };
};

type DbTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  platform: string;
  imageUrl: string | null;
  externalUrl: string | null;
};

const demoUserEmail = process.env.PLAYLIT_DEMO_USER_EMAIL ?? "demo@playlit.local";
let seedPromise: Promise<void> | null = null;

function toLocalized(value: string) {
  return { ko: value, en: value };
}

function toAppTrack(track: DbTrack): Track {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    duration: track.duration,
    platform: track.platform as Track["platform"],
    imageUrl: track.imageUrl ?? undefined,
    externalUrl: track.externalUrl ?? undefined,
  };
}

async function hydratePlaybackSources(tracks: Track[]) {
  const hydratedSpotifyTracks = await hydrateSpotifyPreviewUrls(tracks);
  const youtubeHydratedTracks = hydratedSpotifyTracks.map((track) => {
    if (track.playbackUrl || track.platform !== "YouTube Music") {
      return track;
    }

    return {
      ...track,
      playbackUrl: track.externalUrl ?? undefined,
    };
  });

  const unresolved = youtubeHydratedTracks.filter(
    (track) =>
      !track.playbackUrl &&
      track.title.trim().length > 0,
  );

  if (unresolved.length === 0) {
    return hydratedSpotifyTracks;
  }

  const resolvedEntries = await Promise.all(
    unresolved.map(async (track) => {
      const result = await searchYouTubeTracks(`${track.title} ${track.artist}`, 1);

      if (result.source !== "youtube" || result.tracks.length === 0) {
        return [track.id, track] as const;
      }

      return [
        track.id,
        {
          ...track,
          playbackUrl: result.tracks[0].externalUrl,
          imageUrl: result.tracks[0].imageUrl ?? track.imageUrl,
        },
      ] as const;
    }),
  );

  const resolvedMap = new Map(resolvedEntries);

  return youtubeHydratedTracks.map((track) => resolvedMap.get(track.id) ?? track);
}

function toAppPlaylist(playlist: DbPlaylistWithRelations): Playlist {
  return {
    id: playlist.id,
    slug: playlist.slug,
    title: toLocalized(playlist.title),
    description: toLocalized(playlist.description ?? ""),
    owner: playlist.owner.name ?? playlist.owner.email ?? "Me",
    ownerHandle: playlist.ownerHandle ?? "@me",
    tags: playlist.tags.map(toLocalized),
    sourcePlatform: playlist.sourcePlatform as Playlist["sourcePlatform"],
    isPublic: playlist.isPublic,
    saveCount: playlist.saveCount,
    createdAt: playlist.createdAt.toISOString().slice(0, 10),
    cover: {
      base: playlist.coverBase ?? "#111827",
      accent: playlist.coverAccent ?? "#9ca3af",
    },
    trackIds: playlist.tracks
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((relation) => relation.track.id),
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function createUniqueSlug(prefix: string) {
  return `${slugify(prefix) || "playlist"}-${randomUUID().slice(0, 8)}`;
}

async function seedDemoData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const playlistCount = await db.playlist.count().catch(() => 0);

      if (playlistCount > 0) {
        return;
      }

      const ownerSeeds = [
        { id: "user-doyeon", name: "Doyeon", email: "doyeon@playlit.local" },
        { id: "user-minseo", name: "Minseo", email: "minseo@playlit.local" },
        { id: "user-jin", name: "Jin", email: "jin@playlit.local" },
        { id: "user-me", name: "Me", email: demoUserEmail },
      ];

      await Promise.all(
        ownerSeeds.map((user) =>
          db.user.upsert({
            where: { email: user.email },
            create: user,
            update: {
              name: user.name,
            },
          }),
        ),
      );

      await Promise.all(
        demoTracks.map((track) =>
          db.track.upsert({
            where: { id: track.id },
            create: {
              id: track.id,
              title: track.title,
              artist: track.artist,
              album: track.album,
              duration: track.duration,
            platform: track.platform,
            imageUrl: track.imageUrl,
            externalUrl: track.externalUrl,
          },
          update: {
            title: track.title,
            artist: track.artist,
            album: track.album,
            duration: track.duration,
            platform: track.platform,
            imageUrl: track.imageUrl,
            externalUrl: track.externalUrl,
          },
        }),
      ),
      );

      for (const playlist of demoPlaylists) {
        const ownerEmail =
          playlist.ownerHandle === "@doyeon"
            ? "doyeon@playlit.local"
            : playlist.ownerHandle === "@minseo"
              ? "minseo@playlit.local"
              : playlist.ownerHandle === "@jin"
                ? "jin@playlit.local"
                : demoUserEmail;

        const owner = await db.user.findUnique({
          where: { email: ownerEmail },
        });

        if (!owner) {
          continue;
        }

        await db.playlist.upsert({
          where: { slug: playlist.slug },
          create: {
            id: playlist.id,
            slug: playlist.slug,
            title: playlist.title.en,
            description: playlist.description.en,
            ownerId: owner.id,
            ownerHandle: playlist.ownerHandle,
            sourcePlatform: playlist.sourcePlatform,
            isPublic: playlist.isPublic,
            saveCount: playlist.saveCount,
            coverBase: playlist.cover.base,
            coverAccent: playlist.cover.accent,
            tags: playlist.tags.map((tag) => tag.en),
          },
          update: {
            title: playlist.title.en,
            description: playlist.description.en,
            ownerId: owner.id,
            ownerHandle: playlist.ownerHandle,
            sourcePlatform: playlist.sourcePlatform,
            isPublic: playlist.isPublic,
            saveCount: playlist.saveCount,
            coverBase: playlist.cover.base,
            coverAccent: playlist.cover.accent,
            tags: playlist.tags.map((tag) => tag.en),
          },
        });

        const trackRelations = getDemoPlaylistTracks(playlist).map((track, index) => ({
          playlistId: playlist.id,
          trackId: track.id,
          position: index,
        }));

        await db.playlistTrack.deleteMany({
          where: {
            playlistId: playlist.id,
          },
        });

        if (trackRelations.length > 0) {
          await db.playlistTrack.createMany({
            data: trackRelations,
            skipDuplicates: true,
          });
        }
      }

      const demoUser = await db.user.findUnique({
        where: { email: demoUserEmail },
      });

      if (!demoUser) {
        return;
      }

      const savedPlaylists = demoPlaylists.filter(
        (playlist) => playlist.isPublic && playlist.ownerHandle !== "@me",
      );

      await db.savedPlaylist.deleteMany({
        where: { userId: demoUser.id },
      });

      if (savedPlaylists.length > 0) {
        await db.savedPlaylist.createMany({
          data: savedPlaylists.map((playlist) => ({
            userId: demoUser.id,
            playlistId: playlist.id,
          })),
          skipDuplicates: true,
        });
      }
    })();
  }

  return seedPromise;
}

async function withDemoFallback<T>(loader: () => Promise<T>, fallback: () => T) {
  try {
    await seedDemoData();
    return await loader();
  } catch {
    return fallback();
  }
}

export async function saveImportedPlaylist(input: {
  ownerEmail?: string | null;
  ownerName?: string | null;
  title: string;
  description?: string | null;
  sourcePlatform: Playlist["sourcePlatform"];
  tracks: Track[];
  tags?: string[];
  isPublic?: boolean;
}) {
  try {
    await seedDemoData();

    const ownerEmail = input.ownerEmail ?? demoUserEmail;
    const owner =
      (await db.user.findUnique({ where: { email: ownerEmail } })) ??
      (await db.user.create({
        data: {
          email: ownerEmail,
          name: input.ownerName ?? "Me",
        },
      }));

    const slug = createUniqueSlug(input.title);
      const playlist = await db.playlist.create({
      data: {
        slug,
        title: input.title,
        description: input.description ?? "",
        ownerId: owner.id,
        ownerHandle:
          ownerEmail === demoUserEmail ? "@me" : `@${slugify(owner.name ?? ownerEmail)}`,
        sourcePlatform: input.sourcePlatform,
        isPublic: input.isPublic ?? true,
        saveCount: 0,
        coverBase: "#111827",
        coverAccent: "#9ca3af",
        tags: input.tags ?? [],
      },
    });

    await Promise.all(
      input.tracks.map((track) =>
        db.track.upsert({
          where: { id: track.id },
          create: {
            id: track.id,
            title: track.title,
            artist: track.artist,
            album: track.album,
            duration: track.duration,
            platform: track.platform,
            imageUrl: track.imageUrl,
            externalUrl: track.externalUrl,
          },
          update: {
            title: track.title,
            artist: track.artist,
            album: track.album,
            duration: track.duration,
            platform: track.platform,
            imageUrl: track.imageUrl,
            externalUrl: track.externalUrl,
          },
        }),
      ),
    );

    await db.playlistTrack.createMany({
      data: input.tracks.map((track, index) => ({
        playlistId: playlist.id,
        trackId: track.id,
        position: index,
      })),
      skipDuplicates: true,
    });

    return {
      ok: true as const,
      slug,
    };
  } catch (error) {
    console.error("Failed to save imported playlist.", error);

    return {
      ok: false as const,
      message:
        error instanceof Error && error.message.includes("DATABASE_URL")
          ? "Database is not ready yet. Restart the dev server after updating DATABASE_URL."
          : "Failed to save playlist.",
    };
  }
}

export async function saveCreatedPlaylist(input: {
  ownerEmail?: string | null;
  ownerName?: string | null;
  title: string;
  description?: string | null;
  sourcePlatform: Playlist["sourcePlatform"];
  tracks: Track[];
  tags?: string[];
  isPublic?: boolean;
}) {
  return saveImportedPlaylist(input);
}

export async function getExplorePlaylists() {
  return withDemoFallback(async () => {
    const playlists = await db.playlist.findMany({
      where: { isPublic: true },
      include: {
        owner: true,
        tracks: {
          orderBy: { position: "asc" },
          include: {
            track: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return playlists.map((playlist) => toAppPlaylist(playlist as DbPlaylistWithRelations));
  }, () => getDemoPublicPlaylists());
}

export async function getFeaturedPlaylist() {
  const playlists = await getExplorePlaylists();
  return [...playlists].sort((a, b) => b.saveCount - a.saveCount)[0] ?? null;
}

export async function getCollectionPlaylists(ownerEmail?: string | null) {
  return withDemoFallback(async () => {
    const resolvedEmail = ownerEmail ?? demoUserEmail;
    const demoUser = await db.user.findUnique({ where: { email: resolvedEmail } });

    if (!demoUser) {
      return { created: [], saved: [] };
    }

    const created = await db.playlist.findMany({
      where: {
        ownerId: demoUser.id,
      },
      include: {
        owner: true,
        tracks: {
          orderBy: { position: "asc" },
          include: { track: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const savedRows = await db.savedPlaylist.findMany({
      where: {
        userId: demoUser.id,
      },
      include: {
        playlist: {
          include: {
            owner: true,
            tracks: {
              orderBy: { position: "asc" },
              include: { track: true },
            },
          },
        },
      },
      orderBy: { savedAt: "desc" },
    });

    return {
      created: created.map((playlist) => toAppPlaylist(playlist as DbPlaylistWithRelations)),
      saved: savedRows.map((row) => toAppPlaylist(row.playlist as DbPlaylistWithRelations)),
    };
  }, () => ({
    created: getDemoCreatedPlaylists(),
    saved: getDemoSavedPlaylists(),
  }));
}

export async function getPlaylistBySlug(slug: string) {
  return withDemoFallback(async () => {
    const playlist = await db.playlist.findUnique({
      where: { slug },
      include: {
        owner: true,
        tracks: {
          orderBy: { position: "asc" },
          include: {
            track: true,
          },
        },
      },
    });

    if (!playlist) {
      return null;
    }

    return toAppPlaylist(playlist as DbPlaylistWithRelations);
  }, () => getDemoPlaylistBySlug(slug));
}

export async function getPlaylistTracksBySlug(slug: string) {
  return withDemoFallback(async () => {
    const playlist = await db.playlist.findUnique({
      where: { slug },
      include: {
        tracks: {
          orderBy: { position: "asc" },
          include: { track: true },
        },
      },
    });

    if (!playlist) {
      return [];
    }

  const tracks = playlist.tracks
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((relation) => toAppTrack(relation.track as DbTrack));

    return hydratePlaybackSources(tracks);
  }, () => {
    const demoPlaylist = getDemoPlaylistBySlug(slug);
    return demoPlaylist ? getDemoPlaylistTracks(demoPlaylist) : [];
  });
}

export async function getAllTags(locale: Locale) {
  return withDemoFallback(async () => {
    const playlists = await db.playlist.findMany({
      select: {
        tags: true,
      },
    });

    return Array.from(new Set(playlists.flatMap((playlist) => playlist.tags))).sort();
  }, () => getDemoTags(locale));
}
