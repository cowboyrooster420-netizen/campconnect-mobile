import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/context/auth";
import { theme } from "@/lib/theme";

export default function ProfileScreen() {
  const { profile, camp, signOut } = useSession();

  const initials = (profile?.display_name ?? "C")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <Text style={styles.name}>{profile?.display_name ?? "Camper"}</Text>
      {camp && <Text style={styles.sub}>{camp.name}</Text>}
      {profile?.cabin && <Text style={styles.cabin}>Cabin {profile.cabin}</Text>}

      <View style={styles.pointsCard}>
        <Ionicons name="star" size={28} color={theme.sunset} />
        <View>
          <Text style={styles.points}>{profile?.total_points ?? 0}</Text>
          <Text style={styles.pointsLabel}>camp points earned</Text>
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
  },
  initials: { fontSize: 34, fontWeight: "800", color: theme.pine },
  name: { fontSize: 22, fontWeight: "800", color: theme.ink, marginTop: 14 },
  sub: { fontSize: 15, color: theme.muted, marginTop: 2 },
  cabin: { fontSize: 13, color: theme.muted, marginTop: 2 },
  pointsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 18,
    width: "100%",
    marginTop: 28,
  },
  points: { fontSize: 22, fontWeight: "800", color: theme.ink },
  pointsLabel: { fontSize: 13, color: theme.muted },
  signOut: {
    marginTop: 28,
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
