import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useRouter } from "expo-router";
import { FEED_TYPE_META, type FeedEntry } from "@/lib/types";
import { theme } from "@/lib/theme";

export default function FeedCard({ entry }: { entry: FeedEntry }) {
  const router = useRouter();
  const meta = FEED_TYPE_META[entry.type];
  const player = useVideoPlayer(entry.videoUrl, (p) => {
    p.loop = false;
  });

  const goToChallenge = entry.challengeId
    ? () => router.push(`/challenge/${entry.challengeId}`)
    : undefined;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
        <Text style={styles.label}>{meta.label}</Text>
      </View>

      <Text style={styles.title}>{entry.title}</Text>
      {entry.caption ? <Text style={styles.caption}>{entry.caption}</Text> : null}

      {entry.videoUrl ? (
        <VideoView player={player} style={styles.video} nativeControls contentFit="cover" />
      ) : null}

      {goToChallenge ? (
        <Pressable style={styles.link} onPress={goToChallenge}>
          <Text style={styles.linkText}>Go to challenge</Text>
          <Ionicons name="chevron-forward" size={14} color={theme.pine} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 6 },
  emoji: { fontSize: 16 },
  label: { fontSize: 12, fontWeight: "700", color: theme.muted, textTransform: "uppercase" },
  title: { fontSize: 18, fontWeight: "800", color: theme.ink },
  caption: { fontSize: 14, color: theme.muted, lineHeight: 20 },
  video: { width: "100%", height: 200, borderRadius: 12, backgroundColor: "#000", marginTop: 4 },
  link: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  linkText: { color: theme.pine, fontWeight: "700", fontSize: 14 },
});
