export type DistributionProviderName = "fuga";

export const DEFAULT_PLATFORMS = [
  "Spotify",
  "Apple Music",
  "YouTube Music",
  "Amazon Music",
  "Tidal",
  "Deezer",
  "Pandora",
  "iHeartRadio",
] as const;

export function getDistributionProvider(): DistributionProviderName {
  const provider = process.env.DISTRIBUTION_PROVIDER?.toLowerCase();
  if (provider === "fuga") return "fuga";
  return "fuga";
}

export function isDistributionConfigured() {
  return Boolean(
    process.env.FUGA_API_URL &&
      process.env.FUGA_USERNAME &&
      process.env.FUGA_PASSWORD &&
      process.env.FUGA_LABEL_ID
  );
}

export function getFugaConfig() {
  return {
    apiUrl: (process.env.FUGA_API_URL || "https://next.fugamusic.com/api/v2").replace(
      /\/$/,
      ""
    ),
    username: process.env.FUGA_USERNAME || "",
    password: process.env.FUGA_PASSWORD || "",
    labelId: process.env.FUGA_LABEL_ID || "",
    defaultSubgenreId: Number(process.env.FUGA_DEFAULT_SUBGENRE_ID || "1"),
    deliveryDsps: (process.env.FUGA_DELIVERY_DSPS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  };
}

export function getCronSecret() {
  return process.env.CRON_SECRET || "";
}
