import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.pine,
        tabBarInactiveTintColor: theme.muted,
        headerStyle: { backgroundColor: theme.sand },
        headerShadowVisible: false,
        headerTitleStyle: { color: theme.ink, fontWeight: "800", fontSize: 22 },
        headerTitleAlign: "left",
        sceneStyle: { backgroundColor: theme.sand },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color, size }) => <Ionicons name="flag" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="badges"
        options={{
          title: "Badges",
          tabBarIcon: ({ color, size }) => <Ionicons name="ribbon" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
