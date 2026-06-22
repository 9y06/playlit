"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useSession, signOut } from "next-auth/react";
import { useToast } from "./toast";

type AuthButtonsProps = {
  alternateLocale: string;
  locale: "ko" | "en";
  signInLabel: string;
  languageLabel: string;
};

export function AuthButtons({
  alternateLocale,
  locale,
  signInLabel,
  languageLabel,
}: AuthButtonsProps) {
  const { data: session, status } = useSession();
  const { pushToast } = useToast();
  const previousStatus = useRef(status);

  useEffect(() => {
    if (previousStatus.current !== "authenticated" && status === "authenticated") {
      pushToast({
        tone: "success",
        title: locale === "ko" ? "로그인됐습니다" : "Logged in",
      });
    }

    previousStatus.current = status;
  }, [locale, pushToast, status]);

  async function handleSignOut() {
    pushToast({
      tone: "info",
      title: locale === "ko" ? "로그아웃했습니다" : "Signed out",
    });
    await signOut({ callbackUrl: window.location.href });
  }

  function handleSignIn() {
    void signIn("google", { callbackUrl: window.location.href });
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/${alternateLocale}`}
        className="soft-control rounded-md px-3 py-2 text-sm font-bold text-[#374151] transition"
      >
        {languageLabel}
      </Link>
      {status === "authenticated" && session?.user ? (
        <button
          type="button"
          onClick={handleSignOut}
          className="soft-control inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-[#17171a] transition"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full border border-[var(--line)] text-xs font-black">
            {session.user.name?.at(0)?.toUpperCase() ?? "G"}
          </span>
          <span>{session.user.name ?? session.user.email ?? "Account"}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSignIn}
          className="soft-control inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-[#17171a] transition"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full border border-[var(--line)] text-xs font-black">
            G
          </span>
          <span>{signInLabel}</span>
        </button>
      )}
    </div>
  );
}
