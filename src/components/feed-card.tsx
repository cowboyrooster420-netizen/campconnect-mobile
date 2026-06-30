import {
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import { useRouter } from "expo-router";
import { FEED_TYPE_META, type FeedEntry } from "@/lib/types";
import SceneBackground from "@/components/scene-background";
import { theme } from "@/lib/theme";

export default function FeedCard({ entry }: { entry: FeedEntry }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  // Reel-sized (9:16) video cards, computed from the card's actual width.
  const reelHeight = Math.round((width - theme.screenPad * 2) * (16 / 9));
  const meta = FEED_TYPE_META[entry.type];
  const isVideo = entry.mediaType === "video" && !!entry.mediaUrl;
  const player = useVideoPlayer(isVideo ? entry.mediaUrl : null, (p) => {
    p.loop = false;
  });

  // ---- Video entry (challenge / nudge / wrap-up) ----
  if (isVideo) {
    const onPress = () => {
      if (entry.challengeId) {
        router.push(`/challenge/${entry.challengeId}`);
        return;
      }
      if (player.playing) player.pause();
      else player.play();
    };
    return (
      <Pressable style={[styles.card, { height: reelHeight }]} onPress={onPress}>
        <SceneBackground seed={entry.id} />
        <VideoView player={player} style={StyleSheet.absoluteFill} nativeControls={false} contentFit="cover" />
        <View style={styles.playWrap}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={30} color="#fff" style={{ marginLeft: 4 }} />
          </View>
        </View>
        <View style={styles.typeChip}>
          <Text style={styles.emoji}>{meta.emoji}</Text>
          <Text style={styles.typeText}>{meta.label}</Text>
        </View>
        <LinearGradient colors={["transparent", "rgba(15,28,22,0.92)"]} style={styles.scrim}>
          <Text style={styles.title}>{entry.title}</Text>
          {entry.caption ? <Text style={styles.caption}>{entry.caption}</Text> : null}
          {entry.challengeId ? (
            <View style={styles.cta}>
              <Text style={styles.ctaText}>Go to challenge</Text>
              <Ionicons name="arrow-forward" size={15} color="#1f3a2e" />
            </View>
          ) : null}
        </LinearGradient>
      </Pressable>
    );
  }

  // ---- Announcement (immersive cover-photo card) ----
  const openAction = entry.actionUrl ? () => Linking.openURL(entry.actionUrl!) : undefined;
  return (
    <Pressable style={styles.annCard} onPress={openAction}>
      {entry.mediaUrl ? (
        <ImageBackground source={{ uri: entry.mediaUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <SceneBackground seed={entry.id} scene={entry.scene} />
      )}
      <LinearGradient colors={["rgba(20,20,40,0.45)", "transparent"]} style={styles.topScrim} />
      {entry.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{entry.badge}</Text>
        </View>
      ) : null}
      <LinearGradient colors={["transparent", "rgba(18,18,36,0.92)"]} style={styles.annScrim}>
        <Text style={styles.title}>{entry.title}</Text>
        {entry.caption ? <Text style={styles.caption}>{entry.caption}</Text> : null}
        {entry.actionLabel ? (
          <View style={styles.cta}>
            <Text style={styles.ctaText}>{entry.actionLabel}</Text>
            <Ionicons name="arrow-forward" size={15} color="#1f3a2e" />
          </View>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, overflow: "hidden", backgroundColor: "#1f3a2e" },
  playWrap: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center" },
  playCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
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
    paddingTop: 72,
    paddingBottom: 18,
  },
  title: { fontSize: 21, fontWeight: "700", color: "#fff" },
  caption: { fontSize: 13.5, color: "rgba(255,255,255,0.82)", marginTop: 5, lineHeight: 19 },
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

  // Announcement
  annCard: { height: 286, borderRadius: 22, overflow: "hidden", backgroundColor: "#34405C" },
  topScrim: { position: "absolute", top: 0, left: 0, right: 0, height: 90 },
  badge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(0,0,0,0.34)",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  badgeText: { color: "#fff", fontSize: 10.5, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  annScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 64,
    paddingBottom: 18,
  },
});
