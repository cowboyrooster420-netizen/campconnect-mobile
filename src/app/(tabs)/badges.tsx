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
import { fetchBadges } from "@/lib/data";
import type { EarnedBadge } from "@/lib/types";
import { theme } from "@/lib/theme";

// Badge icons are either valid Ionicons names (challenge/signup badges) or the
// old SF Symbol names from the original milestone badges. Resolve both.
const SF_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  "figure.walk": "walk",
  "mountain.2.fill": "triangle",
  "flame.fill": "flame",
  "book.fill": "book",
  "crown.fill": "trophy",
  "star.fill": "star",
};
function iconFor(name: string): keyof typeof Ionicons.glyphMap {
  if (name in Ionicons.glyphMap) return name as keyof typeof Ionicons.glyphMap;
  return SF_MAP[name] ?? "ribbon";
}

export default function BadgesScreen() {
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setBadges(await fetchBadges());
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

  const earned = badges.filter((b) => b.awarded_at).length;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.pine} />}
    >
      <Text style={styles.sub}>
        {earned} of {badges.length} earned
      </Text>

      {loading && badges.length === 0 ? (
        <ActivityIndicator color={theme.pine} style={{ marginTop: 60 }} />
      ) : (
        <View style={styles.grid}>
          {badges.map(({ badge, awarded_at }) => {
            const isEarned = !!awarded_at;
            return (
              <View key={badge.id} style={[styles.tile, !isEarned && styles.tileDim]}>
                {isEarned && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.pine}
                    style={styles.check}
                  />
                )}
                <Ionicons
                  name={iconFor(badge.icon)}
                  size={36}
                  color={isEarned ? theme.sunset : theme.muted}
                />
                <Text style={[styles.name, !isEarned && { color: theme.muted }]}>{badge.name}</Text>
                <Text style={styles.desc} numberOfLines={3}>
                  {badge.description}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.sand },
  content: { padding: theme.screenPad, gap: 14 },
  sub: { fontSize: 15, color: theme.muted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  tile: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  tileDim: { opacity: 0.6 },
  check: { position: "absolute", top: 10, right: 10 },
  name: { fontSize: 15, fontWeight: "800", color: theme.ink, textAlign: "center" },
  desc: { fontSize: 12, color: theme.muted, textAlign: "center", lineHeight: 16 },
});
