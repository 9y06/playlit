"use client";

import { useMemo, useState } from "react";
import { PlatformBadge } from "@/components/platform-badge";
import { SavePlaylistButton } from "@/components/save-playlist-button";
import { TrackList } from "@/components/track-list";
import { VinylPlayer } from "@/components/vinyl-player";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { Playlist, Track } from "@/lib/mock-data";

type PlaylistDetailClientProps = {
  playlist: Playlist;
  tracks: Track[];
  locale: Locale;
  dictionary: Dictionary;
};

export function PlaylistDetailClient({
  playlist,
  tracks,
  locale,
  dictionary,
}: PlaylistDetailClientProps) {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(
    tracks[0]?.id ?? null,
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? tracks[0] ?? null,
    [currentTrackId, tracks],
  );

  function handlePlayTrack(track: Track) {
    setCurrentTrackId(track.id);
    setIsPlaying(true);
  }

  function handleTogglePlay() {
    if (!currentTrack && tracks.length > 0) {
      setCurrentTrackId(tracks[0].id);
    }

    setIsPlaying((current) => !current);
  }

  return (
    <>
      <section className="mt-5 grid gap-6 border-b border-[var(--line)] pb-7 md:grid-cols-[auto_minmax(0,1fr)]">
        <VinylPlayer
          playlist={playlist}
          locale={locale}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
        />
        <div className="min-w-0 self-end">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformBadge platform={playlist.sourcePlatform} />
            <span className="soft-chip rounded-md px-2 py-1 text-xs font-bold text-[#575750]">
              {playlist.isPublic
                ? dictionary.common.public
                : dictionary.common.private}
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-5xl">
            {playlist.title[locale]}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            {playlist.description[locale]}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {playlist.tags.map((tag) => (
              <span
                key={tag[locale]}
                className="soft-chip rounded-md px-3 py-2 text-sm font-bold"
              >
                {tag[locale]}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <SavePlaylistButton
              slug={playlist.slug}
              label={dictionary.common.save}
              doneLabel={dictionary.common.saved}
            />
            <span className="text-sm font-semibold text-[var(--muted)]">
              {dictionary.common.by} {playlist.owner} · {tracks.length}{" "}
              {dictionary.common.tracks} · {playlist.saveCount}{" "}
              {dictionary.common.saves}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-w-0">
          <h2 className="mb-3 text-xl font-black">{dictionary.detail.trackList}</h2>
          <TrackList
            tracks={tracks}
            activeTrackId={currentTrack?.id ?? null}
            onPlayTrack={handlePlayTrack}
          />
        </section>

        <aside className="glass-card rounded-lg p-4">
          <h2 className="text-sm font-black">{dictionary.detail.about}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-bold text-[var(--muted)]">
                {dictionary.common.source}
              </dt>
              <dd className="mt-1 font-black">{playlist.sourcePlatform}</dd>
            </div>
            <div>
              <dt className="font-bold text-[var(--muted)]">
                {dictionary.detail.savedBy}
              </dt>
              <dd className="mt-1 font-black">
                {playlist.saveCount} {dictionary.common.saves}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}
