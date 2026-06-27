import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORY_META, type ChallengeCategory, type SubmissionStatus } from "@/lib/types";
import { theme } from "@/lib/theme";

export function CategoryChip({ category }: { category: ChallengeCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <View style={[styles.chip, { backgroundColor: meta.color + "22" }]}>
      <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={13} color={meta.color} />
      <Text style={[styles.chipText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const STATUS: Record<
  "none" | SubmissionStatus,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  none: { label: "Not started", color: theme.muted, icon: "ellipse-outline" },
  pending: { label: "In review", color: theme.sunset, icon: "time" },
  approved: { label: "Completed", color: theme.pine, icon: "checkmark-circle" },
  rejected: { label: "Try again", color: "#C0392B", icon: "refresh" },
};

export function StatusTag({ status }: { status: SubmissionStatus | null }) {
  const s = STATUS[status ?? "none"];
  return (
    <View style={styles.row}>
      <Ionicons name={s.icon} size={14} color={s.color} />
      <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  chipText: { fontSize: 12, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 5 },
  statusText: { fontSize: 12, fontWeight: "700" },
});
