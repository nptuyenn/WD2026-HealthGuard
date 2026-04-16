import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  ShieldAlert,
  Pill,
  Baby,
  Activity,
} from "lucide-react-native";
import { colors, fonts } from "@/theme";

function EmergencyTabIcon({ color }: { color: string }) {
  return (
    <View>
      <ShieldAlert size={24} color={color} strokeWidth={1.8} />
      <View
        style={{
          position: "absolute",
          top: -2,
          right: -2,
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.danger.DEFAULT,
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.DEFAULT,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: colors.border.DEFAULT,
          height: 64 + bottom,
          paddingBottom: bottom,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <Home size={24} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="emergency-card"
        options={{
          title: "Thẻ khẩn",
          tabBarIcon: ({ color }) => <EmergencyTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="med-manager"
        options={{
          title: "Thuốc",
          tabBarIcon: ({ color }) => (
            <Pill size={24} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="child-growth"
        options={{
          title: "Trẻ em",
          tabBarIcon: ({ color }) => (
            <Baby size={24} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="health-dashboard"
        options={{
          title: "Sức khỏe",
          tabBarIcon: ({ color }) => (
            <Activity size={24} color={color} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
