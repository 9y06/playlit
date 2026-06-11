import Link from "next/link";
import { notFound } from "next/navigation";
import { PlaylistCard } from "@/components/playlist-card";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getCreatedPlaylists, getSavedPlaylists } from "@/lib/mock-data";

type CollectionPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const created = getCreatedPlaylists();
  const saved = getSavedPlaylists();

  return (
    <div className="reveal-in mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-7 border-b border-[var(--line)] pb-6">
        <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
          {dictionary.collection.eyebrow}
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-normal sm:text-4xl">
              {dictionary.collection.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
              {dictionary.collection.description}
            </p>
          </div>
          <Link
            href={`/${locale}/create`}
            className="soft-primary inline-flex w-fit rounded-md px-4 py-2 text-sm font-bold transition"
          >
            {dictionary.nav.create}
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-black">{dictionary.collection.mine}</h2>
          <div className="grid gap-4">
            {created.map((playlist) => (
              <div key={playlist.id} className="space-y-2">
                <PlaylistCard
                  playlist={playlist}
                  locale={locale}
                  dictionary={dictionary}
                  compact
                />
                <div className="flex gap-2">
                  <button className="soft-control rounded-md px-3 py-2 text-xs font-bold transition">
                    {dictionary.common.edit}
                  </button>
                  <button className="soft-danger rounded-md px-3 py-2 text-xs font-bold transition">
                    {dictionary.common.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-black">
            {dictionary.collection.saved}
          </h2>
          <div className="grid gap-4">
            {saved.length > 0 ? (
              saved.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  locale={locale}
                  dictionary={dictionary}
                  compact
                />
              ))
            ) : (
              <p className="glass-card rounded-lg p-4 text-sm font-medium text-[var(--muted)]">
                {dictionary.collection.empty}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
