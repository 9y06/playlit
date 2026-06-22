import Link from "next/link";
import type { ReactNode } from "react";
import { getAlternateLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { NavLinks } from "./nav-links";
import { AuthButtons } from "./auth-buttons";

type AppShellProps = {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
};

export function AppShell({ locale, dictionary, children }: AppShellProps) {
  const alternateLocale = getAlternateLocale(locale);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="glass-bar sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/${locale}`}
              className="group flex min-w-0 items-center gap-3"
            >
              <span className="neumo-logo relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#111827] text-sm font-black text-white">
                <span className="absolute inset-x-2 top-2 h-px bg-white/35" />
                P
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-black leading-5 tracking-normal">
                  Playlit
                </span>
                <span className="block truncate text-xs font-medium text-[var(--muted)]">
                  {dictionary.app.tagline}
                </span>
              </span>
            </Link>

            <AuthButtons
              alternateLocale={alternateLocale}
              locale={locale}
              signInLabel={dictionary.app.signIn}
              languageLabel={dictionary.app.language}
            />
          </div>

          <NavLinks locale={locale} dictionary={dictionary} />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
