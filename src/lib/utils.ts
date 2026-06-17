import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getRoyaltySplit(plan: string): number {
  switch (plan) {
    case "pro":
      return 100;
    case "standard":
      return 90;
    default:
      return 80;
  }
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "text-muted-foreground bg-muted",
    pending_review: "text-yellow-400 bg-yellow-400/10",
    approved: "text-blue-400 bg-blue-400/10",
    scheduled: "text-purple-400 bg-purple-400/10",
    live: "text-green-400 bg-green-400/10",
    rejected: "text-red-400 bg-red-400/10",
    pending: "text-yellow-400 bg-yellow-400/10",
    processing: "text-blue-400 bg-blue-400/10",
    paid: "text-green-400 bg-green-400/10",
  };
  return colors[status] || "text-muted-foreground bg-muted";
}

export function getStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const ACCEPTED_AUDIO_FORMATS = [".wav", ".flac", ".mp3"];
export const ACCEPTED_AUDIO_MIME_TYPES = [
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/mpeg",
  "audio/mp3",
];
export const MIN_ARTWORK_SIZE = 3000;
export const MIN_PAYOUT_AMOUNT = 1;

export const PLATFORMS = [
  "Spotify",
  "Apple Music",
  "YouTube Music",
  "TikTok",
  "Amazon Music",
  "Pandora",
  "Deezer",
] as const;

export const GENRES = [
  "Pop",
  "Hip-Hop",
  "R&B",
  "Rock",
  "Electronic",
  "Country",
  "Jazz",
  "Classical",
  "Latin",
  "Reggae",
  "Metal",
  "Indie",
  "Alternative",
  "Folk",
  "Blues",
  "World",
  "Other",
] as const;
