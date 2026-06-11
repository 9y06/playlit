import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getPlaylistTracks, type Playlist } from "@/lib/mock-data";
import { PlatformBadge } from "./platform-badge";
import { PlaylistCover } from "./playlist-cover";

type PlaylistCardProps = {
  playlist: Playlist;
  locale: Locale;
  dictionary: Dictionary;
  compact?: boolean;
};

export function PlaylistCard({
  playlist,
  locale,
  dictionary,
  compact = false,
}: PlaylistCardProps) {
  const trackCount = getPlaylistTracks(playlist).length;

  return (
    <article className="glass-card interactive-lift reveal-in group rounded-lg p-4 hover:bg-white/82 hover:shadow-[18px_18px_38px_rgba(163,174,194,0.28),-18px_-18px_38px_rgba(255,255,255,0.74)]">
      <Link
        href={`/${locale}/playlist/${playlist.slug}`}
        className="flex min-w-0 gap-4"
      >
        <PlaylistCover playlist={playlist} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformBadge platform={playlist.sourcePlatform} />
            <span className="soft-chip rounded-md px-2 py-1 text-xs font-bold text-[#575750]">
              {playlist.isPublic
                ? dictionary.common.public
                : dictionary.common.private}
            </span>
          </div>
          <h2 className="mt-3 truncate text-lg font-black group-hover:text-[#030712]">
            {playlist.title[locale]}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
            {playlist.description[locale]}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {playlist.tags.slice(0, compact ? 2 : 3).map((tag) => (
              <span
                key={tag[locale]}
                className="soft-chip rounded-md px-2 py-1 text-xs font-bold text-[#4c4c46]"
              >
                {tag[locale]}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--muted)]">
            <span>
              {dictionary.common.by} {playlist.owner}
            </span>
            <span className="h-1 w-1 rounded-full bg-[#d1d5db]" />
            <span>
              {trackCount} {dictionary.common.tracks}
            </span>
            <span className="h-1 w-1 rounded-full bg-[#d1d5db]" />
            <span>
              {playlist.saveCount} {dictionary.common.saves}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
