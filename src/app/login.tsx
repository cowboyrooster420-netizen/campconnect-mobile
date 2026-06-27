import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/context/auth";
import { theme } from "@/lib/theme";

export default function LoginScreen() {
  const { signIn, signUp } = useSession();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [displayName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    const err =
      mode === "signIn"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, displayName.trim() || "New Camper");
    if (err) setError(err);
    setBusy(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="bonfire" size={36} color={theme.white} />
          </View>
          <Text style={styles.title}>CampConnect</Text>
          <Text style={styles.subtitle}>Your camp, all year long.</Text>
        </View>

        {mode === "signUp" && (
          <Field icon="person-outline" placeholder="Your name" value={displayName} onChange={setName} autoCapitalize="words" />
        )}
        <Field icon="mail-outline" placeholder="Email" value={email} onChange={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field icon="lock-closed-outline" placeholder="Password" value={password} onChange={setPassword} secureTextEntry />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.button} onPress={submit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={theme.white} />
          ) : (
            <Text style={styles.buttonText}>{mode === "signIn" ? "Sign in" : "Create account"}</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
        >
          <Text style={styles.switch}>
            {mode === "signIn" ? "New here? Create an account" : "Already have an account? Sign in"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field(props: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChange: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "email-address" | "default";
  autoCapitalize?: "none" | "words";
}) {
  return (
    <View style={styles.field}>
      <Ionicons name={props.icon} size={20} color={theme.pineSoft} />
      <TextInput
        style={styles.input}
        placeholder={props.placeholder}
        placeholderTextColor={theme.muted}
        value={props.value}
        onChangeText={props.onChange}
        secureTextEntry={props.secureTextEntry}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.sand },
  container: { padding: theme.screenPad, paddingTop: 80, gap: 14 },
  header: { alignItems: "center", marginBottom: 24, gap: 6 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: theme.pine,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontSize: 30, fontWeight: "800", color: theme.ink },
  subtitle: { fontSize: 15, color: theme.muted },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.white,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: theme.ink },
  error: { color: "#C0392B", fontSize: 14 },
  button: {
    backgroundColor: theme.pine,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: theme.white, fontSize: 17, fontWeight: "700" },
  switch: { textAlign: "center", color: theme.pine, fontSize: 15, marginTop: 14 },
});
