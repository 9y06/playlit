"use client";

import { useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Platform, Track } from "@/lib/mock-data";
import { importPreviewTracks } from "@/lib/mock-data";
import { PlatformBadge } from "./platform-badge";
import { TrackList } from "./track-list";
import { useToast } from "./toast";

type ImportSource = "spotify" | "youtube" | "apple" | "demo";

type ImportResponse = {
  tracks: Track[];
  source: ImportSource;
  platform?: Platform;
  playlistName?: string;
  message?: string;
};

type ImportPanelProps = {
  dictionary: Dictionary;
};

function detectPlatform(input: string): ImportSource {
  const normalized = input.trim().toLowerCase();

  if (normalized.includes("spotify.com")) {
    return "spotify";
  }

  if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) {
    return "youtube";
  }

  if (normalized.includes("music.apple.com")) {
    return "apple";
  }

  return "demo";
}

function platformLabel(platform: ImportSource) {
  if (platform === "spotify") return "Spotify";
  if (platform === "youtube") return "YouTube Music";
  if (platform === "apple") return "Apple Music";
  return "Playlit";
}

export function ImportPanel({ dictionary }: ImportPanelProps) {
  const { pushToast } = useToast();
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<ImportSource>("demo");
  const [tracks, setTracks] = useState<Track[]>(importPreviewTracks);
  const [playlistTitle, setPlaylistTitle] = useState("Imported playlist");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  const detectedPlatform = useMemo(() => {
    if (platform === "spotify") {
      return "Spotify" as const;
    }
    if (platform === "youtube") {
      return "YouTube Music" as const;
    }
    if (platform === "apple") {
      return "Apple Music" as const;
    }
    return "Playlit" as const;
  }, [platform]);

  async function handleDetect() {
    const nextPlatform = detectPlatform(url);
    setPlatform(nextPlatform);
    setLoading(true);
    setMessage(null);

    const endpoint =
      nextPlatform === "spotify"
        ? "/api/spotify/import"
        : nextPlatform === "youtube"
          ? "/api/youtube/import"
          : nextPlatform === "apple"
            ? "/api/apple/import"
          : null;

    if (!endpoint) {
      setTracks(importPreviewTracks);
      setMessage(
        nextPlatform === "apple"
          ? "Apple Music import needs a MusicKit developer token, so demo tracks are shown for now."
          : "Paste a playlist URL to preview tracks.",
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${endpoint}?url=${encodeURIComponent(url)}&limit=12`,
        { cache: "no-store" },
      );

      const data = (await response.json()) as ImportResponse;
      setTracks(data.tracks.length > 0 ? data.tracks : importPreviewTracks);
      setMessage(data.message ?? null);
      setPlatform(data.source);
      setPlaylistTitle(data.playlistName ?? `${platformLabel(data.source)} import`);
    } catch (error) {
      setTracks(importPreviewTracks);
      setMessage(error instanceof Error ? error.message : "Import failed.");
      setPlatform("demo");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    setSavedSlug(null);

    try {
      const response = await fetch("/api/playlists/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: playlistTitle,
          description: url,
          platform:
            platform === "spotify"
              ? "Spotify"
              : platform === "youtube"
                ? "YouTube Music"
                : platform === "apple"
                  ? "Apple Music"
                  : "Playlit",
          tracks,
          isPublic: true,
        }),
      });

      const data = (await response.json()) as
        | { ok: true; slug: string }
        | { ok: false; message: string };

      if (!response.ok || !data.ok) {
        setMessage(!data.ok ? data.message : "Save failed.");
        return;
      }

      setSavedSlug(data.slug);
      pushToast({
        tone: "success",
        title: "플레이리스트를 저장했습니다.",
      });
      setMessage("Saved to Playlit.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
      <section className="glass-card-strong rounded-lg p-5">
        <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
          {dictionary.import.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-normal">
          {dictionary.import.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">
          {dictionary.import.description}
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold">{dictionary.import.linkLabel}</span>
            <input
              className="soft-input mt-2 w-full rounded-md px-3 py-2 outline-none transition"
              placeholder="https://open.spotify.com/playlist/..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </label>

          <button
            type="button"
            onClick={handleDetect}
            className="soft-secondary w-full rounded-md px-4 py-3 text-sm font-black transition"
          >
            {loading ? dictionary.common.loading : dictionary.import.detect}
          </button>

          <div>
            <p className="text-sm font-bold">{dictionary.import.detected}</p>
            <div className="mt-2 grid gap-2">
              <div className="soft-chip flex items-center justify-between rounded-md px-3 py-2 text-sm font-bold">
                <PlatformBadge platform={detectedPlatform} />
                <span className="text-xs font-bold text-[var(--muted)]">
                  {platform === "demo" ? "Manual" : "Auto"}
                </span>
              </div>
            </div>
          </div>

          {message ? (
            <p className="rounded-md border border-white/60 bg-white/55 px-3 py-2 text-sm font-medium text-[var(--muted)]">
              {message}
            </p>
          ) : null}
        </div>
      </section>

      <section className="min-w-0">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[var(--warm)]">
              {dictionary.common.preview}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {dictionary.import.previewTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={tracks.length === 0 || saving}
            className="soft-primary rounded-md px-4 py-2 text-sm font-black transition"
          >
            {saving ? dictionary.common.loading : dictionary.import.importButton}
          </button>
        </div>
        <TrackList tracks={tracks} />
        {savedSlug ? (
          <p className="mt-3 rounded-md border border-white/60 bg-white/55 px-3 py-2 text-sm font-medium text-[var(--muted)]">
            Saved playlist: /ko/playlist/{savedSlug}
          </p>
        ) : null}
      </section>
    </div>
  );
}
