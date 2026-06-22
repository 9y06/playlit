"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type NavLinksProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function NavLinks({ locale, dictionary }: NavLinksProps) {
  const pathname = usePathname();
  const navItems = [
    {
      href: `/${locale}`,
      label: dictionary.nav.explore,
      active: pathname === `/${locale}` || pathname.startsWith(`/${locale}/playlist`),
    },
    {
      href: `/${locale}/collection`,
      label: dictionary.nav.collection,
      active: pathname.startsWith(`/${locale}/collection`),
    },
    {
      href: `/${locale}/create`,
      label: dictionary.nav.create,
      active: pathname.startsWith(`/${locale}/create`),
    },
    {
      href: `/${locale}/import`,
      label: dictionary.nav.import,
      active: pathname.startsWith(`/${locale}/import`),
    },
  ];

  return (
    <nav className="glass-card flex w-full items-stretch overflow-x-auto border-0 bg-white/55 px-2 py-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={
            item.active
              ? "nav-tab relative flex min-h-10 items-center whitespace-nowrap px-4 text-sm font-black text-[#111827]"
              : "nav-tab flex min-h-10 items-center whitespace-nowrap px-4 text-sm font-semibold text-[#6b7280] transition hover:text-[#111827]"
          }
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
