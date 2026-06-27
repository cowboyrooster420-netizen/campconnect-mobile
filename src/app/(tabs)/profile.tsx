import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSession } from "@/context/auth";
import { fetchBadges, resolveAvatarUrl } from "@/lib/data";
import { theme } from "@/lib/theme";

export default function ProfileScreen() {
  const { profile, camp, signOut } = useSession();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [earned, setEarned] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [url, badges] = await Promise.all([
          resolveAvatarUrl(profile?.avatar_url ?? null),
          fetchBadges().catch(() => []),
        ]);
        if (!active) return;
        setAvatarUrl(url);
        setEarned(badges.filter((b) => b.awarded_at).length);
      })();
      return () => {
        active = false;
      };
    }, [profile?.avatar_url])
  );

  const initials = (profile?.display_name ?? "C")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
        ) : (
          <Text style={styles.initials}>{initials}</Text>
        )}
      </View>

      <Text style={styles.name}>{profile?.display_name ?? "Camper"}</Text>
      {camp && <Text style={styles.sub}>{camp.name}</Text>}
      {profile?.cabin && <Text style={styles.cabin}>Cabin {profile.cabin}</Text>}

      <Pressable style={styles.editBtn} onPress={() => router.push("/edit-profile")}>
        <Ionicons name="create-outline" size={16} color={theme.pine} />
        <Text style={styles.editText}>Edit profile</Text>
      </Pressable>

      <View style={styles.statCard}>
        <Ionicons name="ribbon" size={28} color={theme.sunset} />
        <View>
          <Text style={styles.stat}>{earned}</Text>
          <Text style={styles.statLabel}>badges earned</Text>
        </View>
      </View>

      <Pressable style={styles.signOut} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.sand, alignItems: "center", padding: theme.screenPad, paddingTop: 40 },
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
  cabin: { fontSize: 13, color: theme.muted, marginTop: 2 },
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
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 18,
    width: "100%",
    marginTop: 24,
  },
  stat: { fontSize: 22, fontWeight: "800", color: theme.ink },
  statLabel: { fontSize: 13, color: theme.muted },
  signOut: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
  },
  signOutText: { color: "#C0392B", fontSize: 16, fontWeight: "600" },
});
