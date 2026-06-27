// Badge — a single camp merit patch (medallion).
//
// Renders the rope ring, embroidered stitched edge, sheen, cream emblem and the
// gold earned-star (or a lock chip when not earned). Drive it from the registry
// in lib/badges.ts so every patch stays visually consistent.
//
//   <Badge name="Trailblazer" icon="walk" tone="pine" earned />
//   <Badge name="Polar Plunge" icon="snow" tone="blue" />   // locked
//
// Requires react-native-svg:  npx expo install react-native-svg

import React, { useId } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, LinearGradient, Stop } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/lib/theme";
import { BADGE_TONES, type BadgeTone } from "@/lib/badges";

type IoniconName = keyof typeof Ionicons.glyphMap;

// Constant rope ring + locked fields (only the earned field color varies, via tone).
const ROPE: [string, string] = ["#EFD389", "#C0902E"];
const ROPE_LOCK: [string, string] = ["#DBD0BA", "#ABA088"];
const FIELD_LOCK: [string, string] = ["#ECE5D7", "#D6CCB8"];

export interface BadgeProps {
  name: string;
  icon: IoniconName;
  tone?: BadgeTone;
  earned?: boolean;
  size?: number;
  showLabel?: boolean;
}

export function Badge({
  name,
  icon,
  tone = "pine",
  earned = false,
  size = 84,
  showLabel = true,
}: BadgeProps) {
  // Unique gradient ids per instance (react-native-svg requires this).
  const uid = useId().replace(/:/g, "");
  const fieldId = `field-${uid}`;
  const ropeId = `rope-${uid}`;

  const field = earned ? BADGE_TONES[tone] : FIELD_LOCK;
  const rope = earned ? ROPE : ROPE_LOCK;
  const emblemColor = earned ? "#FBF7EE" : "#AFA68F";
  const chip = size * 0.27;

  return (
    <View style={styles.wrap}>
      <View style={[styles.medallion, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={fieldId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={field[0]} />
              <Stop offset="1" stopColor={field[1]} />
            </LinearGradient>
            <LinearGradient id={ropeId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={rope[0]} />
              <Stop offset="1" stopColor={rope[1]} />
            </LinearGradient>
          </Defs>

          {/* rope ring */}
          <Circle cx="50" cy="50" r="49" fill={`url(#${ropeId})`} />
          {/* color field */}
          <Circle cx="50" cy="50" r="43.5" fill={`url(#${fieldId})`} />
          {/* embroidered stitch ring */}
          <Circle
            cx="50"
            cy="50"
            r="37.5"
            fill="none"
            stroke="#FBF7EE"
            strokeOpacity={earned ? 0.9 : 0.55}
            strokeWidth={1.4}
            strokeDasharray="1.4 3.2"
            strokeLinecap="round"
          />
          {/* sheen */}
          {earned && <Ellipse cx="50" cy="33" rx="27" ry="14" fill="#ffffff" opacity={0.15} />}
        </Svg>

        {/* emblem */}
        <View style={styles.emblem} pointerEvents="none">
          <Ionicons name={icon} size={size * 0.4} color={emblemColor} />
        </View>

        {/* earned star / locked chip */}
        <View style={[styles.chipWrap, { bottom: -chip * 0.12 }]} pointerEvents="none">
          <View
            style={[
              styles.chip,
              {
                width: chip,
                height: chip,
                borderRadius: chip / 2,
                backgroundColor: earned ? "#E3B544" : "#CFC7B4",
              },
            ]}
          >
            <Ionicons name={earned ? "star" : "lock-closed"} size={chip * 0.5} color="#fff" />
          </View>
        </View>
      </View>

      {showLabel && (
        <Text style={[styles.label, { color: earned ? theme.ink : theme.muted }]} numberOfLines={1}>
          {name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 7 },
  medallion: {
    shadowColor: "#1b2b22",
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  emblem: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  chipWrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  chip: { alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  label: { fontSize: 12, fontWeight: "700" },
});
