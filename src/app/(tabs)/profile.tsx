import { useCallback, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSession } from "@/context/auth";
import { fetchBadges, resolveAvatarUrl } from "@/lib/data";
import type { EarnedBadge } from "@/lib/types";
import { theme } from "@/lib/theme";

// Badge icons are valid Ionicons names (challenge/signup) or legacy SF symbols.
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

export default function MeScreen() {
  const { profile, camp, signOut } = useSession();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [selected, setSelected] = useState<EarnedBadge | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [url, list] = await Promise.all([
          resolveAvatarUrl(profile?.avatar_url ?? null),
          fetchBadges().catch(() => []),
        ]);
        if (!active) return;
        setAvatarUrl(url);
        setBadges(list);
      })();
      return () => {
        active = false;
      };
    }, [profile?.avatar_url])
  );

  const earned = badges.filter((b) => b.awarded_at).length;
  const total = badges.length || 1;
  const pct = Math.round((earned / total) * 100);
  const since = profile?.created_at ? new Date(profile.created_at).getFullYear() : null;

  const initials = (profile?.display_name ?? "C")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      {/* Identity header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.initials}>{initials}</Text>
          )}
        </View>
        <Text style={styles.name}>{profile?.display_name ?? "Camper"}</Text>
        {camp && <Text style={styles.sub}>{camp.name}</Text>}
        <Text style={styles.since}>
          {profile?.cabin ? `Cabin ${profile.cabin} · ` : ""}
          {since ? `Camper since ${since}` : "Camper"}
        </Text>
        <Pressable style={styles.editBtn} onPress={() => router.push("/edit-profile")}>
          <Ionicons name="create-outline" size={16} color={theme.pine} />
          <Text style={styles.editText}>Edit profile</Text>
        </Pressable>
      </View>

      {/* Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Ionicons name="ribbon" size={20} color={theme.sunset} />
          <Text style={styles.progressText}>
            {earned} of {badges.length} badges
          </Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
      </View>

      {/* Collection */}
      <Text style={styles.collectionTitle}>My collection</Text>
      <View style={styles.grid}>
        {badges.map((b) => {
          const isEarned = !!b.awarded_at;
          return (
            <Pressable
              key={b.badge.id}
              style={[styles.tile, !isEarned && styles.tileDim]}
              onPress={() => setSelected(b)}
            >
              {isEarned && (
                <Ionicons name="checkmark-circle" size={18} color={theme.pine} style={styles.check} />
              )}
              <Ionicons
                name={isEarned ? iconFor(b.badge.icon) : "lock-closed"}
                size={32}
                color={isEarned ? theme.sunset : theme.muted}
              />
              <Text style={[styles.tileName, !isEarned && { color: theme.muted }]} numberOfLines={2}>
                {b.badge.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.signOut} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      {/* Badge detail */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <View style={styles.sheet}>
            <Ionicons
              name={selected?.awarded_at ? iconFor(selected.badge.icon) : "lock-closed"}
              size={48}
              color={selected?.awarded_at ? theme.sunset : theme.muted}
            />
            <Text style={styles.sheetName}>{selected?.badge.name}</Text>
            <Text style={styles.sheetDesc}>{selected?.badge.description}</Text>
            <Text style={[styles.sheetStatus, { color: selected?.awarded_at ? theme.pine : theme.muted }]}>
              {selected?.awarded_at
                ? `Earned ${new Date(selected.awarded_at).toLocaleDateString()}`
                : "Not earned yet"}
            </Text>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.sand },
  content: { padding: theme.screenPad, paddingTop: 28, paddingBottom: 40 },
  header: { alignItems: "center" },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.pine + "26",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 96, height: 96 },
  initials: { fontSize: 34, fontWeight: "800", color: theme.pine },
  name: { fontSize: 22, fontWeight: "800", color: theme.ink, marginTop: 14 },
  sub: { fontSize: 15, color: theme.muted, marginTop: 2 },
  since: { fontSize: 13, color: theme.muted, marginTop: 2 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.pine + "55",
  },
  editText: { color: theme.pine, fontWeight: "700", fontSize: 14 },
  progressCard: {
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 16,
    marginTop: 24,
    gap: 10,
  },
  progressTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressText: { fontSize: 16, fontWeight: "800", color: theme.ink },
  barBg: { height: 8, borderRadius: 4, backgroundColor: theme.pine + "1A", overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4, backgroundColor: theme.pine },
  collectionTitle: { fontSize: 16, fontWeight: "800", color: theme.ink, marginTop: 24, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: "30%",
    flexGrow: 1,
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 8,
  },
  tileDim: { opacity: 0.6 },
  check: { position: "absolute", top: 8, right: 8 },
  tileName: { fontSize: 12, fontWeight: "700", color: theme.ink, textAlign: "center" },
  signOut: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  signOutText: { color: "#C0392B", fontSize: 16, fontWeight: "600" },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  sheet: {
    backgroundColor: theme.white,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  sheetName: { fontSize: 20, fontWeight: "800", color: theme.ink, textAlign: "center" },
  sheetDesc: { fontSize: 15, color: theme.muted, textAlign: "center", lineHeight: 21 },
  sheetStatus: { fontSize: 14, fontWeight: "700", marginTop: 4 },
});
