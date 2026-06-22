"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Track } from "@/lib/mock-data";
import { searchLocalTracks } from "@/lib/mock-data";
import { TrackList } from "./track-list";

type SpotifySearchPanelProps = {
  dictionary: Dictionary;
  onAddTrack: (track: Track) => void;
};

type SearchResult = {
  tracks: Track[];
  source: "spotify" | "demo";
  message?: string;
};

export function SpotifySearchPanel({
  dictionary,
  onAddTrack,
}: SpotifySearchPanelProps) {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [source, setSource] = useState<"spotify" | "demo">("demo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizedQuery = query.trim();
  useEffect(() => {
    if (normalizedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/spotify/search?q=${encodeURIComponent(normalizedQuery)}&limit=8`,
          {
            signal: controller.signal,
          },
        );

        const data = (await response.json()) as SearchResult;
        setTracks(data.tracks);
        setSource(data.source);

        if (!response.ok && data.message) {
          setError(data.message);
        }
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Search failed.");
        setTracks(searchLocalTracks(normalizedQuery, 8));
        setSource("demo");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [normalizedQuery]);

  const visibleTracks = normalizedQuery.length < 2 ? [] : tracks;
  const visibleSource = normalizedQuery.length < 2 ? "demo" : source;
  const visibleLoading = normalizedQuery.length >= 2 && loading;
  const visibleError = normalizedQuery.length >= 2 ? error : null;

  return (
    <div className="glass-card-strong rounded-lg p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block flex-1">
          <span className="text-lg font-black">{dictionary.create.search}</span>
          <input
            className="soft-input mt-3 w-full rounded-md px-3 py-2 outline-none transition"
            placeholder={dictionary.create.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="soft-chip rounded-full px-3 py-2 text-xs font-bold">
            Spotify API
          </span>
          <span className="soft-chip rounded-full px-3 py-2 text-xs font-bold text-[#374151]">
            {visibleSource === "spotify"
              ? dictionary.create.liveMode
              : dictionary.create.demoMode}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-[var(--muted)]">
        <p>{dictionary.create.searchHint}</p>
        <p>
          {visibleLoading
            ? dictionary.common.loading
            : visibleError ?? `${visibleTracks.length} ${dictionary.common.tracks}`}
        </p>
      </div>

      <div className="mt-4">
        {visibleTracks.length > 0 ? (
          <TrackList
            tracks={visibleTracks}
            actionLabel={dictionary.common.add}
            onAction={onAddTrack}
          />
        ) : (
          <div className="glass-card rounded-lg p-4 text-sm font-medium text-[var(--muted)]">
            {normalizedQuery.length < 2
              ? dictionary.create.searchHint
              : dictionary.create.noResults}
          </div>
        )}
      </div>
    </div>
  );
}
