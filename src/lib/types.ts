// TypeScript mirrors of the Postgres schema (CampConnect-iOS/supabase/schema.sql)

export type UserRole = "camper" | "counselor" | "operator" | "parent";
export type ChallengeCategory = "outdoor" | "creative" | "reflection" | "tradition";
export type SubmissionFormat = "photo" | "video" | "text";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type SeasonChallengeStatus = "scheduled" | "active" | "closed";

export interface Camp {
  id: string;
  name: string;
  slug: string;
  primary_color: string | null;
  season_year: number;
}

export interface Profile {
  id: string;
  camp_id: string | null;
  role: UserRole;
  display_name: string;
  cabin: string | null;
  avatar_url: string | null;
  total_points: number;
  created_at: string;
}

export interface ChallengeTemplate {
  id: string;
  title: string;
  summary: string;
  category: ChallengeCategory;
  instructions: string;
  counselor_script: string;
  submission_format: SubmissionFormat;
  points: number;
}

export interface SeasonChallenge {
  id: string;
  camp_id: string;
  template_id: string;
  sequence_order: number;
  counselor_video_url: string | null; // storage path OR external URL (resolved in data layer)
  recap_video_url: string | null; // wrap-up video (resolved in data layer)
  release_at: string | null;
  due_at: string | null;
  status: SeasonChallengeStatus;
  template: ChallengeTemplate;
}

export type FeedItemType = "challenge" | "wrap_up" | "memory" | "announcement";

export interface FeedItem {
  id: string;
  camp_id: string;
  type: FeedItemType;
  title: string;
  caption: string | null;
  media_path: string | null;
  season_challenge_id: string | null;
  publish_at: string;
}

/** A resolved feed entry ready for the UI (signed/playable video URL). */
export interface FeedEntry {
  id: string;
  type: FeedItemType;
  title: string;
  caption: string | null;
  videoUrl: string | null;
  challengeId: string | null;
  publishAt: string;
}

export const FEED_TYPE_META: Record<FeedItemType, { label: string; emoji: string }> = {
  challenge: { label: "New challenge", emoji: "🎬" },
  wrap_up: { label: "Wrap-up", emoji: "🏁" },
  memory: { label: "Camp memory", emoji: "📼" },
  announcement: { label: "Announcement", emoji: "📣" },
};

export interface Submission {
  id: string;
  season_challenge_id: string;
  camper_id: string;
  content_type: SubmissionFormat;
  media_path: string | null;
  text_content: string | null;
  status: SubmissionStatus;
  created_at: string;
}

export interface Badge {
  id: string;
  camp_id: string | null;
  name: string;
  description: string;
  icon: string; // we map these to Ionicons names in the UI
}

export interface EarnedBadge {
  badge: Badge;
  awarded_at: string | null;
}

export const CATEGORY_META: Record<
  ChallengeCategory,
  { label: string; color: string; icon: string }
> = {
  outdoor: { label: "Outdoor", color: "#2E7D5B", icon: "leaf" },
  creative: { label: "Creative", color: "#8E5BB5", icon: "color-palette" },
  reflection: { label: "Reflection", color: "#3C7CE0", icon: "book" },
  tradition: { label: "Tradition", color: "#E08A3C", icon: "flame" },
};
