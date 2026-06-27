import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SessionProvider, useSession } from "@/context/auth";
import { theme } from "@/lib/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </SessionProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inLogin = segments[0] === "login";
    if (!session && !inLogin) router.replace("/login");
    else if (session && inLogin) router.replace("/");
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.sand,
        }}
      >
        <ActivityIndicator color={theme.pine} size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.sand },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen
        name="challenge/[id]"
        options={{
          headerShown: true,
          title: "",
          headerTintColor: theme.pine,
          headerStyle: { backgroundColor: theme.sand },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: true,
          title: "Edit profile",
          headerTintColor: theme.pine,
          headerTitleStyle: { color: theme.ink },
          headerStyle: { backgroundColor: theme.sand },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
