"use client";

import { useState } from "react";
import type { Track } from "@/lib/mock-data";

type TrackListProps = {
  tracks: Track[];
  actionLabel?: string;
};

function TrackArtwork({ track }: { track: Track }) {
  const initial = track.title.at(0)?.toUpperCase() ?? "P";

  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-[#111827] shadow-[6px_6px_14px_rgba(163,174,194,0.24),-4px_-4px_12px_rgba(255,255,255,0.7)] ring-1 ring-black/5">
      <span className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_48%)]" />
      <span className="absolute right-1 top-1 h-4 w-4 rounded-sm bg-white/18" />
      <span className="absolute bottom-1 left-1 grid h-5 w-5 place-items-center rounded-sm bg-white text-[10px] font-black text-[#111827]">
        {initial}
      </span>
    </div>
  );
}

export function TrackList({ tracks, actionLabel }: TrackListProps) {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  return (
    <div className="glass-card overflow-hidden rounded-lg">
      <ol className="divide-y divide-white/55">
        {tracks.map((track, index) => {
          const isPlaying = playingTrackId === track.id;

          return (
            <li
              key={track.id}
              className={`group grid grid-cols-[2rem_2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition duration-300 ease-[var(--ease-out)] hover:bg-white/45 ${
                isPlaying ? "bg-white/55" : ""
              }`}
            >
              <button
                type="button"
                aria-label={`${track.title} play`}
                aria-pressed={isPlaying}
                onClick={() =>
                  setPlayingTrackId((current) =>
                    current === track.id ? null : track.id,
                  )
                }
                className={`pressable grid h-8 w-8 place-items-center rounded-full text-xs font-black transition ${
                  isPlaying
                    ? "soft-primary text-white"
                    : "text-[var(--muted)] group-hover:bg-white/70 group-hover:text-[#111827]"
                }`}
              >
                {isPlaying ? (
                  <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
                    <span className="equalizer-bar h-3 w-1 rounded-full bg-current" />
                    <span className="equalizer-bar h-3 w-1 rounded-full bg-current" />
                    <span className="equalizer-bar h-3 w-1 rounded-full bg-current" />
                  </span>
                ) : (
                  <span>{String(index + 1).padStart(2, "0")}</span>
                )}
              </button>
              <TrackArtwork track={track} />
              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-black transition-colors ${
                    isPlaying ? "text-[#030712]" : ""
                  }`}
                >
                  {track.title}
                </p>
                <p className="truncate text-xs font-medium text-[var(--muted)]">
                  {track.artist} · {track.album}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs font-bold text-[var(--muted)] sm:block">
                  {track.platform}
                </span>
                <span className="text-xs font-bold text-[var(--muted)]">
                  {track.duration}
                </span>
                {actionLabel ? (
                  <button className="soft-control pressable rounded-md px-3 py-1.5 text-xs font-bold transition">
                    {actionLabel}
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
