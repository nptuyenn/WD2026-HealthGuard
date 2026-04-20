import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Bell, LogOut, ChevronDown } from "lucide-react-native";
import { colors, fonts, fontSizes } from "@/theme";
import { useAuth, useActiveProfile } from "@/store/auth";

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 11) return "buổi sáng";
  if (hour >= 11 && hour < 17) return "buổi chiều";
  if (hour >= 17 && hour < 22) return "buổi tối";
  return "khuya";
}

function formatVietnameseDate(date: Date): string {
  const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  return `${days[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1}`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.at(-1)?.[0] ?? "")).toUpperCase();
}

function firstName(name: string) {
  return name.trim().split(/\s+/).at(-1) ?? name;
}

const AVATAR_COLORS: Record<string, string> = {
  self: colors.brand.DEFAULT,
  child: colors.success.DEFAULT,
  parent: "#F59E0B",
  spouse: colors.purple.DEFAULT,
};

interface Props {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export default function GreetingHeader({ onNotificationPress, onProfilePress }: Props) {
  const profile = useActiveProfile();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const profileCount = user?.profiles?.length ?? 0;

  const fullName = profile?.fullName ?? user?.email ?? "bạn";
  const rel = profile?.relationship ?? "self";
  const avatarColor = AVATAR_COLORS[rel] ?? colors.brand.DEFAULT;

  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const dateLabel = formatVietnameseDate(now);

  const handleLogout = () =>
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: () => logout() },
    ]);

  return (
    <>
      <View style={styles.container}>
        <Pressable
          style={styles.left}
          onPress={onProfilePress}
        >
          <View style={[styles.avatar, { backgroundColor: avatarColor + "22" }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>
              {initials(fullName)}
            </Text>
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.greetingText}>
                Chào {greeting}, {firstName(fullName)}
              </Text>
              {profileCount > 1 && (
                <ChevronDown size={14} color={colors.text.muted} strokeWidth={2} />
              )}
            </View>
            <Text style={styles.dateText}>{dateLabel}</Text>
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable onPress={onNotificationPress} style={styles.iconBtn}>
            <Bell size={22} color={colors.text.secondary} strokeWidth={1.8} />
          </Pressable>
          <Pressable onPress={handleLogout} style={styles.iconBtn}>
            <LogOut size={22} color={colors.danger.DEFAULT} strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>
    </>
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
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: fontSizes.base, fontFamily: fonts.semibold },
  greetingText: { fontSize: fontSizes.lg, fontFamily: fonts.semibold, color: colors.text.DEFAULT },
  dateText: { fontSize: fontSizes.sm, fontFamily: fonts.regular, color: colors.text.secondary },
  actions: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },
});
