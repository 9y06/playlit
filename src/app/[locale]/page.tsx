import { notFound } from "next/navigation";
import { PlaylistCard } from "@/components/playlist-card";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getAllTags, getExplorePlaylists, getFeaturedPlaylist } from "@/server/playlists";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ExplorePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ExplorePage({ params }: ExplorePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const playlists = await getExplorePlaylists();
  const tags = await getAllTags(locale);
  const featured = await getFeaturedPlaylist();

  return (
    <div className="reveal-in mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:px-8">
      <section className="min-w-0">
        <div className="mb-6 border-b border-[var(--line)] pb-6">
          <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
            {dictionary.explore.eyebrow}
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-normal sm:text-4xl">
                {dictionary.explore.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                {dictionary.explore.description}
              </p>
            </div>
            <div className="soft-inset flex rounded-lg p-1">
              <button className="soft-primary rounded-md px-4 py-2 text-sm font-bold">
                {dictionary.explore.latest}
              </button>
              <button className="rounded-md px-4 py-2 text-sm font-bold text-[#55554f]">
                {dictionary.explore.popular}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              locale={locale}
              dictionary={dictionary}
            />
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="glass-card rounded-lg p-4">
          <h2 className="text-sm font-black">{dictionary.explore.tagFilter}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                className="soft-control rounded-md px-3 py-2 text-sm font-bold text-[#3f3f3a] transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {featured ? (
          <section className="dark-glass-card rounded-lg p-4 text-white">
            <p className="text-xs font-black uppercase text-[#dbeafe]">
              {dictionary.explore.featuredTitle}
            </p>
            <h2 className="mt-3 text-xl font-black">{featured.title[locale]}</h2>
            <p className="mt-2 text-sm leading-6 text-white/72">
              {featured.description[locale]}
            </p>
            <p className="mt-4 text-sm font-bold">
              {featured.saveCount} {dictionary.common.saves}
            </p>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
