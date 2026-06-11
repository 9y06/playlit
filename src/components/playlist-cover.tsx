import type { Playlist } from "@/lib/mock-data";
import type { CSSProperties } from "react";

type PlaylistCoverProps = {
  playlist: Playlist;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-40 w-40 sm:h-52 sm:w-52",
};

export function PlaylistCover({ playlist, size = "md" }: PlaylistCoverProps) {
  const style = {
    "--cover-base": playlist.cover.base,
    "--cover-accent": playlist.cover.accent,
  } as CSSProperties;

  return (
    <div
      className={`${sizeClass[size]} cover-motion relative shrink-0 overflow-hidden rounded-lg bg-[#111827] shadow-[0_10px_28px_rgba(15,23,42,0.16)] ring-1 ring-black/5`}
      style={style}
      aria-hidden="true"
    >
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-black/15 p-1">
        <span className="rounded-[5px] bg-[var(--cover-base)]" />
        <span className="rounded-[5px] bg-[#f9fafb]" />
        <span className="rounded-[5px] bg-[#111827]" />
        <span className="rounded-[5px] bg-[var(--cover-accent)]" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_44%,rgba(0,0,0,0.18))]" />
      <div className="absolute inset-x-2 bottom-2 rounded-md bg-white/90 p-2 shadow-[0_8px_20px_rgba(15,23,42,0.18)] backdrop-blur">
        <span className="block text-[9px] font-black leading-none text-[#111827]">
          PLAYLIT
        </span>
        <span className="mt-1.5 block h-1 rounded-full bg-[#111827]" />
        <span className="mt-1 block h-1 w-2/3 rounded-full bg-[#9ca3af]" />
      </div>
      <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition duration-300 ease-[var(--ease-out)] group-hover:bg-black/10 group-hover:opacity-100">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/88 shadow-[var(--shadow-soft-sm)] backdrop-blur">
          <span className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-[#111827]" />
        </span>
      </div>
    </div>
  );
}
