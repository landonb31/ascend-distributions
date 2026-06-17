export type UserRole = "artist" | "label" | "admin";
export type SubscriptionPlan = "free" | "standard" | "pro";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "incomplete";
export type ReleaseStatus = "draft" | "pending_review" | "approved" | "scheduled" | "live" | "rejected";
export type PayoutMethod = "paypal" | "bank_transfer";
export type PayoutStatus = "pending" | "processing" | "paid";
export type NotificationType =
  | "release_approved"
  | "release_rejected"
  | "payout_sent"
  | "new_follower"
  | "new_comment"
  | "new_like"
  | "system";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Profile {
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
}

export interface Artist {
  id: string;
  user_id: string;
  artist_name: string;
  spotify_id: string | null;
  apple_music_id: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  user_id: string;
  label_name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
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
}

export interface Release {
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
  reviewed_by: string | null;
  reviewed_at: string | null;
  total_streams: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
  tracks?: Track[];
}

export interface Track {
  id: string;
  release_id: string;
  user_id: string;
  title: string;
  artist_name: string;
  featuring_artists: string[] | null;
  track_number: number;
  duration_seconds: number | null;
  audio_url: string | null;
  audio_format: "wav" | "flac" | "mp3" | null;
  isrc: string | null;
  is_explicit: boolean;
  total_streams: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface Royalty {
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
}

export interface Payout {
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
}

export interface AnalyticsDaily {
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
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Post {
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
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

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

export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      artists: { Row: Artist; Insert: Partial<Artist>; Update: Partial<Artist> };
      labels: { Row: Label; Insert: Partial<Label>; Update: Partial<Label> };
      subscriptions: { Row: Subscription; Insert: Partial<Subscription>; Update: Partial<Subscription> };
      releases: { Row: Release; Insert: Partial<Release>; Update: Partial<Release> };
      tracks: { Row: Track; Insert: Partial<Track>; Update: Partial<Track> };
      royalties: { Row: Royalty; Insert: Partial<Royalty>; Update: Partial<Royalty> };
      payouts: { Row: Payout; Insert: Partial<Payout>; Update: Partial<Payout> };
      analytics_daily: { Row: AnalyticsDaily; Insert: Partial<AnalyticsDaily>; Update: Partial<AnalyticsDaily> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      posts: { Row: Post; Insert: Partial<Post>; Update: Partial<Post> };
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment> };
      likes: { Row: Like; Insert: Partial<Like>; Update: Partial<Like> };
      follows: { Row: Follow; Insert: Partial<Follow>; Update: Partial<Follow> };
    };
  };
}
