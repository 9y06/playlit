"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Track } from "@/lib/mock-data";
import { SpotifySearchPanel } from "./spotify-search-panel";
import { TrackList } from "./track-list";
import { useToast } from "./toast";

type PlaylistComposerProps = {
  dictionary: Dictionary;
  locale: string;
  initialTracks: Track[];
};

export function PlaylistComposer({
  dictionary,
  locale,
  initialTracks,
}: PlaylistComposerProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [selectedTracks, setSelectedTracks] = useState<Track[]>(initialTracks);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedTrackIds = useMemo(
    () => new Set(selectedTracks.map((track) => track.id)),
    [selectedTracks],
  );

  function handleAddTrack(track: Track) {
    setSelectedTracks((current) =>
      current.some((item) => item.id === track.id) ? current : [...current, track],
    );
  }

  function handleRemoveTrack(track: Track) {
    setSelectedTracks((current) => current.filter((item) => item.id !== track.id));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || selectedTracks.length === 0) {
      setMessage(dictionary.create.searchHint);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          tracks: selectedTracks,
          isPublic,
        }),
      });

      const data = (await response.json()) as
        | { ok: true; slug: string }
        | { ok: false; message: string };

      if (!response.ok || !data.ok) {
        setMessage(!data.ok ? data.message : "Create failed.");
        return;
      }

      pushToast({
        tone: "success",
        title: locale === "ko" ? "플레이리스트가 생성되었습니다." : "Playlist created.",
      });
      router.push(`/${locale}/playlist/${data.slug}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Create failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
      <section className="glass-card-strong rounded-lg p-5">
        <h2 className="text-lg font-black">{dictionary.create.details}</h2>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-bold">{dictionary.create.titleLabel}</span>
            <input
              className="soft-input mt-2 w-full rounded-md px-3 py-2 outline-none transition"
              placeholder="Late-night focus"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold">
              {dictionary.create.descriptionLabel}
            </span>
            <textarea
              className="soft-input mt-2 min-h-28 w-full resize-y rounded-md px-3 py-2 outline-none transition"
              placeholder="Mood, situation, or short memo"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <fieldset>
            <legend className="text-sm font-bold">
              {dictionary.create.visibility}
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="soft-chip flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold">
                <input
                  type="radio"
                  name="visibility"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
                {dictionary.common.public}
              </label>
              <label className="soft-chip flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold">
                <input
                  type="radio"
                  name="visibility"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
                {dictionary.common.private}
              </label>
            </div>
          </fieldset>
          <label className="block">
            <span className="text-sm font-bold">{dictionary.create.tags}</span>
            <input
              className="soft-input mt-2 w-full rounded-md px-3 py-2 outline-none transition"
              placeholder="study, calm, commute"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading || selectedTracks.length === 0}
            className="soft-primary w-full rounded-md px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? dictionary.common.loading : dictionary.create.createButton}
          </button>
          {message ? (
            <p className="rounded-md border border-white/60 bg-white/55 px-3 py-2 text-sm font-medium text-[var(--muted)]">
              {message}
            </p>
          ) : null}
        </div>
      </section>

      <section className="min-w-0 space-y-6">
        <SpotifySearchPanel dictionary={dictionary} onAddTrack={handleAddTrack} />

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">
              {dictionary.create.selectedTracks}
            </h2>
            <span className="text-xs font-semibold text-[var(--muted)]">
              {selectedTrackIds.size} {dictionary.common.tracks}
            </span>
          </div>
          {selectedTracks.length > 0 ? (
            <TrackList
              tracks={selectedTracks}
              actionLabel={dictionary.common.delete}
              onAction={handleRemoveTrack}
            />
          ) : (
            <div className="glass-card rounded-lg p-4 text-sm font-medium text-[var(--muted)]">
              {dictionary.create.searchHint}
            </div>
          )}
        </div>
      </section>
    </form>
  );
}
