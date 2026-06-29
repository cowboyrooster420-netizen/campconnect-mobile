import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/lib/theme";

/** Small "Camp starts in N days" pill for the Feed header (top-right). */
export default function CountdownPill({ days }: { days: number }) {
  return (
    <View style={styles.pill}>
      <Ionicons name="sunny" size={14} color={theme.sunset} />
      <Text style={styles.text}>Camp starts in {days} days</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: "#EBDFC9",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 11,
    marginRight: 16, // keep it off the screen edge
  },
  text: { fontSize: 12, fontWeight: "700", color: theme.ink },
});
