import type { DistributionJob, PlatformDelivery } from "@/lib/distribution/types";
import type { Release } from "@/types";

export function getDistributionStatusLabel(
  release: Release,
  job?: DistributionJob | null
) {
  if (release.status === "live") return "Live on stores";
  if (release.status === "scheduled") return "Scheduled for delivery";
  if (job?.status === "processing") return "Delivering to stores…";
  if (job?.status === "pending") return "Queued for delivery";
  if (job?.status === "failed") return "Delivery failed";
  if (release.status === "approved") return "Delivering to stores…";
  if (release.status === "pending_review") return "Delivering to stores…";
  if (release.status === "rejected") return "Needs changes";
  return "Draft";
}

export function summarizePlatformDeliveries(deliveries: PlatformDelivery[]) {
  const live = deliveries.filter((d) => d.status === "live").length;
  if (live === 0) return null;
  return `${live} platform${live === 1 ? "" : "s"} live`;
}
