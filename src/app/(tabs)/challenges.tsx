import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSession } from "@/context/auth";
import { fetchActiveChallenges, fetchMySubmissions } from "@/lib/data";
import {
  CATEGORY_META,
  type SeasonChallenge,
  type Submission,
  type SubmissionStatus,
} from "@/lib/types";
import { StatusTag } from "@/components/chips";
import SceneBackground from "@/components/scene-background";
import { theme } from "@/lib/theme";

export default function ChallengesScreen() {
  const { profile } = useSession();
  const router = useRouter();
  const [challenges, setChallenges] = useState<SeasonChallenge[]>([]);
  const [subs, setSubs] = useState<Record<string, Submission>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [ch, mySubs] = await Promise.all([fetchActiveChallenges(), fetchMySubmissions()]);
      setChallenges(ch);
      setSubs(Object.fromEntries(mySubs.map((s) => [s.season_challenge_id, s])));
    } catch {
      // keep last good state
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const statusOf = (c: SeasonChallenge) => (subs[c.id]?.status as SubmissionStatus) ?? null;
  const featured = challenges[0];
  const upNext = challenges.slice(1);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.pine} />}
    >
      <Text style={styles.greeting}>Hi {profile?.display_name ?? "Camper"}!</Text>

      {loading && challenges.length === 0 ? (
        <ActivityIndicator color={theme.pine} style={{ marginTop: 60 }} />
      ) : challenges.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="flag-outline" size={40} color={theme.pineSoft} />
          <Text style={styles.emptyTitle}>No active challenges</Text>
          <Text style={styles.emptyMsg}>Your camp hasn&apos;t released a challenge yet.</Text>
        </View>
      ) : (
        <>
          {/* Happening now — the featured challenge */}
          <Text style={styles.eyebrow}>Happening now</Text>
          {featured && (
            <Pressable style={styles.feature} onPress={() => router.push(`/challenge/${featured.id}`)}>
              <View style={styles.media}>
                <SceneBackground seed={featured.id} />
                <View style={styles.chip}>
                  <Ionicons
                    name={CATEGORY_META[featured.template.category].icon as keyof typeof Ionicons.glyphMap}
                    size={13}
                    color={CATEGORY_META[featured.template.category].color}
                  />
                  <Text style={[styles.chipText, { color: CATEGORY_META[featured.template.category].color }]}>
                    {CATEGORY_META[featured.template.category].label}
                  </Text>
                </View>
                <View style={styles.play}>
                  <Ionicons name="play" size={22} color={theme.pine} style={{ marginLeft: 3 }} />
                </View>
              </View>
              <View style={styles.featureBody}>
                <Text style={styles.featureTitle}>{featured.template.title}</Text>
                <Text style={styles.featureSummary} numberOfLines={2}>
                  {featured.template.summary}
                </Text>
                <View style={styles.featureRow}>
                  <StatusTag status={statusOf(featured)} />
                  <View style={styles.open}>
                    <Text style={styles.openText}>Open</Text>
                    <Ionicons name="chevron-forward" size={15} color={theme.pine} />
                  </View>
                </View>
              </View>
            </Pressable>
          )}

          {/* Up next — the rest */}
          {upNext.length > 0 && <Text style={styles.eyebrow}>Up next</Text>}
          {upNext.map((c) => {
            const meta = CATEGORY_META[c.template.category];
            return (
              <Pressable key={c.id} style={styles.row} onPress={() => router.push(`/challenge/${c.id}`)}>
                <View style={[styles.tile, { backgroundColor: meta.color + "22" }]}>
                  <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={20} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{c.template.title}</Text>
                  <StatusTag status={statusOf(c)} />
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C7CCC7" />
              </Pressable>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.sand },
  content: { padding: theme.screenPad, gap: 12 },
  greeting: { fontSize: 22, fontWeight: "800", color: theme.ink },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 8,
  },
  empty: { alignItems: "center", gap: 8, marginTop: 60 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: theme.ink },
  emptyMsg: { fontSize: 14, color: theme.muted, textAlign: "center" },

  // Featured card
  feature: {
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  media: { height: 168, justifyContent: "center", alignItems: "center" },
  chip: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: theme.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { fontSize: 12, fontWeight: "700" },
  play: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.white,
    alignItems: "center",
    justifyContent: "center",
  },
  featureBody: { padding: 16, gap: 6 },
  featureTitle: { fontSize: 19, fontWeight: "800", color: theme.ink },
  featureSummary: { fontSize: 14, color: theme.muted, lineHeight: 20 },
  featureRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  open: { flexDirection: "row", alignItems: "center", gap: 2 },
  openText: { fontSize: 14, fontWeight: "700", color: theme.pine },

  // Up-next rows
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 13,
  },
  tile: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 15, fontWeight: "700", color: theme.ink, marginBottom: 3 },
});
