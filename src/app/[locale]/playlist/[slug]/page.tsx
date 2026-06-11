import Link from "next/link";
import { notFound } from "next/navigation";
import { PlatformBadge } from "@/components/platform-badge";
import { TrackList } from "@/components/track-list";
import { VinylPlayer } from "@/components/vinyl-player";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getPlaylistBySlug, getPlaylistTracks } from "@/lib/mock-data";

type PlaylistDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function PlaylistDetailPage({
  params,
}: PlaylistDetailPageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const playlist = getPlaylistBySlug(slug);

  if (!playlist) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const playlistTracks = getPlaylistTracks(playlist);

  return (
    <div className="reveal-in mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/${locale}`}
        className="text-sm font-bold text-[var(--accent-strong)]"
      >
        {dictionary.detail.back}
      </Link>

      <section className="mt-5 grid gap-6 border-b border-[var(--line)] pb-7 md:grid-cols-[auto_minmax(0,1fr)]">
        <VinylPlayer playlist={playlist} locale={locale} tracks={playlistTracks} />
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
            <button className="soft-primary rounded-md px-4 py-2 text-sm font-black transition">
              {dictionary.common.save}
            </button>
            <span className="text-sm font-semibold text-[var(--muted)]">
              {dictionary.common.by} {playlist.owner} · {playlistTracks.length}{" "}
              {dictionary.common.tracks} · {playlist.saveCount}{" "}
              {dictionary.common.saves}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-w-0">
          <h2 className="mb-3 text-xl font-black">{dictionary.detail.trackList}</h2>
          <TrackList tracks={playlistTracks} />
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
    </div>
  );
}
