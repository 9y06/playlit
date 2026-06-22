"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Playlist, Track } from "@/lib/mock-data";

type VinylPlayerProps = {
  playlist: Playlist;
  locale: Locale;
  currentTrack?: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
};

export function VinylPlayer({
  playlist,
  locale,
  currentTrack,
  isPlaying,
  onTogglePlay,
}: VinylPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const labels = {
    play: locale === "ko" ? "재생" : "Play",
    pause: locale === "ko" ? "일시정지" : "Pause",
    now: locale === "ko" ? "지금 재생" : "Now playing",
    unavailable: locale === "ko" ? "재생 소스 없음" : "No playback source",
  };
  const style = {
    "--cover-base": playlist.cover.base,
    "--cover-accent": playlist.cover.accent,
  } as CSSProperties;
  const playbackMode = (() => {
    const playbackUrl =
      currentTrack?.playbackUrl ??
      currentTrack?.previewUrl ??
      (currentTrack?.platform === "YouTube Music"
        ? currentTrack.externalUrl
        : undefined);

    if (playbackUrl) {
      if (
        currentTrack?.platform === "YouTube Music" ||
        playbackUrl.includes("youtube.com") ||
        playbackUrl.includes("youtu.be")
      ) {
        try {
          const parsed = new URL(playbackUrl);
          const videoId =
            parsed.hostname.includes("youtu.be")
              ? parsed.pathname.split("/").filter(Boolean)[0] ?? ""
              : parsed.searchParams.get("v") ?? "";

          if (videoId) {
            const start = parsed.searchParams.get("t") ?? parsed.searchParams.get("start");
            const startSeconds = start?.replace(/s$/, "") ?? "";

            return {
              type: "youtube" as const,
              url: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&controls=0&rel=0&modestbranding=1${
                startSeconds ? `&start=${startSeconds}` : ""
              }`,
            };
          }
        } catch {
          return { type: "none" as const, url: "" };
        }
      }

      return { type: "audio" as const, url: playbackUrl };
    }

    return { type: "none" as const, url: "" };
  })();

  useEffect(() => {
    const audio = audioRef.current;

    if (playbackMode.type === "audio") {
      if (!audio) {
        return;
      }

      audio.src = playbackMode.url;

      if (isPlaying) {
        void audio.play().catch(() => {
          audio.pause();
        });
      } else {
        audio.pause();
      }

      return;
    }

    if (playbackMode.type === "youtube") {
      return;
    }

    audio?.pause();
    if (audio) {
      audio.src = "";
    }
  }, [isPlaying, playbackMode]);

  return (
    <section className="glass-card-strong reveal-in rounded-lg p-4 sm:p-5">
      <div
        className="relative mx-auto aspect-square max-w-[20rem]"
        style={style}
        aria-hidden="true"
      >
        <div className="absolute left-1 top-6 z-10 h-[70%] w-[70%] overflow-hidden rounded-lg bg-[#111827] shadow-[18px_18px_36px_rgba(31,41,55,0.18),-10px_-10px_26px_rgba(255,255,255,0.7)] ring-1 ring-white/45">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-black/15 p-1.5">
            <span className="rounded-[6px] bg-[var(--cover-base)]" />
            <span className="rounded-[6px] bg-white/92" />
            <span className="rounded-[6px] bg-[#111827]" />
            <span className="rounded-[6px] bg-[var(--cover-accent)]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.28),rgba(255,255,255,0)_46%,rgba(0,0,0,0.2))]" />
          <div className="absolute bottom-3 left-3 right-3 rounded-md bg-white/86 p-2 backdrop-blur">
            <span className="block truncate text-[10px] font-black text-[#111827]">
              {playlist.title[locale]}
            </span>
            <span className="mt-2 block h-1 rounded-full bg-[#111827]" />
            <span className="mt-1 block h-1 w-2/3 rounded-full bg-[#9ca3af]" />
          </div>
        </div>

        <div
          className={`absolute right-2 top-8 h-[68%] w-[68%] rounded-full bg-[#111827] shadow-[16px_16px_34px_rgba(31,41,55,0.18),-10px_-10px_26px_rgba(255,255,255,0.68)] ring-1 ring-white/40 ${isPlaying ? "vinyl-spin" : ""}`}
        >
          <span className="absolute inset-[7%] rounded-full border border-white/10" />
          <span className="absolute inset-[18%] rounded-full border border-white/10" />
          <span className="absolute inset-[29%] rounded-full border border-white/10" />
          <span className="absolute inset-[40%] rounded-full bg-[var(--cover-accent)] ring-8 ring-white/8" />
          <span className="absolute inset-[47%] rounded-full bg-white" />
        </div>

        <div
          className={`absolute right-4 top-2 z-20 h-[58%] w-16 origin-[80%_8%] transition-transform duration-700 ease-[var(--ease-out)] ${isPlaying ? "tonearm-play" : "tonearm-rest"}`}
        >
          <span className="absolute right-0 top-0 h-5 w-5 rounded-full bg-white shadow-[var(--shadow-soft-sm)] ring-1 ring-white/70" />
          <span className="absolute right-2 top-4 h-[70%] w-2 rounded-full bg-[#d1d5db] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]" />
          <span className="absolute bottom-2 left-4 h-5 w-8 rounded-sm bg-[#111827] shadow-[var(--shadow-soft-sm)]" />
        </div>

        {playbackMode.type === "youtube" && isPlaying ? (
          <iframe
            title={currentTrack?.title ?? playlist.title[locale]}
            src={playbackMode.url}
            className="sr-only"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : null}

        {playbackMode.type === "audio" ? (
          <audio ref={audioRef} className="sr-only" preload="none" />
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
                <span className="equalizer-bar h-3 w-1 rounded-full bg-[#111827]" />
                <span className="equalizer-bar h-3 w-1 rounded-full bg-[#111827]" />
                <span className="equalizer-bar h-3 w-1 rounded-full bg-[#111827]" />
                <span className="equalizer-bar h-3 w-1 rounded-full bg-[#111827]" />
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-[#9ca3af]" />
            )}
            <p className="text-xs font-black uppercase text-[var(--muted)]">
              {labels.now}
            </p>
          </div>
          <p className="mt-1 truncate text-sm font-black">
            {currentTrack ? currentTrack.title : playlist.title[locale]}
          </p>
          {currentTrack ? (
            <p className="truncate text-xs font-semibold text-[var(--muted)]">
              {currentTrack.artist}
            </p>
          ) : null}
          {currentTrack && playbackMode.type === "none" ? (
            <p className="mt-1 text-xs font-semibold text-[#8b5e34]">
              {labels.unavailable}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          aria-pressed={isPlaying}
          onClick={onTogglePlay}
          disabled={playbackMode.type === "none"}
          className="soft-primary pressable shrink-0 rounded-full px-5 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPlaying ? labels.pause : labels.play}
        </button>
      </div>
    </section>
  );
}
