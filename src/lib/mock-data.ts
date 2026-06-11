import type { Locale } from "@/i18n/config";

export type LocalizedText = Record<Locale, string>;

export type Platform = "Spotify" | "YouTube Music" | "Apple Music" | "Playlit";

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  platform: Platform;
};

export type Playlist = {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  owner: string;
  ownerHandle: string;
  tags: LocalizedText[];
  sourcePlatform: Platform;
  isPublic: boolean;
  saveCount: number;
  createdAt: string;
  cover: {
    base: string;
    accent: string;
  };
  trackIds: string[];
};

export const tracks: Track[] = [
  {
    id: "t-01",
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    duration: "4:03",
    platform: "Spotify",
  },
  {
    id: "t-02",
    title: "Ditto",
    artist: "NewJeans",
    album: "OMG",
    duration: "3:05",
    platform: "Spotify",
  },
  {
    id: "t-03",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    album: "Lover",
    duration: "2:58",
    platform: "Apple Music",
  },
  {
    id: "t-04",
    title: "Hype Boy",
    artist: "NewJeans",
    album: "New Jeans",
    duration: "2:59",
    platform: "YouTube Music",
  },
  {
    id: "t-05",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    duration: "2:47",
    platform: "Spotify",
  },
  {
    id: "t-06",
    title: "After LIKE",
    artist: "IVE",
    album: "After LIKE",
    duration: "2:57",
    platform: "Spotify",
  },
  {
    id: "t-07",
    title: "Seven",
    artist: "Jung Kook, Latto",
    album: "Seven",
    duration: "3:04",
    platform: "Spotify",
  },
  {
    id: "t-08",
    title: "Super Shy",
    artist: "NewJeans",
    album: "Get Up",
    duration: "2:34",
    platform: "YouTube Music",
  },
  {
    id: "t-09",
    title: "Good Days",
    artist: "SZA",
    album: "Good Days",
    duration: "4:39",
    platform: "Apple Music",
  },
  {
    id: "t-10",
    title: "ETA",
    artist: "NewJeans",
    album: "Get Up",
    duration: "2:31",
    platform: "Spotify",
  },
];

export const playlists: Playlist[] = [
  {
    id: "p-01",
    slug: "late-night-focus",
    title: {
      ko: "새벽 집중",
      en: "Late-night focus",
    },
    description: {
      ko: "과제 마감 전 조용하게 몰입할 때 듣기 좋은 곡들.",
      en: "Quiet tracks for locking in before a deadline.",
    },
    owner: "Doyeon",
    ownerHandle: "@doyeon",
    tags: [
      { ko: "새벽감성", en: "Late night" },
      { ko: "공부", en: "Study" },
      { ko: "차분함", en: "Calm" },
    ],
    sourcePlatform: "Spotify",
    isPublic: true,
    saveCount: 128,
    createdAt: "2026-06-01",
    cover: {
      base: "#133b5c",
      accent: "#f5b841",
    },
    trackIds: ["t-01", "t-09", "t-05", "t-03"],
  },
  {
    id: "p-02",
    slug: "exam-week-boost",
    title: {
      ko: "시험기간 부스터",
      en: "Exam week boost",
    },
    description: {
      ko: "졸릴 때 텐션을 올리는 K-pop 중심 플레이리스트.",
      en: "K-pop centered picks for keeping energy up while studying.",
    },
    owner: "Minseo",
    ownerHandle: "@minseo",
    tags: [
      { ko: "시험기간", en: "Exam week" },
      { ko: "에너지", en: "Energy" },
      { ko: "K-pop", en: "K-pop" },
    ],
    sourcePlatform: "YouTube Music",
    isPublic: true,
    saveCount: 92,
    createdAt: "2026-05-28",
    cover: {
      base: "#2563eb",
      accent: "#a7f3d0",
    },
    trackIds: ["t-02", "t-04", "t-06", "t-07", "t-08", "t-10"],
  },
  {
    id: "p-03",
    slug: "walk-home",
    title: {
      ko: "집 가는 길",
      en: "Walk home",
    },
    description: {
      ko: "버스 기다릴 때나 천천히 걸어갈 때 틀어두는 팝.",
      en: "Pop tracks for the bus stop and the walk home.",
    },
    owner: "Jin",
    ownerHandle: "@jin",
    tags: [
      { ko: "퇴근길", en: "Commute" },
      { ko: "팝", en: "Pop" },
      { ko: "가벼움", en: "Easy" },
    ],
    sourcePlatform: "Apple Music",
    isPublic: true,
    saveCount: 64,
    createdAt: "2026-05-20",
    cover: {
      base: "#7c2d12",
      accent: "#38bdf8",
    },
    trackIds: ["t-03", "t-05", "t-09"],
  },
  {
    id: "p-04",
    slug: "my-summer-draft",
    title: {
      ko: "여름 드라이브 초안",
      en: "Summer drive draft",
    },
    description: {
      ko: "아직 정리 중인 비공개 플레이리스트.",
      en: "A private draft playlist still being organized.",
    },
    owner: "Me",
    ownerHandle: "@me",
    tags: [
      { ko: "드라이브", en: "Drive" },
      { ko: "여름", en: "Summer" },
    ],
    sourcePlatform: "Playlit",
    isPublic: false,
    saveCount: 0,
    createdAt: "2026-06-07",
    cover: {
      base: "#334155",
      accent: "#22c55e",
    },
    trackIds: ["t-04", "t-05", "t-08"],
  },
];

export const searchResults = tracks.slice(0, 6);

export const importPreviewTracks = tracks.slice(1, 7);

export function getPlaylistTracks(playlist: Playlist) {
  return playlist.trackIds
    .map((trackId) => tracks.find((track) => track.id === trackId))
    .filter((track): track is Track => Boolean(track));
}

export function getPlaylistBySlug(slug: string) {
  return playlists.find((playlist) => playlist.slug === slug);
}

export function getPublicPlaylists() {
  return playlists.filter((playlist) => playlist.isPublic);
}

export function getCreatedPlaylists() {
  return playlists.filter((playlist) => playlist.ownerHandle === "@me");
}

export function getSavedPlaylists() {
  return playlists.filter(
    (playlist) => playlist.isPublic && playlist.ownerHandle !== "@me",
  );
}

export function getAllTags(locale: Locale) {
  return Array.from(
    new Set(playlists.flatMap((playlist) => playlist.tags.map((tag) => tag[locale]))),
  );
}
