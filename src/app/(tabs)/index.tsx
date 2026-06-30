import { useCallback, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "expo-router";
import { useSession } from "@/context/auth";
import { fetchFeed } from "@/lib/data";
import type { FeedEntry } from "@/lib/types";
import FeedCard from "@/components/feed-card";
import CountdownPill from "@/components/countdown-pill";
import { theme } from "@/lib/theme";

export default function FeedScreen() {
  const { camp } = useSession();
  const navigation = useNavigation();
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

  // Countdown pill in the top-right of the Feed header.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight:
        daysUntil !== null && daysUntil > 0
          ? () => <CountdownPill days={daysUntil} />
          : undefined,
    });
  }, [navigation, daysUntil]);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.pine} />}
    >
      {loading && entries.length === 0 ? (
        <ActivityIndicator color={theme.pine} style={{ marginTop: 60 }} />
      ) : entries.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="tv-outline" size={40} color={theme.pineSoft} />
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyMsg}>Your camp&apos;s videos and memories will show up here.</Text>
        </View>
      ) : (
        entries.map((e) => <FeedCard key={e.id} entry={e} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.sand },
  content: { padding: theme.screenPad, gap: 14 },
  empty: { alignItems: "center", gap: 8, marginTop: 60 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: theme.ink },
  emptyMsg: { fontSize: 14, color: theme.muted, textAlign: "center" },
});
