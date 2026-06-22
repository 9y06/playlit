import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { ImportPanel } from "@/components/import-panel";

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

  return (
    <div className="reveal-in mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <ImportPanel dictionary={dictionary} />
    </div>
  );
}
