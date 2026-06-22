import type { Locale } from "./config";

const dictionaries = {
  ko: {
    app: {
      tagline: "플랫폼이 달라도 플레이리스트는 한 곳에서",
      signIn: "Google로 로그인",
      language: "EN",
    },
    nav: {
      explore: "탐색",
      collection: "내 컬렉션",
      create: "만들기",
      import: "이전",
    },
    common: {
      public: "공개",
      private: "비공개",
      tracks: "곡",
      saves: "저장",
      by: "by",
      save: "저장하기",
      saved: "저장됨",
      add: "추가",
      remove: "제거",
      loading: "불러오는 중",
      edit: "수정",
      delete: "삭제",
      preview: "미리보기",
      selected: "선택됨",
      source: "출처",
    },
    explore: {
      eyebrow: "Explore",
      title: "공개 플레이리스트 탐색",
      description:
        "최신 공개 플레이리스트를 태그와 분위기로 훑어보고 내 컬렉션에 저장하세요.",
      latest: "최신",
      popular: "인기",
      tagFilter: "태그 필터",
      featuredTitle: "오늘 많이 저장된 플레이리스트",
    },
    collection: {
      eyebrow: "Collection",
      title: "내 컬렉션",
      description:
        "직접 만든 플레이리스트와 저장한 플레이리스트를 한 화면에서 관리합니다.",
      mine: "내가 만든 플레이리스트",
      saved: "저장한 플레이리스트",
      empty: "아직 저장한 플레이리스트가 없습니다.",
    },
    create: {
      eyebrow: "Create",
      title: "플레이리스트 만들기",
      description:
        "Spotify 검색 결과에서 곡을 고르고 태그를 붙여 새 플레이리스트를 만듭니다.",
      details: "기본 정보",
      titleLabel: "제목",
      descriptionLabel: "설명",
      visibility: "공개 범위",
      tags: "태그",
      search: "곡 검색",
      searchPlaceholder: "곡명 또는 아티스트 검색",
      selectedTracks: "추가할 곡",
      liveMode: "실시간 연결",
      demoMode: "데모 모드",
      noResults: "검색 결과가 없습니다.",
      searchHint: "두 글자 이상 입력하면 Spotify를 검색합니다.",
      createButton: "플레이리스트 생성",
    },
    import: {
      eyebrow: "Import",
      title: "외부 플레이리스트 이전",
      description:
        "Spotify, YouTube Music, Apple Music 링크를 붙여넣고 Playlit 컬렉션으로 저장합니다.",
      linkLabel: "플레이리스트 링크",
      detect: "플랫폼 감지",
      detected: "감지된 플랫폼",
      previewTitle: "가져올 곡 미리보기",
      importButton: "Playlit에 저장",
      unsupported:
        "Apple Music은 현재 MusicKit 개발자 토큰이 필요해 데모 미리보기로 보여줍니다.",
    },
    detail: {
      back: "탐색으로 돌아가기",
      trackList: "곡 목록",
      about: "플레이리스트 정보",
      savedBy: "저장한 사람",
    },
  },
  en: {
    app: {
      tagline: "One home for playlists across platforms",
      signIn: "Sign in with Google",
      language: "KO",
    },
    nav: {
      explore: "Explore",
      collection: "Collection",
      create: "Create",
      import: "Import",
    },
    common: {
      public: "Public",
      private: "Private",
      tracks: "tracks",
      saves: "saves",
      by: "by",
      save: "Save",
      saved: "Saved",
      add: "Add",
      remove: "Remove",
      loading: "Loading",
      edit: "Edit",
      delete: "Delete",
      preview: "Preview",
      selected: "Selected",
      source: "Source",
    },
    explore: {
      eyebrow: "Explore",
      title: "Browse public playlists",
      description:
        "Find public playlists by mood and moment, then save them to your collection.",
      latest: "Latest",
      popular: "Popular",
      tagFilter: "Tag filters",
      featuredTitle: "Most saved today",
    },
    collection: {
      eyebrow: "Collection",
      title: "My collection",
      description:
        "Manage playlists you created and playlists saved from the public feed.",
      mine: "Created by me",
      saved: "Saved playlists",
      empty: "No saved playlists yet.",
    },
    create: {
      eyebrow: "Create",
      title: "Create a playlist",
      description:
        "Pick tracks from Spotify search results, add tags, and create a new playlist.",
      details: "Details",
      titleLabel: "Title",
      descriptionLabel: "Description",
      visibility: "Visibility",
      tags: "Tags",
      search: "Track search",
      searchPlaceholder: "Search by track or artist",
      selectedTracks: "Tracks to add",
      liveMode: "Live connected",
      demoMode: "Demo mode",
      noResults: "No tracks found.",
      searchHint: "Type at least two characters to search Spotify.",
      createButton: "Create playlist",
    },
    import: {
      eyebrow: "Import",
      title: "Import an external playlist",
      description:
        "Paste a Spotify, YouTube Music, or Apple Music link and save it to Playlit.",
      linkLabel: "Playlist link",
      detect: "Detect platform",
      detected: "Detected platform",
      previewTitle: "Import preview",
      importButton: "Save to Playlit",
      unsupported:
        "Apple Music currently needs a MusicKit developer token, so the demo preview is shown for now.",
    },
    detail: {
      back: "Back to explore",
      trackList: "Track list",
      about: "Playlist details",
      savedBy: "Saved by",
    },
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export type Dictionary = ReturnType<typeof getDictionary>;
