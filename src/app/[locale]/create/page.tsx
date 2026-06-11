import { notFound } from "next/navigation";
import { TrackList } from "@/components/track-list";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { searchResults } from "@/lib/mock-data";

type CreatePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function CreatePage({ params }: CreatePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const selectedTracks = searchResults.slice(0, 3);

  return (
    <div className="reveal-in mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-7 border-b border-[var(--line)] pb-6">
        <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
          {dictionary.create.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-normal sm:text-4xl">
          {dictionary.create.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
          {dictionary.create.description}
        </p>
      </section>

      <form className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <section className="glass-card-strong rounded-lg p-5">
          <h2 className="text-lg font-black">{dictionary.create.details}</h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-bold">{dictionary.create.titleLabel}</span>
              <input
                className="soft-input mt-2 w-full rounded-md px-3 py-2 outline-none transition"
                placeholder="Late-night focus"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold">
                {dictionary.create.descriptionLabel}
              </span>
              <textarea
                className="soft-input mt-2 min-h-28 w-full resize-y rounded-md px-3 py-2 outline-none transition"
                placeholder="Mood, situation, or short memo"
              />
            </label>
            <fieldset>
              <legend className="text-sm font-bold">
                {dictionary.create.visibility}
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="soft-chip flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold">
                  <input type="radio" name="visibility" defaultChecked />
                  {dictionary.common.public}
                </label>
                <label className="soft-chip flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold">
                  <input type="radio" name="visibility" />
                  {dictionary.common.private}
                </label>
              </div>
            </fieldset>
            <label className="block">
              <span className="text-sm font-bold">{dictionary.create.tags}</span>
              <input
                className="soft-input mt-2 w-full rounded-md px-3 py-2 outline-none transition"
                placeholder="study, calm, commute"
              />
            </label>
            <button
              type="button"
              className="soft-primary w-full rounded-md px-4 py-3 text-sm font-black transition"
            >
              {dictionary.create.createButton}
            </button>
          </div>
        </section>

        <section className="min-w-0 space-y-6">
          <div className="glass-card-strong rounded-lg p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <label className="block flex-1">
                <span className="text-lg font-black">{dictionary.create.search}</span>
                <input
                  className="soft-input mt-3 w-full rounded-md px-3 py-2 outline-none transition"
                  placeholder={dictionary.create.searchPlaceholder}
                />
              </label>
              <button
                type="button"
                className="soft-control rounded-md px-4 py-2 text-sm font-bold transition"
              >
                Spotify
              </button>
            </div>
            <div className="mt-4">
              <TrackList tracks={searchResults} actionLabel="Add" />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-black">
              {dictionary.create.selectedTracks}
            </h2>
            <TrackList tracks={selectedTracks} actionLabel={dictionary.common.delete} />
          </div>
        </section>
      </form>
    </div>
  );
}
