import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSession } from "@/context/auth";
import { fetchBadges, resolveAvatarUrl } from "@/lib/data";
import { BadgeShelf } from "@/components/BadgeShelf";
import type { EarnedBadge } from "@/lib/types";
import { theme } from "@/lib/theme";

export default function MeScreen() {
  const { profile, camp, signOut } = useSession();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);

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

      {/* Patch collection (progress bar + felt banner live inside) */}
      <View style={{ marginTop: 24 }}>
        <BadgeShelf badges={badges} />
      </View>

      <Pressable style={styles.signOut} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
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
  signOut: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  signOutText: { color: "#C0392B", fontSize: 16, fontWeight: "600" },
});
