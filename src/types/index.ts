import type { DistributionJob, PlatformDelivery } from "@/lib/distribution/types";
import type { AudioFormat } from "@/lib/utils";

export type UserRole = "artist" | "label" | "admin";
export type SubscriptionPlan = "free" | "standard" | "pro";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "incomplete";
export type ReleaseStatus = "draft" | "pending_review" | "approved" | "scheduled" | "live" | "rejected";
export type PayoutMethod = "paypal" | "bank_transfer";
export type PayoutStatus = "pending" | "processing" | "paid";
export type NotificationType =
  | "release_approved"
  | "release_rejected"
  | "release_live"
  | "distribution_failed"
  | "payout_sent"
  | "new_follower"
  | "new_comment"
  | "new_like"
  | "system";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  social_links: Record<string, string>;
  is_public: boolean;
  follower_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
};

export type Artist = {
  id: string;
  user_id: string;
  artist_name: string;
  spotify_id: string | null;
  apple_music_id: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type Label = {
  id: string;
  user_id: string;
  label_name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export type Release = {
  id: string;
  user_id: string;
  artist_id: string | null;
  label_id: string | null;
  title: string;
  album: string | null;
  genre: string | null;
  release_date: string | null;
  scheduled_date: string | null;
  artwork_url: string | null;
  upc: string | null;
  status: ReleaseStatus;
  rejection_reason: string | null;
  external_product_id: string | null;
  distributed_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  total_streams: number;
  total_revenue: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  tracks?: Track[];
};

export type ReleaseWithTracks = Release & { tracks?: Track[] };

export type Track = {
  id: string;
  release_id: string;
  user_id: string;
  title: string;
  artist_name: string;
  featuring_artists: string[] | null;
  track_number: number;
  duration_seconds: number | null;
  audio_url: string | null;
  audio_format: AudioFormat | null;
  isrc: string | null;
  is_explicit: boolean;
  total_streams: number;
  total_revenue: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Royalty = {
  id: string;
  user_id: string;
  track_id: string | null;
  release_id: string | null;
  platform: string;
  amount: number;
  streams: number;
  period_start: string;
  period_end: string;
  royalty_split: number;
  artist_share: number;
  status: "pending" | "paid";
  created_at: string;
};

export type Payout = {
  id: string;
  user_id: string;
  amount: number;
  method: PayoutMethod;
  status: PayoutStatus;
  paypal_email: string | null;
  bank_details: Record<string, string> | null;
  processed_at: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AnalyticsDaily = {
  id: string;
  user_id: string;
  track_id: string | null;
  release_id: string | null;
  date: string;
  streams: number;
  revenue: number;
  platform: string | null;
  country: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  release_id: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  user_liked?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
};

export type Like = {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
};

export type Follow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
};

export interface DashboardStats {
  totalStreams: number;
  estimatedRevenue: number;
  monthlyGrowth: number;
  activeReleases: number;
  upcomingReleases: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  royaltySplit: string;
  features: string[];
  popular?: boolean;
}

export interface UploadMetadata {
  title: string;
  artistName: string;
  featuringArtists?: string[];
  album?: string;
  genre: string;
  releaseDate: string;
  isExplicit: boolean;
  upc?: string;
  isrc?: string;
}

type DbTable<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

// Empty Supabase schema sections — must not use Record<string, never> (breaks table inference).
type SupabaseEmptySection = Record<string, never>;

export interface Database {
  public: {
    Tables: {
      users: DbTable<User>;
      profiles: DbTable<Profile>;
      artists: DbTable<Artist>;
      labels: DbTable<Label>;
      subscriptions: DbTable<Subscription>;
      releases: DbTable<Omit<Release, "tracks">>;
      tracks: DbTable<Track>;
      royalties: DbTable<Royalty>;
      payouts: DbTable<Payout>;
      analytics_daily: DbTable<AnalyticsDaily>;
      notifications: DbTable<Notification>;
      posts: DbTable<Omit<Post, "profile" | "user_liked">>;
      comments: DbTable<Omit<Comment, "profile">>;
      likes: DbTable<Like>;
      follows: DbTable<Follow>;
      distribution_jobs: DbTable<DistributionJob>;
      platform_deliveries: DbTable<PlatformDelivery>;
    };
    Views: SupabaseEmptySection;
    Functions: SupabaseEmptySection;
  };
}
