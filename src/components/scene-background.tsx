import { useId } from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

// A few illustrated nature scenes used as a cover fallback when a feed item has
// no uploaded photo. Each = a sky gradient + a low sun + two ridge silhouettes
// (+ stars for the dusk scene). Picked deterministically from a seed so a given
// post always shows the same scene.

type Scene = (uid: string) => React.ReactNode;

const sky = (uid: string, top: string, mid: string, bottom: string) => (
  <Defs>
    <LinearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor={top} />
      <Stop offset="0.55" stopColor={mid} />
      <Stop offset="1" stopColor={bottom} />
    </LinearGradient>
  </Defs>
);

const sunrise: Scene = (uid) => (
  <>
    {sky(uid, "#FAD9A0", "#F2A593", "#E98C7A")}
    <Rect x="0" y="0" width="400" height="286" fill={`url(#sky-${uid})`} />
    <Circle cx="205" cy="150" r="92" fill="#FFE9B8" opacity={0.35} />
    <Circle cx="205" cy="150" r="34" fill="#FFF3D6" />
    <Path d="M0,205 L70,165 L140,196 L210,150 L290,192 L360,165 L400,182 L400,286 L0,286 Z" fill="#3E6B52" opacity={0.9} />
    <Path d="M0,236 L60,212 L130,240 L200,206 L280,236 L350,214 L400,230 L400,286 L0,286 Z" fill="#234B3C" />
  </>
);

const lake: Scene = (uid) => (
  <>
    {sky(uid, "#F6B98A", "#E98FA6", "#C76E9B")}
    <Rect x="0" y="0" width="400" height="286" fill={`url(#sky-${uid})`} />
    <Circle cx="200" cy="138" r="88" fill="#FFE3BE" opacity={0.4} />
    <Circle cx="200" cy="138" r="30" fill="#FFE9C8" />
    <Path d="M0,196 L90,158 L180,190 L260,160 L340,188 L400,168 L400,286 L0,286 Z" fill="#5B7E8C" opacity={0.85} />
    <Rect x="0" y="226" width="400" height="60" fill="#2A4452" />
  </>
);

const dusk: Scene = (uid) => (
  <>
    {sky(uid, "#3A4E7A", "#5C5A8E", "#8E6A8E")}
    <Rect x="0" y="0" width="400" height="286" fill={`url(#sky-${uid})`} />
    <Circle cx="60" cy="50" r="1.6" fill="#fff" opacity={0.9} />
    <Circle cx="120" cy="34" r="1.2" fill="#fff" opacity={0.7} />
    <Circle cx="300" cy="46" r="1.8" fill="#fff" opacity={0.9} />
    <Circle cx="350" cy="80" r="1.2" fill="#fff" opacity={0.6} />
    <Circle cx="240" cy="28" r="1.3" fill="#fff" opacity={0.8} />
    <Circle cx="300" cy="120" r="26" fill="#F4E3C0" opacity={0.85} />
    <Path d="M0,210 L80,170 L150,200 L230,165 L310,198 L400,172 L400,286 L0,286 Z" fill="#26314F" />
    <Path d="M0,240 L70,218 L150,244 L230,214 L320,242 L400,222 L400,286 L0,286 Z" fill="#1A2238" />
  </>
);

export type SceneName = "sunrise" | "lake" | "dusk";

const BY_NAME: Record<SceneName, Scene> = { sunrise, lake, dusk };
const SCENES: Scene[] = [sunrise, lake, dusk];

function pick(seed: string): Scene {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return SCENES[h % SCENES.length];
}

/** Render a chosen `scene`, else a deterministic one from `seed`. */
export default function SceneBackground({ seed = "", scene }: { seed?: string; scene?: string | null }) {
  const uid = useId().replace(/:/g, "");
  const render = scene && scene in BY_NAME ? BY_NAME[scene as SceneName] : pick(seed);
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 286" preserveAspectRatio="xMidYMid slice">
      {render(uid)}
    </Svg>
  );
}
