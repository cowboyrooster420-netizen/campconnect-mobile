import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useSession } from "@/context/auth";
import { fetchFeed } from "@/lib/data";
import type { FeedEntry } from "@/lib/types";
import FeedCard from "@/components/feed-card";
import { theme } from "@/lib/theme";

export default function FeedScreen() {
  const { camp } = useSession();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setEntries(await fetchFeed());
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

  const daysUntil = camp?.session_start_date
    ? Math.ceil((new Date(camp.session_start_date + "T00:00:00").getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.pine} />}
    >
      {daysUntil !== null && daysUntil > 0 ? (
        <View style={styles.countdown}>
          <Ionicons name="bonfire" size={26} color={theme.sunset} />
          <View style={{ flex: 1 }}>
            <Text style={styles.countdownTop}>
              <Text style={styles.countdownNum}>{daysUntil}</Text> days until camp!
            </Text>
            {camp && <Text style={styles.countdownCamp}>See you at {camp.name}</Text>}
          </View>
        </View>
      ) : (
        camp && <Text style={styles.sub}>{camp.name}</Text>
      )}

      {loading && entries.length === 0 ? (
        <ActivityIndicator color={theme.pine} style={{ marginTop: 60 }} />
      ) : entries.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="tv-outline" size={40} color={theme.pineSoft} />
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyMsg}>Your camp&apos;s videos and memories will show up here.</Text>
        </View>
      ) : (
        entries.map((e, i) => <FeedCard key={e.id} entry={e} lead={i === 0} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.sand },
  content: { padding: theme.screenPad, gap: 14 },
  sub: { fontSize: 15, color: theme.muted, marginTop: -4 },
  countdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.ink,
    borderRadius: theme.cardRadius,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  countdownTop: { color: theme.white, fontSize: 16, fontWeight: "700" },
  countdownNum: { color: theme.sunset, fontSize: 22, fontWeight: "800" },
  countdownCamp: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 1 },
  empty: { alignItems: "center", gap: 8, marginTop: 60 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: theme.ink },
  emptyMsg: { fontSize: 14, color: theme.muted, textAlign: "center" },
});
