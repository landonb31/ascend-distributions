import type { Release, Track } from "@/types";

export type DistributionJobStatus = "pending" | "processing" | "delivered" | "failed";
export type PlatformDeliveryStatus =
  | "pending"
  | "submitted"
  | "processing"
  | "live"
  | "failed"
  | "rejected";

export type DistributionJob = {
  id: string;
  release_id: string;
  user_id: string;
  provider: string;
  status: DistributionJobStatus;
  external_product_id: string | null;
  error_message: string | null;
  attempts: number;
  max_attempts: number;
  metadata: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PlatformDelivery = {
  id: string;
  release_id: string;
  distribution_job_id: string | null;
  platform: string;
  external_dsp_id: string | null;
  status: PlatformDeliveryStatus;
  live_url: string | null;
  error_message: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReleasePackage = {
  release: Release;
  tracks: Track[];
  ownerEmail: string;
  audioFiles: Array<{
    trackId: string;
    path: string;
    buffer: Buffer;
    format: "wav" | "mp3" | "m4a" | "flac" | "aiff" | "wma";
    fileName: string;
  }>;
  artwork?: {
    url: string;
    buffer: Buffer;
    fileName: string;
  };
};

export type DistributionResult = {
  externalProductId: string;
  upc?: string;
  isrcs?: Record<string, string>;
  platformDeliveries: Array<{
    platform: string;
    externalDspId?: string;
    status: PlatformDeliveryStatus;
  }>;
};

export interface DistributionProvider {
  name: string;
  distribute(jobId: string, pkg: ReleasePackage): Promise<DistributionResult>;
}
