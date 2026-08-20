import { Tabs } from "expo-router";
import { Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { LUMA } from "@/components/luma-primitives";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: LUMA.violet, tabBarInactiveTintColor: LUMA.muted, tabBarButton: HapticTab, tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: 56 + bottomPadding, backgroundColor: LUMA.canvas, borderTopColor: LUMA.border, borderTopWidth: 0.5 }, tabBarLabelStyle: { fontSize: 10, fontWeight: "800" } }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 17 }}>⌂</Text> }} />
    <Tabs.Screen name="library" options={{ title: "Library", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 17 }}>≋</Text> }} />
    <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 17 }}>⚙</Text> }} />
  </Tabs>;
}
