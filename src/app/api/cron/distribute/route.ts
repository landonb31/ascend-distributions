import { getCronSecret } from "@/lib/distribution/config";
import {
  processPendingDistributionJobs,
  queueReadyScheduledReleases,
} from "@/lib/distribution/process";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(request: Request) {
  const secret = getCronSecret();
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return apiError("Unauthorized", 401);
  }

  try {
    const queued = await queueReadyScheduledReleases();
    const processed = await processPendingDistributionJobs(10);

    return apiSuccess({
      queuedScheduledReleases: queued.length,
      processedJobs: processed,
    });
  } catch (error) {
    console.error("Distribution cron error:", error);
    return apiError("Distribution cron failed", 500);
  }
}
