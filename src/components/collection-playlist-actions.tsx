"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Playlist } from "@/lib/mock-data";
import { useToast } from "./toast";

type CollectionPlaylistActionsProps = {
  playlist: Playlist;
  locale: Locale;
};

function parseVisibility(input: string | null) {
  const normalized = input?.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (["public", "공개", "yes", "y", "true", "1"].includes(normalized)) {
    return true;
  }

  if (["private", "비공개", "no", "n", "false", "0"].includes(normalized)) {
    return false;
  }

  return null;
}

export function CollectionPlaylistActions({
  playlist,
  locale,
}: CollectionPlaylistActionsProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function handleEdit() {
    if (busy) {
      return;
    }

    const nextTitle = window.prompt(
      locale === "ko" ? "플레이리스트 제목" : "Playlist title",
      playlist.title[locale],
    );

    if (nextTitle === null) {
      return;
    }

    const trimmedTitle = nextTitle.trim();

    if (!trimmedTitle) {
      pushToast({
        tone: "error",
        title: locale === "ko" ? "제목이 비어 있습니다" : "Title is empty",
      });
      return;
    }

    const nextDescription = window.prompt(
      locale === "ko" ? "플레이리스트 설명" : "Playlist description",
      playlist.description[locale],
    );

    if (nextDescription === null) {
      return;
    }

    const nextTags = window.prompt(
      locale === "ko"
        ? "태그를 쉼표로 구분해 입력하세요"
        : "Enter tags separated by commas",
      playlist.tags.map((tag) => tag[locale]).join(", "),
    );

    if (nextTags === null) {
      return;
    }

    const nextVisibility = window.prompt(
      locale === "ko"
        ? "공개 여부를 입력하세요 (public / private)"
        : "Enter visibility (public / private)",
      playlist.isPublic ? "public" : "private",
    );

    if (nextVisibility === null) {
      return;
    }

    const isPublic = parseVisibility(nextVisibility);

    if (isPublic === null) {
      pushToast({
        tone: "error",
        title:
          locale === "ko"
            ? "공개 여부는 public 또는 private로 입력하세요"
            : "Use public or private for visibility",
      });
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(`/api/playlists/${playlist.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: nextDescription.trim(),
          tags: nextTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          isPublic,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message ?? "Failed to update playlist.");
      }

      pushToast({
        tone: "success",
        title: locale === "ko" ? "플레이리스트를 수정했습니다" : "Playlist updated",
      });
      router.refresh();
    } catch (error) {
      pushToast({
        tone: "error",
        title: locale === "ko" ? "수정에 실패했습니다" : "Failed to update",
        description:
          error instanceof Error ? error.message : "Unknown error occurred.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy) {
      return;
    }

    const confirmed = window.confirm(
      locale === "ko"
        ? "이 플레이리스트를 삭제할까요?"
        : "Delete this playlist?",
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(`/api/playlists/${playlist.slug}`, {
        method: "DELETE",
      });

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message ?? "Failed to delete playlist.");
      }

      pushToast({
        tone: "success",
        title: locale === "ko" ? "플레이리스트를 삭제했습니다" : "Playlist deleted",
      });
      router.refresh();
    } catch (error) {
      pushToast({
        tone: "error",
        title: locale === "ko" ? "삭제에 실패했습니다" : "Failed to delete",
        description:
          error instanceof Error ? error.message : "Unknown error occurred.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2 pl-1">
      <button
        type="button"
        onClick={handleEdit}
        disabled={busy}
        className="soft-control rounded-md px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {locale === "ko" ? "수정" : "Edit"}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="soft-danger rounded-md px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {locale === "ko" ? "삭제" : "Delete"}
      </button>
    </div>
  );
}
