import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Bell, LogOut } from "lucide-react-native";
import { colors, fonts, fontSizes } from "@/theme";
import { useAuth } from "@/store/auth";
import { mockNotifications } from "@/lib/mock-data";

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 11) return "buổi sáng";
  if (hour >= 11 && hour < 17) return "buổi chiều";
  if (hour >= 17 && hour < 22) return "buổi tối";
  return "khuya";
}

function formatVietnameseDate(date: Date): string {
  const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  return `${days[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "").toUpperCase() + (parts.at(-1)?.[0] ?? "").toUpperCase();
}

function firstName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.at(-1) ?? name;
}

interface Props {
  onNotificationPress?: () => void;
}

export default function GreetingHeader({ onNotificationPress }: Props) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const fullName = user?.profiles?.[0]?.fullName ?? user?.email ?? "bạn";
  const display = firstName(fullName);

  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const dateLabel = formatVietnameseDate(now);
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  const handleLogout = () =>
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: () => logout() },
    ]);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(fullName)}</Text>
        </View>
        <View>
          <Text style={styles.greetingText}>Chào {greeting}, {display}</Text>
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onNotificationPress} style={styles.iconBtn}>
          <Bell size={22} color={colors.text.secondary} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>
        <Pressable onPress={handleLogout} style={styles.iconBtn}>
          <LogOut size={22} color={colors.danger.DEFAULT} strokeWidth={1.8} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.semibold,
    color: colors.brand.DEFAULT,
  },
  greetingText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.semibold,
    color: colors.text.DEFAULT,
  },
  dateText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: colors.text.secondary,
  },
  actions: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: colors.danger.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: "#FFFFFF",
  },
});
