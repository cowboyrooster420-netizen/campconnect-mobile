// BadgeShelf — the camper's patch collection on a deep-pine felt banner.
//
// Earned patches render as full-color medallions; unearned ones show as
// ghost-thread slots so the empty spots pull campers to fill them. Includes the
// progress bar (count-based, no points). Feed it the EarnedBadge[] you already
// load from fetchBadges():
//
//   <BadgeShelf badges={badges} />

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/lib/theme";
import { Badge } from "@/components/Badge";
import { badgeTone, iconFor } from "@/lib/badges";
import type { EarnedBadge } from "@/lib/types";

export function BadgeShelf({
  badges,
  size = 84,
}: {
  badges: EarnedBadge[];
  size?: number;
}) {
  const earnedCount = badges.filter((b) => b.awarded_at).length;
  const remaining = badges.length - earnedCount;
  const pct = badges.length ? (earnedCount / badges.length) * 100 : 0;

  return (
    <View>
      {/* progress */}
      <View style={styles.progressHead}>
        <Text style={styles.progressLabel}>Patch collection</Text>
        <Text style={styles.progressCount}>
          {earnedCount} of {badges.length} earned
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>

      {/* felt banner */}
      <View style={styles.felt}>
        <View style={styles.feltBorder} pointerEvents="none" />
        <View style={styles.loops}>
          <View style={styles.loop} />
          <View style={styles.loop} />
        </View>

        <View style={styles.grid}>
          {badges.map((b) => (
            <View key={b.badge.id} style={styles.cell}>
              {b.awarded_at ? (
                <Badge
                  name={b.badge.name}
                  icon={iconFor(b.badge.icon)}
                  tone={badgeTone(b.badge)}
                  earned
                  size={size}
                />
              ) : (
                <GhostSlot name={b.badge.name} icon={iconFor(b.badge.icon)} size={size} />
              )}
            </View>
          ))}
        </View>
      </View>

      {remaining > 0 && (
        <Text style={styles.footnote}>
          {remaining} {remaining === 1 ? "patch" : "patches"} left to complete the banner.
        </Text>
      )}
    </View>
  );
}

function GhostSlot({
  name,
  icon,
  size,
}: {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  size: number;
}) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.ghost, { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name={icon} size={size * 0.36} color="rgba(251,247,238,0.26)" />
      </View>
      <Text style={styles.ghostLabel} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const FELT = "#234B3C";

const styles = StyleSheet.create({
  progressHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 4,
  },
  progressLabel: { fontSize: 13, fontWeight: "600", color: theme.ink },
  progressCount: { fontSize: 13, fontWeight: "700", color: theme.pine },
  track: { height: 10, borderRadius: 5, backgroundColor: "rgba(46,125,91,0.1)", overflow: "hidden" },
  fill: { height: 10, borderRadius: 5, backgroundColor: theme.pine },

  felt: {
    marginTop: 18,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: FELT,
    shadowColor: FELT,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  feltBorder: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(251,247,238,0.32)",
    borderStyle: "dashed",
  },
  loops: { flexDirection: "row", justifyContent: "center", gap: 60, marginBottom: 12 },
  loop: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: "rgba(251,247,238,0.3)" },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 18 },
  cell: { width: "31%", alignItems: "center" },

  wrap: { alignItems: "center", gap: 7 },
  ghost: {
    borderWidth: 1.6,
    borderColor: "rgba(251,247,238,0.34)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostLabel: { fontSize: 11, fontWeight: "500", color: "rgba(234,227,210,0.5)" },

  footnote: { fontSize: 12.5, color: theme.muted, textAlign: "center", marginTop: 14, lineHeight: 18 },
});
