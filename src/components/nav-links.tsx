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
    <nav className="soft-inset flex gap-1 overflow-x-auto rounded-lg p-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={
            item.active
              ? "soft-control whitespace-nowrap rounded-md px-3 py-2 text-sm font-black text-[#111827]"
              : "whitespace-nowrap rounded-md px-3 py-2 text-sm font-bold text-[#6b7280] transition hover:bg-white/45 hover:text-[#111827]"
          }
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
