import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useRouter } from "expo-router";
import { FEED_TYPE_META, type FeedEntry } from "@/lib/types";
import { theme } from "@/lib/theme";

export default function FeedCard({ entry, lead = false }: { entry: FeedEntry; lead?: boolean }) {
  const router = useRouter();
  const meta = FEED_TYPE_META[entry.type];
  const isVideo = entry.mediaType === "video" && !!entry.mediaUrl;
  const player = useVideoPlayer(isVideo ? entry.mediaUrl : null, (p) => {
    p.loop = false;
  });

  // No media, but linked to a challenge (e.g. released without an intro video)
  // → a tappable prompt card that jumps to the challenge.
  if (!entry.mediaUrl && entry.challengeId) {
    return (
      <Pressable
        style={styles.prompt}
        onPress={() => router.push(`/challenge/${entry.challengeId}`)}
      >
        <Text style={styles.promptEmoji}>{meta.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.promptEyebrow}>{meta.label.toUpperCase()}</Text>
          <Text style={styles.promptTitle}>{entry.title}</Text>
          {entry.caption ? <Text style={styles.promptBody}>{entry.caption}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.pine} />
      </Pressable>
    );
  }

  // No media + no link (a text announcement) → warm note card.
  if (!entry.mediaUrl) {
    return (
      <View style={styles.note}>
        <View style={styles.noteIcon}>
          <Ionicons name="megaphone" size={23} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.noteEyebrow}>{meta.label.toUpperCase()}</Text>
          <Text style={styles.noteTitle}>{entry.title}</Text>
          {entry.caption ? <Text style={styles.noteBody}>{entry.caption}</Text> : null}
        </View>
      </View>
    );
  }

  // Tap: challenge-linked cards (challenge/wrap-up/nudge) jump to the challenge;
  // a media-only card with video toggles playback.
  const onPress = () => {
    if (entry.challengeId) {
      router.push(`/challenge/${entry.challengeId}`);
      return;
    }
    if (isVideo) {
      if (player.playing) player.pause();
      else player.play();
    }
  };

  return (
    <Pressable style={[styles.card, { height: lead ? 420 : 300 }]} onPress={onPress}>
      {isVideo ? (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          nativeControls={false}
          contentFit="cover"
        />
      ) : (
        <Image source={{ uri: entry.mediaUrl! }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      )}
      {isVideo ? (
        <View style={styles.play}>
          <Ionicons name="play" size={lead ? 28 : 25} color="#fff" style={{ marginLeft: 3 }} />
        </View>
      ) : null}
      <View style={styles.typeChip}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
        <Text style={styles.typeText}>{meta.label}</Text>
      </View>
      <View style={styles.scrim}>
        <Text style={styles.title}>{entry.title}</Text>
        {entry.caption ? <Text style={styles.caption}>{entry.caption}</Text> : null}
        {entry.challengeId ? (
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Go to challenge</Text>
            <Ionicons name="arrow-forward" size={15} color="#1f3a2e" />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, overflow: "hidden", backgroundColor: "#1f3a2e" },
  play: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  typeChip: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.32)",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  emoji: { fontSize: 13 },
  typeText: { color: "#fff", fontSize: 11.5, fontWeight: "700" },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 18,
    backgroundColor: "rgba(15,28,22,0.55)",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#fff" },
  caption: { fontSize: 13.5, color: "rgba(255,255,255,0.78)", marginTop: 5, lineHeight: 19 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  ctaText: { color: "#1f3a2e", fontSize: 13.5, fontWeight: "700" },

  prompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.white,
    borderLeftWidth: 4,
    borderLeftColor: theme.pine,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  promptEmoji: { fontSize: 26 },
  promptEyebrow: { fontSize: 11.5, fontWeight: "700", color: theme.pine, textTransform: "uppercase" },
  promptTitle: { fontSize: 17, fontWeight: "800", color: theme.ink, marginTop: 2 },
  promptBody: { fontSize: 13.5, color: theme.muted, marginTop: 2 },
  note: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#FBF1E2",
    borderWidth: 1,
    borderColor: "#F0DCC0",
    borderRadius: 20,
    padding: 18,
  },
  noteIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#E08A3C",
    alignItems: "center",
    justifyContent: "center",
  },
  noteEyebrow: { fontSize: 11.5, fontWeight: "700", color: "#C2722B", textTransform: "uppercase" },
  noteTitle: { fontSize: 17, fontWeight: "700", color: theme.ink, marginTop: 2 },
  noteBody: { fontSize: 13.5, color: theme.muted, marginTop: 3, lineHeight: 19 },
});
