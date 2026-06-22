import "server-only";

import type { Track } from "@/lib/mock-data";
import { importPreviewTracks, searchLocalTracks } from "@/lib/mock-data";

type YouTubeSearchItem = {
  id: {
    videoId?: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails?: {
      high?: {
        url: string;
      };
      medium?: {
        url: string;
      };
      default?: {
        url: string;
      };
    };
  };
};

type YouTubeSearchResponse = {
  items: YouTubeSearchItem[];
};

type YouTubeVideoItem = {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    thumbnails?: {
      high?: {
        url: string;
      };
      medium?: {
        url: string;
      };
      default?: {
        url: string;
      };
    };
  };
  contentDetails?: {
    duration?: string;
  };
};

type YouTubeVideosResponse = {
  items: YouTubeVideoItem[];
};

type YouTubePlaylistItem = {
  snippet: {
    title: string;
    channelTitle: string;
    resourceId?: {
      videoId?: string;
    };
    thumbnails?: {
      high?: {
        url: string;
      };
      medium?: {
        url: string;
      };
      default?: {
        url: string;
      };
    };
  };
};

type YouTubePlaylistItemsResponse = {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
};

type YouTubePlaylistResponse = {
  items: Array<{
    id: string;
    snippet: {
      title: string;
    };
  }>;
};

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function hasYoutubeKey() {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

function toMinutesAndSeconds(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function iso8601DurationToMs(duration: string) {
  const match = duration.match(
    /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/,
  );

  if (!match) {
    return 0;
  }

  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);

  return (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000;
}

function pickThumbnail(urls?: YouTubeVideoItem["snippet"]["thumbnails"]) {
  return urls?.high?.url ?? urls?.medium?.url ?? urls?.default?.url;
}

function mapSearchItemToTrack(item: YouTubeVideoItem): Track {
  return {
    id: item.id,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    album: "YouTube",
    duration: item.contentDetails?.duration
      ? toMinutesAndSeconds(iso8601DurationToMs(item.contentDetails.duration))
      : "0:00",
    platform: "YouTube Music",
    imageUrl: pickThumbnail(item.snippet.thumbnails),
    externalUrl: `https://www.youtube.com/watch?v=${item.id}`,
    playbackUrl: `https://www.youtube.com/watch?v=${item.id}`,
  };
}

function parseTimestamp(value: string) {
  const parts = value.split(":").map((part) => Number(part));

  if (parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return parts.reduce((total, part) => total * 60 + part, 0);
}

function secondsToDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function extractChapterTracks(
  video: YouTubeVideoItem,
  limit: number,
): Track[] {
  const lines = video.snippet.description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const chapterLines = lines
    .map((line) => {
      const match = line.match(/^(\d{1,2}:)?\d{1,2}:\d{2}\s+(.+)$/);

      if (!match) {
        return null;
      }

      return {
        seconds: parseTimestamp(line.split(/\s+/)[0]) ?? 0,
        title: match[2].trim(),
      };
    })
    .filter((entry): entry is { seconds: number; title: string } => Boolean(entry));

  if (chapterLines.length < 2) {
    return [];
  }

  return chapterLines.slice(0, limit).map((chapter, index) => {
    const nextChapter = chapterLines[index + 1];
    const durationSeconds = nextChapter
      ? nextChapter.seconds - chapter.seconds
      : 0;
    const [title, artist] = chapter.title.split(/\s+-\s+|\s+by\s+/i);

    return {
      id: `${video.id}-${chapter.seconds}`,
      title: title?.trim() || chapter.title,
      artist: artist?.trim() || video.snippet.channelTitle,
      album: video.snippet.title,
      duration: durationSeconds > 0 ? secondsToDuration(durationSeconds) : "0:00",
      platform: "YouTube Music",
      imageUrl: pickThumbnail(video.snippet.thumbnails),
      externalUrl: `https://www.youtube.com/watch?v=${video.id}&t=${chapter.seconds}s`,
    };
  });
}

function mapPlaylistItemToTrack(item: YouTubePlaylistItem, index: number): Track {
  const videoId = item.snippet.resourceId?.videoId ?? `youtube-${index + 1}`;

  return {
    id: videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    album: "YouTube",
    duration: "0:00",
    platform: "YouTube Music",
    imageUrl: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url,
    externalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    playbackUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

function extractYouTubePlaylistId(input: string) {
  try {
    const url = new URL(input);
    const playlistId = url.searchParams.get("list");
    return playlistId?.trim() ?? null;
  } catch {
    return null;
  }
}

function extractYouTubeVideoId(input: string) {
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    const videoId = url.searchParams.get("v");
    return videoId?.trim() ?? null;
  } catch {
    return null;
  }
}

async function youtubeFetch<T>(path: string, params: Record<string, string>) {
  if (!hasYoutubeKey()) {
    return null;
  }

  const url = new URL(`${YOUTUBE_API_BASE}/${path}`);
  url.search = new URLSearchParams({
    ...params,
    key: process.env.YOUTUBE_API_KEY!,
  }).toString();

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`YouTube API request failed: ${response.status} ${message}`);
  }

  return (await response.json()) as T;
}

async function fetchAllYouTubePlaylistItems(
  playlistId: string,
  limit: number,
) {
  const items: YouTubePlaylistItem[] = [];
  let pageToken: string | undefined;

  while (items.length < limit) {
    const response = await youtubeFetch<YouTubePlaylistItemsResponse>("playlistItems", {
      part: "snippet",
      playlistId,
      maxResults: String(Math.min(50, limit - items.length)),
      ...(pageToken ? { pageToken } : {}),
    });

    if (!response?.items.length) {
      break;
    }

    items.push(...response.items);
    pageToken = response.nextPageToken;

    if (!pageToken) {
      break;
    }
  }

  return items.slice(0, limit);
}

export async function searchYouTubeTracks(query: string, limit = 8) {
  const normalized = query.trim();

  if (normalized.length < 2) {
    return {
      source: "demo" as const,
      tracks: searchLocalTracks(normalized, limit),
    };
  }

  if (!hasYoutubeKey()) {
    return {
      source: "demo" as const,
      tracks: searchLocalTracks(normalized, limit),
    };
  }

  const searchResponse = await youtubeFetch<YouTubeSearchResponse>("search", {
    part: "snippet",
    type: "video",
    q: normalized,
    maxResults: String(limit),
    videoEmbeddable: "true",
  });

  if (!searchResponse?.items.length) {
    return {
      source: "demo" as const,
      tracks: searchLocalTracks(normalized, limit),
    };
  }

  const videoIds = searchResponse.items
    .map((item) => item.id.videoId)
    .filter((videoId): videoId is string => Boolean(videoId));

  const videoDetails = videoIds.length
    ? await youtubeFetch<YouTubeVideosResponse>("videos", {
        part: "snippet,contentDetails",
        id: videoIds.join(","),
        maxResults: String(limit),
      })
    : null;

  const itemsById = new Map(videoDetails?.items.map((item) => [item.id, item]) ?? []);

  return {
    source: "youtube" as const,
    tracks: videoIds
      .map((videoId) => itemsById.get(videoId))
      .filter((item): item is YouTubeVideoItem => Boolean(item))
      .map(mapSearchItemToTrack),
  };
}

export async function importYouTubePlaylist(input: string, limit = 12) {
  const playlistId = extractYouTubePlaylistId(input);

  if (!playlistId) {
    const videoId = extractYouTubeVideoId(input);

    if (!videoId) {
      return {
        source: "demo" as const,
        platform: "YouTube Music" as const,
        tracks: importPreviewTracks,
        message: "Enter a valid YouTube playlist or video link.",
      };
    }

    const videoResponse = await youtubeFetch<YouTubeVideosResponse>("videos", {
      part: "snippet,contentDetails",
      id: videoId,
    });

    const video = videoResponse?.items[0];

    if (!video) {
      return {
        source: "demo" as const,
        platform: "YouTube Music" as const,
        tracks: importPreviewTracks,
        message: "No tracks were found for this video.",
      };
    }

    const chapterTracks = extractChapterTracks(video, limit);

    return {
      source: "youtube" as const,
      platform: "YouTube Music" as const,
      playlistName: video.snippet.title,
      tracks:
        chapterTracks.length > 0
          ? chapterTracks
          : [mapSearchItemToTrack(video)],
      message:
        chapterTracks.length > 0
          ? undefined
          : "This video does not include chapter timestamps, so it was imported as one item.",
    };
  }

  if (!hasYoutubeKey()) {
    return {
      source: "demo" as const,
      platform: "YouTube Music" as const,
      tracks: importPreviewTracks,
      message: "YouTube API key is missing, so demo tracks are shown.",
    };
  }

  const playlistResponse = await youtubeFetch<YouTubePlaylistItemsResponse>(
    "playlistItems",
    {
      part: "snippet",
      playlistId,
      maxResults: String(limit),
    },
  );

  const playlistMeta = await youtubeFetch<YouTubePlaylistResponse>("playlists", {
    part: "snippet",
    id: playlistId,
  });

  const playlistItems = playlistResponse?.items.length
    ? await fetchAllYouTubePlaylistItems(playlistId, limit)
    : [];

  if (!playlistItems.length) {
    return {
      source: "demo" as const,
      platform: "YouTube Music" as const,
      tracks: importPreviewTracks,
      message: "No tracks were found for this playlist.",
    };
  }

  return {
    source: "youtube" as const,
    platform: "YouTube Music" as const,
    playlistName: playlistMeta?.items[0]?.snippet.title,
    tracks: playlistItems.map(mapPlaylistItemToTrack),
  };
}
