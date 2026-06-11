import { notFound } from "next/navigation";
import { PlatformBadge } from "@/components/platform-badge";
import { TrackList } from "@/components/track-list";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { importPreviewTracks, type Platform } from "@/lib/mock-data";

type ImportPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ImportPage({ params }: ImportPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const platforms: Platform[] = ["Spotify", "YouTube Music", "Apple Music"];

  return (
    <div className="reveal-in mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[24rem_minmax(0,1fr)] lg:px-8">
      <section className="glass-card-strong rounded-lg p-5">
        <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
          {dictionary.import.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-normal">
          {dictionary.import.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">
          {dictionary.import.description}
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold">{dictionary.import.linkLabel}</span>
            <input
              className="soft-input mt-2 w-full rounded-md px-3 py-2 outline-none transition"
              placeholder="https://open.spotify.com/playlist/..."
            />
          </label>

          <button className="soft-secondary w-full rounded-md px-4 py-3 text-sm font-black transition">
            {dictionary.import.detect}
          </button>

          <div>
            <p className="text-sm font-bold">{dictionary.import.detected}</p>
            <div className="mt-2 grid gap-2">
              {platforms.map((platform, index) => (
                <label
                  key={platform}
                  className="soft-chip flex items-center justify-between rounded-md px-3 py-2 text-sm font-bold"
                >
                  <PlatformBadge platform={platform} />
                  <input
                    type="radio"
                    name="platform"
                    defaultChecked={index === 0}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="min-w-0">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[var(--warm)]">
              {dictionary.common.preview}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {dictionary.import.previewTitle}
            </h2>
          </div>
          <button className="soft-primary rounded-md px-4 py-2 text-sm font-black transition">
            {dictionary.import.importButton}
          </button>
        </div>
        <TrackList tracks={importPreviewTracks} />
      </section>
    </div>
  );
}
