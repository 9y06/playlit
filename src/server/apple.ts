import "server-only";

import { importPreviewTracks } from "@/lib/mock-data";

function extractAppleMusicUrl(input: string) {
  try {
    const url = new URL(input);
    return url.hostname.includes("music.apple.com") ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function importAppleMusicPlaylist(input: string) {
  const url = extractAppleMusicUrl(input);

  if (!url) {
    return {
      source: "demo" as const,
      platform: "Apple Music" as const,
      tracks: importPreviewTracks,
      message: "Enter a valid Apple Music link.",
    };
  }

  return {
    source: "demo" as const,
    platform: "Apple Music" as const,
    tracks: importPreviewTracks,
    message:
      "Apple Music catalog access needs MusicKit developer token details, so demo tracks are shown for now.",
  };
}
