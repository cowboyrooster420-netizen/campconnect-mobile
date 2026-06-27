import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSession } from "@/context/auth";
import { updateProfile } from "@/lib/data";
import { theme } from "@/lib/theme";

export default function EditProfileScreen() {
  const { profile, refreshProfile } = useSession();
  const router = useRouter();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ displayName: name.trim() || "Camper", avatarUri });
      await refreshProfile();
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Pressable style={styles.avatarPick} onPress={pickAvatar}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="camera" size={28} color={theme.pine} />
          </View>
        )}
        <Text style={styles.changePhoto}>{avatarUri ? "Change photo" : "Add a photo"}</Text>
      </Pressable>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={theme.muted}
        autoCapitalize="words"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.save} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color={theme.white} /> : <Text style={styles.saveText}>Save</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.sand },
  content: { padding: theme.screenPad, gap: 14, alignItems: "stretch" },
  avatarPick: { alignItems: "center", gap: 8, marginBottom: 8, marginTop: 8 },
  avatarImg: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.pine + "1F",
    alignItems: "center",
    justifyContent: "center",
  },
  changePhoto: { color: theme.pine, fontWeight: "700", fontSize: 14 },
  label: { fontSize: 14, fontWeight: "700", color: theme.ink + "CC" },
  input: {
    backgroundColor: theme.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.ink,
  },
  error: { color: "#C0392B", fontSize: 14 },
  save: {
    backgroundColor: theme.pine,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: { color: theme.white, fontSize: 17, fontWeight: "700" },
});
