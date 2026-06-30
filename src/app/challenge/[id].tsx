import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import * as ImagePicker from "expo-image-picker";
import {
  fetchChallengeBadge,
  fetchChallengeById,
  fetchSubmissionFor,
  submitChallenge,
} from "@/lib/data";
import type { SeasonChallenge, Submission } from "@/lib/types";
import { CategoryChip, StatusTag } from "@/components/chips";
import { theme } from "@/lib/theme";

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [challenge, setChallenge] = useState<SeasonChallenge | null>(null);
  const [existing, setExisting] = useState<Submission | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recapUrl, setRecapUrl] = useState<string | null>(null);
  const [badgeName, setBadgeName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Submission state
  const [text, setText] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
  });
  const recapPlayer = useVideoPlayer(recapUrl, (p) => {
    p.loop = false;
  });

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [c, sub] = await Promise.all([fetchChallengeById(id), fetchSubmissionFor(id)]);
      setChallenge(c);
      setExisting(sub);
      setVideoUrl(c.counselor_video_url);
      setRecapUrl(c.recap_video_url);
      setBadgeName((await fetchChallengeBadge(c.template_id))?.name ?? null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading || !challenge) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.pine} size="large" />
      </View>
    );
  }

  const t = challenge.template;
  const format = t.submission_format;
  const canSubmit =
    format === "text" ? text.trim().length > 0 : mediaUri !== null;

  async function pickMedia() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: format === "video" ? ["videos"] : ["images"],
      quality: 0.7,
    });
    if (!result.canceled) setMediaUri(result.assets[0].uri);
  }

  async function onSubmit() {
    setSubmitting(true);
    try {
      await submitChallenge({
        challengeId: challenge!.id,
        contentType: format,
        text: format === "text" ? text : null,
        mediaUri: format === "text" ? null : mediaUri,
      });
      router.back();
    } catch (e) {
      Alert.alert("Couldn't submit", e instanceof Error ? e.message : "Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const alreadyDone = existing && existing.status !== "rejected";

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      {videoUrl ? (
        <VideoView player={player} style={styles.video} nativeControls contentFit="cover" />
      ) : (
        <View style={styles.videoPlaceholder}>
          <Ionicons name="play-circle" size={44} color={theme.pine} />
          <Text style={styles.placeholderText}>Counselor video coming soon</Text>
        </View>
      )}

      <View style={styles.titleRow}>
        <CategoryChip category={t.category} />
      </View>
      <Text style={styles.title}>{t.title}</Text>
      <Text style={styles.summary}>{t.summary}</Text>

      {badgeName ? (
        <View style={styles.reward}>
          <Ionicons name="ribbon" size={16} color={theme.sunset} />
          <Text style={styles.rewardText}>
            Earn the <Text style={styles.rewardName}>{badgeName}</Text> patch
          </Text>
        </View>
      ) : null}

      <Section icon="chatbubble-ellipses" title="From your counselor">
        <Text style={styles.script}>{t.counselor_script}</Text>
      </Section>

      <Section icon="clipboard" title="Your challenge">
        <Text style={styles.body}>{t.instructions}</Text>
      </Section>

      {recapUrl ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Ionicons name="flag" size={18} color={theme.sunset} />
            <Text style={[styles.sectionTitle, { color: theme.sunset }]}>Challenge Wrap-up</Text>
          </View>
          <VideoView player={recapPlayer} style={styles.video} nativeControls contentFit="cover" />
        </View>
      ) : null}

      {/* Submission area */}
      {alreadyDone ? (
        <View style={styles.doneCard}>
          <StatusTag status={existing!.status} />
          <Text style={styles.doneMsg}>
            {existing!.status === "approved" ? "Nice work — this one's complete!" : "Your counselor is reviewing this."}
          </Text>
        </View>
      ) : (
        <View style={styles.submitCard}>
          {format === "text" ? (
            <TextInput
              style={styles.textArea}
              placeholder="Write your response…"
              placeholderTextColor={theme.muted}
              value={text}
              onChangeText={setText}
              multiline
            />
          ) : (
            <>
              {mediaUri && format === "photo" && (
                <Image source={{ uri: mediaUri }} style={styles.preview} />
              )}
              {mediaUri && format === "video" && (
                <View style={styles.videoChosen}>
                  <Ionicons name="videocam" size={20} color={theme.pine} />
                  <Text style={styles.videoChosenText}>Video selected</Text>
                </View>
              )}
              <Pressable style={styles.pickButton} onPress={pickMedia}>
                <Ionicons
                  name={format === "video" ? "videocam-outline" : "image-outline"}
                  size={20}
                  color={theme.pine}
                />
                <Text style={styles.pickText}>
                  {mediaUri ? "Choose a different file" : format === "video" ? "Record / choose a video" : "Choose a photo"}
                </Text>
              </Pressable>
            </>
          )}

          <Pressable
            style={[styles.submit, !canSubmit && styles.submitDisabled]}
            onPress={onSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={theme.white} />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={18} color={theme.pine} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.sand },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.sand },
  content: { padding: theme.screenPad, gap: 16, paddingBottom: 40 },
  video: { width: "100%", height: 220, borderRadius: theme.cardRadius, backgroundColor: "#000" },
  videoPlaceholder: {
    height: 180,
    borderRadius: theme.cardRadius,
    backgroundColor: theme.pine + "1F",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: { color: theme.muted, fontSize: 14 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "800", color: theme.ink },
  summary: { fontSize: 15, color: theme.muted, lineHeight: 21, marginTop: -8 },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    backgroundColor: theme.sunset + "1F",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  rewardText: { fontSize: 14, color: theme.ink, fontWeight: "600" },
  rewardName: { fontWeight: "800", color: "#C2722B" },
  section: { backgroundColor: theme.white, borderRadius: theme.cardRadius, padding: 16, gap: 10 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: theme.pine },
  script: { fontSize: 15, fontStyle: "italic", color: theme.ink, lineHeight: 22 },
  body: { fontSize: 15, color: theme.ink, lineHeight: 22 },
  doneCard: { backgroundColor: theme.white, borderRadius: theme.cardRadius, padding: 16, gap: 8 },
  doneMsg: { fontSize: 14, color: theme.muted },
  submitCard: { gap: 12 },
  textArea: {
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 14,
    minHeight: 140,
    fontSize: 16,
    color: theme.ink,
    textAlignVertical: "top",
  },
  preview: { width: "100%", height: 240, borderRadius: 12 },
  videoChosen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 16,
  },
  videoChosenText: { fontSize: 15, color: theme.ink, fontWeight: "600" },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.white,
    borderRadius: 12,
    paddingVertical: 14,
  },
  pickText: { color: theme.pine, fontWeight: "700", fontSize: 15 },
  submit: { backgroundColor: theme.pine, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: theme.white, fontSize: 17, fontWeight: "700" },
});
