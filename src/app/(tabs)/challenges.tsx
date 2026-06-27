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
import type { SeasonChallenge, Submission, SubmissionStatus } from "@/lib/types";
import { CategoryChip, StatusTag } from "@/components/chips";
import { theme } from "@/lib/theme";

export default function ChallengesScreen() {
  const { profile, camp } = useSession();
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
      // ignore — keep last good state
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const completed = Object.values(subs).filter((s) => s.status === "approved").length;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.pine} />}
    >
      <Text style={styles.greeting}>Hi {profile?.display_name ?? "Camper"}!</Text>
      {camp && (
        <Text style={styles.sub}>
          {camp.name} • {completed} completed
        </Text>
      )}

      {loading && challenges.length === 0 ? (
        <ActivityIndicator color={theme.pine} style={{ marginTop: 60 }} />
      ) : challenges.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="flag-outline" size={40} color={theme.pineSoft} />
          <Text style={styles.emptyTitle}>No active challenges</Text>
          <Text style={styles.emptyMsg}>Your camp hasn&apos;t released a challenge yet.</Text>
        </View>
      ) : (
        challenges.map((c) => (
          <Pressable
            key={c.id}
            style={styles.card}
            onPress={() => router.push(`/challenge/${c.id}`)}
          >
            <View style={styles.cardTop}>
              <CategoryChip category={c.template.category} />
              <Text style={styles.points}>{c.template.points} pts</Text>
            </View>
            <Text style={styles.cardTitle}>{c.template.title}</Text>
            <Text style={styles.cardSummary} numberOfLines={2}>
              {c.template.summary}
            </Text>
            <View style={styles.cardBottom}>
              <StatusTag status={(subs[c.id]?.status as SubmissionStatus) ?? null} />
              <Ionicons name="chevron-forward" size={16} color={theme.muted} />
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.sand },
  content: { padding: theme.screenPad, gap: 14 },
  greeting: { fontSize: 22, fontWeight: "800", color: theme.ink },
  sub: { fontSize: 15, color: theme.muted, marginTop: -8, marginBottom: 4 },
  empty: { alignItems: "center", gap: 8, marginTop: 60 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: theme.ink },
  emptyMsg: { fontSize: 14, color: theme.muted, textAlign: "center" },
  card: {
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  points: { fontSize: 13, fontWeight: "800", color: theme.pine },
  cardTitle: { fontSize: 19, fontWeight: "800", color: theme.ink },
  cardSummary: { fontSize: 14, color: theme.muted, lineHeight: 20 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
