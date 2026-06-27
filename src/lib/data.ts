import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "./supabase";
import type {
  Badge,
  Camp,
  EarnedBadge,
  Profile,
  SeasonChallenge,
  Submission,
  SubmissionFormat,
} from "./types";

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Not signed in");
  return id;
}

export async function fetchMyProfile(): Promise<Profile> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

/** Update the camper's own display name and/or avatar photo. */
export async function updateProfile(opts: {
  displayName?: string;
  avatarUri?: string | null;
}): Promise<void> {
  const userId = await requireUserId();
  const patch: Record<string, unknown> = {};

  if (opts.displayName !== undefined) patch.display_name = opts.displayName;

  if (opts.avatarUri) {
    const ext = opts.avatarUri.split(".").pop()?.split("?")[0] || "jpg";
    const path = `${userId}/avatar.${ext}`;
    const base64 = await FileSystem.readAsStringAsync(opts.avatarUri, { encoding: "base64" });
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, decode(base64), { contentType: `image/${ext}`, upsert: true });
    if (upErr) throw upErr;
    patch.avatar_url = path;
  }

  if (Object.keys(patch).length === 0) return;
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

/** Resolve a stored avatar path into a displayable signed URL. */
export async function resolveAvatarUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export async function fetchCamp(id: string): Promise<Camp> {
  const { data, error } = await supabase.from("camps").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Camp;
}

/** Active challenges for the camper's camp, with counselor videos resolved to playable URLs. */
export async function fetchActiveChallenges(): Promise<SeasonChallenge[]> {
  const { data, error } = await supabase
    .from("season_challenges")
    .select("*, template:challenge_templates(*)")
    .eq("status", "active")
    .order("sequence_order", { ascending: true });
  if (error) throw error;

  const challenges = (data as SeasonChallenge[]) ?? [];
  await Promise.all(
    challenges.map(async (c) => {
      const v = c.counselor_video_url;
      if (v && !v.startsWith("http")) {
        const { data: signed } = await supabase.storage
          .from("counselor-videos")
          .createSignedUrl(v, 60 * 60);
        c.counselor_video_url = signed?.signedUrl ?? null;
      }
    })
  );
  return challenges;
}

/** A single challenge by id, with its counselor video resolved to a playable URL. */
export async function fetchChallengeById(id: string): Promise<SeasonChallenge> {
  const { data, error } = await supabase
    .from("season_challenges")
    .select("*, template:challenge_templates(*)")
    .eq("id", id)
    .single();
  if (error) throw error;

  const c = data as SeasonChallenge;
  if (c.counselor_video_url && !c.counselor_video_url.startsWith("http")) {
    const { data: signed } = await supabase.storage
      .from("counselor-videos")
      .createSignedUrl(c.counselor_video_url, 60 * 60);
    c.counselor_video_url = signed?.signedUrl ?? null;
  }
  return c;
}

/** The current camper's submission for one challenge, if any. */
export async function fetchSubmissionFor(challengeId: string): Promise<Submission | null> {
  const userId = await requireUserId();
  const { data } = await supabase
    .from("submissions")
    .select("*")
    .eq("season_challenge_id", challengeId)
    .eq("camper_id", userId)
    .maybeSingle();
  return (data as Submission) ?? null;
}

export async function fetchMySubmissions(): Promise<Submission[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("camper_id", userId);
  if (error) throw error;
  return (data as Submission[]) ?? [];
}

/** Upload optional media to the submissions bucket, then insert the submission row. */
export async function submitChallenge(opts: {
  challengeId: string;
  contentType: SubmissionFormat;
  text?: string | null;
  mediaUri?: string | null;
}): Promise<Submission> {
  const userId = await requireUserId();

  let mediaPath: string | null = null;
  if (opts.mediaUri) {
    const ext = opts.mediaUri.split(".").pop()?.split("?")[0] || (opts.contentType === "video" ? "mov" : "jpg");
    const path = `${userId}/${opts.challengeId}.${ext}`;
    const base64 = await FileSystem.readAsStringAsync(opts.mediaUri, { encoding: "base64" });
    const contentType = opts.contentType === "video" ? `video/${ext}` : `image/${ext}`;
    const { error: upErr } = await supabase.storage
      .from("submissions")
      .upload(path, decode(base64), { contentType, upsert: true });
    if (upErr) throw upErr;
    mediaPath = path;
  }

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      season_challenge_id: opts.challengeId,
      camper_id: userId,
      content_type: opts.contentType,
      media_path: mediaPath,
      text_content: opts.text ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Submission;
}

/** All badges available to the camper + whether/when they earned each. */
export async function fetchBadges(): Promise<EarnedBadge[]> {
  const userId = await requireUserId();
  const [{ data: badges }, { data: awards }] = await Promise.all([
    supabase.from("badges").select("*").order("created_at", { ascending: true }),
    supabase.from("badge_awards").select("badge_id, awarded_at").eq("camper_id", userId),
  ]);

  const awardedAt = new Map<string, string>();
  (awards ?? []).forEach((a: { badge_id: string; awarded_at: string }) =>
    awardedAt.set(a.badge_id, a.awarded_at)
  );

  return ((badges as Badge[]) ?? []).map((badge) => ({
    badge,
    awarded_at: awardedAt.get(badge.id) ?? null,
  }));
}
