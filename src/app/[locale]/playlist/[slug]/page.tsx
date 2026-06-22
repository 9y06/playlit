import Link from "next/link";
import { notFound } from "next/navigation";
import { PlaylistDetailClient } from "@/components/playlist-detail-client";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getPlaylistBySlug, getPlaylistTracksBySlug } from "@/server/playlists";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const playlist = await getPlaylistBySlug(slug);

  if (!playlist) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const playlistTracks = await getPlaylistTracksBySlug(slug);

  return (
    <div className="reveal-in mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/${locale}`}
        className="text-sm font-bold text-[var(--accent-strong)]"
      >
        {dictionary.detail.back}
      </Link>

      <PlaylistDetailClient
        playlist={playlist}
        tracks={playlistTracks}
        locale={locale}
        dictionary={dictionary}
      />
    </div>
  );
}
