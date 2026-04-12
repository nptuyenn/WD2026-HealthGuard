import { View, Text, Pressable, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";
import { colors, fonts, fontSizes } from "@/theme";
import { mockNotifications } from "@/lib/mock-data";

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 11) return "buổi sáng";
  if (hour >= 11 && hour < 17) return "buổi chiều";
  if (hour >= 17 && hour < 22) return "buổi tối";
  return "khuya";
}

function formatVietnameseDate(date: Date): string {
  const days = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
  const dayName = days[date.getDay()];
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${dayName}, ${d} tháng ${m}, ${y}`;
}

interface Props {
  onNotificationPress?: () => void;
}

export default function GreetingHeader({ onNotificationPress }: Props) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = getGreeting(hour);
  const dateLabel = formatVietnameseDate(now);
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>NM</Text>
        </View>
        <View>
          <Text style={styles.greetingText}>Chào {greeting}, Minh</Text>
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>
      </View>

      <Pressable onPress={onNotificationPress} style={styles.bellWrapper}>
        <Bell size={24} color={colors.text.secondary} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </Pressable>
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
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
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
  bellWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
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
