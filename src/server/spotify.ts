import "server-only";

import type { Track } from "@/lib/mock-data";
import { searchLocalTracks } from "@/lib/mock-data";

type SpotifyTokenResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
};

type SpotifyImage = {
  url: string;
  width: number | null;
  height: number | null;
};

type SpotifyArtist = {
  name: string;
};

type SpotifyAlbum = {
  name: string;
  images: SpotifyImage[];
};

type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
};

type SpotifySearchResponse = {
  tracks: {
    items: SpotifyTrack[];
  };
};

type SpotifyTracksResponse = {
  tracks: SpotifyTrack[];
};

type SpotifyPlaylistTrackItem = {
  track: SpotifyTrack | null;
};

type SpotifyPlaylistResponse = {
  name: string;
  tracks: {
    items: SpotifyPlaylistTrackItem[];
  };
};

type CachedToken = {
  value: string;
  expiresAt: number;
};

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";

let cachedToken: CachedToken | null = null;

function hasSpotifyCredentials() {
  return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

async function getSpotifyAccessToken() {
  if (!hasSpotifyCredentials()) {
    return null;
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Spotify token request failed: ${response.status} ${message}`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.value;
}

function toMinutesAndSeconds(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function mapSpotifyTrack(track: SpotifyTrack): Track {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    album: track.album.name,
    duration: toMinutesAndSeconds(track.duration_ms),
    platform: "Spotify",
    imageUrl: track.album.images[0]?.url,
    externalUrl: track.external_urls.spotify,
    previewUrl: track.preview_url ?? undefined,
    playbackUrl: track.preview_url ?? undefined,
  };
}

function extractSpotifyPlaylistId(input: string) {
  try {
    const url = new URL(input);

    if (!url.hostname.includes("spotify.com")) {
      return null;
    }

    const match = url.pathname.match(/\/playlist\/([^/]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function searchSpotifyTracks(query: string, limit = 8) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return {
      source: "demo" as const,
      tracks: searchLocalTracks(trimmedQuery, limit),
    };
  }

  const token = await getSpotifyAccessToken();

  if (!token) {
    return {
      source: "demo" as const,
      tracks: searchLocalTracks(trimmedQuery, limit),
    };
  }

  const url = new URL(SPOTIFY_SEARCH_URL);
  url.search = new URLSearchParams({
    q: trimmedQuery,
    type: "track",
    market: "KR",
    limit: String(limit),
    fields:
      "tracks.items(id,name,duration_ms,preview_url,artists(name),album(name,images),external_urls.spotify)",
  }).toString();

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Spotify search failed: ${response.status} ${message}`);
  }

  const data = (await response.json()) as SpotifySearchResponse;

  return {
    source: "spotify" as const,
    tracks: data.tracks.items.map(mapSpotifyTrack),
  };
}

export async function hydrateSpotifyPreviewUrls(tracks: Track[]) {
  const spotifyTracks = tracks.filter(
    (track) => track.platform === "Spotify" && !track.previewUrl,
  );

  if (spotifyTracks.length === 0) {
    return tracks;
  }

  const token = await getSpotifyAccessToken();

  if (!token) {
    return tracks;
  }

  const hydratedTracks = new Map<string, Track>();
  const batchSize = 50;

  for (let index = 0; index < spotifyTracks.length; index += batchSize) {
    const batch = spotifyTracks.slice(index, index + batchSize);
    const url = new URL("https://api.spotify.com/v1/tracks");
    url.search = new URLSearchParams({
      ids: batch.map((track) => track.id).join(","),
      market: "KR",
    }).toString();

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      continue;
    }

    const data = (await response.json()) as SpotifyTracksResponse;

    for (const item of data.tracks) {
      const original = batch.find((track) => track.id === item.id);

      if (!original) {
        continue;
      }

      hydratedTracks.set(item.id, {
        ...original,
        previewUrl: item.preview_url ?? original.previewUrl,
        playbackUrl: item.preview_url ?? original.playbackUrl,
        imageUrl: item.album.images[0]?.url ?? original.imageUrl,
      });
    }
  }

  return tracks.map((track) => hydratedTracks.get(track.id) ?? track);
}

export async function importSpotifyPlaylist(input: string, limit = 12) {
  const playlistId = extractSpotifyPlaylistId(input);

  if (!playlistId) {
    return {
      source: "demo" as const,
      platform: "Spotify" as const,
      tracks: searchLocalTracks(input, limit),
      message: "Enter a valid Spotify playlist link.",
    };
  }

  const token = await getSpotifyAccessToken();

  if (!token) {
    return {
      source: "demo" as const,
      platform: "Spotify" as const,
      tracks: searchLocalTracks(input, limit),
      message: "Spotify API credentials are missing, so demo tracks are shown.",
    };
  }

  const url = new URL(`https://api.spotify.com/v1/playlists/${playlistId}`);
  url.search = new URLSearchParams({
    fields:
      "name,tracks.items(track(id,name,duration_ms,preview_url,artists(name),album(name,images),external_urls.spotify))",
  }).toString();

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Spotify playlist import failed: ${response.status} ${message}`);
  }

  const data = (await response.json()) as SpotifyPlaylistResponse;

  return {
    source: "spotify" as const,
    platform: "Spotify" as const,
    playlistName: data.name,
    tracks: data.tracks.items
      .map((item) => item.track)
      .filter((track): track is SpotifyTrack => Boolean(track))
      .map(mapSpotifyTrack)
      .slice(0, limit),
  };
}
