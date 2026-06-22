"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./toast";

type SavePlaylistButtonProps = {
  slug: string;
  label: string;
  doneLabel: string;
};

export function SavePlaylistButton({
  slug,
  label,
  doneLabel,
}: SavePlaylistButtonProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/playlists/${slug}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = (await response.json()) as
        | { ok: true; saved: true; message?: string }
        | { ok: false; message: string };

      if (!response.ok || !data.ok) {
        setError(!data.ok ? data.message : "Save failed.");
        return;
      }

      setSaved(true);
      pushToast({
        tone: "success",
        title: "플레이리스트를 저장했습니다.",
      });
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || saved}
        className="soft-primary rounded-md px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Loading" : saved ? doneLabel : label}
      </button>
      {error ? (
        <p className="text-xs font-medium text-[#8b1d1d]">{error}</p>
      ) : null}
    </div>
  );
}
