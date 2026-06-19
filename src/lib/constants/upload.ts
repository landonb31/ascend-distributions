export const UPLOAD_STORES = [
  { id: "spotify", name: "Spotify" },
  { id: "apple_music", name: "Apple Music" },
  { id: "itunes", name: "iTunes" },
  { id: "instagram_facebook", name: "Instagram & Facebook" },
  { id: "tiktok", name: "TikTok & ByteDance stores" },
  { id: "youtube_music", name: "YouTube Music" },
  { id: "amazon", name: "Amazon" },
  { id: "pandora", name: "Pandora" },
  { id: "deezer", name: "Deezer" },
  { id: "tidal", name: "Tidal" },
  { id: "iheartradio", name: "iHeartRadio" },
  { id: "qobuz", name: "Qobuz" },
  { id: "soundcloud", name: "SoundCloud" },
  { id: "snapchat", name: "Snapchat" },
] as const;

export type UploadStoreId = (typeof UPLOAD_STORES)[number]["id"];

export const DEFAULT_SELECTED_STORES: UploadStoreId[] = UPLOAD_STORES.map((s) => s.id);

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "other", label: "Other" },
] as const;

export const UPLOAD_TIPS = {
  artistName:
    "Only list your name, stage name, or band name. Don't include label names, \"Presents…\", or other artists without permission. No emojis — stores reject them.",
  songTitle:
    "Don't include featured artists here — add them below. No year/dates in the title. If it's a cover, don't include the original artist's name.",
  artwork:
    "Recommended: 3000×3000 JPG. No URLs, social handles, store logos, prices, or low-quality images. You must own all artwork rights.",
  releaseDate:
    "Set your release at least one week ahead for better playlist chances. Choose ASAP to go live as soon as stores process your release.",
  songwriter:
    "Enter real legal names, not stage names. Required for original songs you wrote or manage.",
} as const;

export const LEGAL_CHECKBOXES = [
  {
    id: "confirmAuthorized",
    label:
      "I recorded this music and am authorized to sell it in stores worldwide and collect all royalties.",
  },
  {
    id: "confirmNoUnauthorizedArtists",
    label:
      "I'm not using any other artist's name in my name, song titles, or album title without their approval.",
  },
  {
    id: "confirmNoPromoServices",
    label:
      "I won't use promo services that guarantee streams or playlisting — these often use bots that streaming services detect and penalize.",
  },
  {
    id: "confirmTerms",
    label: "I have read and agree to the Ascend Distributions terms of service.",
  },
] as const;

export const MAX_TRACK_COUNT = 35;

export function getTrackCountLabel(count: number) {
  if (count === 1) return "1 (Single)";
  return String(count);
}

export function getReleaseTypeLabel(trackCount: number) {
  if (trackCount <= 1) return "Single";
  if (trackCount <= 6) return "EP";
  return "Album";
}

export function getReleaseTypeHint(trackCount: number) {
  if (trackCount <= 1) return "One song — uses the track title on stores.";
  if (trackCount <= 6) return `${trackCount} songs — add a release title plus each track.`;
  return `${trackCount} songs — full album release.`;
}

export function buildTrackTitlePreview({
  title,
  featuringArtists,
  showFeaturedInTitle,
  versionType,
  versionInfo,
}: {
  title: string;
  featuringArtists: string[];
  showFeaturedInTitle: boolean;
  versionType: "normal" | "radio_edit" | "other";
  versionInfo?: string;
}) {
  let preview = title || "Song Title";
  if (showFeaturedInTitle && featuringArtists.length > 0) {
    preview += ` (feat. ${featuringArtists.join(", ")})`;
  }
  if (versionType === "radio_edit") {
    preview += " [Radio Edit]";
  } else if (versionType === "other" && versionInfo?.trim()) {
    preview += ` [${versionInfo.trim()}]`;
  }
  return preview;
}
