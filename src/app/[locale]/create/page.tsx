import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { PlaylistComposer } from "@/components/playlist-composer";

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

      <PlaylistComposer dictionary={dictionary} locale={locale} initialTracks={[]} />
    </div>
  );
}
