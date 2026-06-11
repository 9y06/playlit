import type { Platform } from "@/lib/mock-data";

type PlatformBadgeProps = {
  platform: Platform;
};

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  return (
    <span className="soft-chip inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold text-[#4b5563]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#9ca3af]" />
      {platform}
    </span>
  );
}
