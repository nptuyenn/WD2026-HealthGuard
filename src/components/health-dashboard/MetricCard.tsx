import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInRight,
} from "react-native-reanimated";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";

export interface MetricCardData {
  id: string;
  title: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  value: string;
  unit: string;
  change: string;
  changeDir: "up" | "down" | "neutral";
  sparklineData: number[];
  status: "normal" | "warning" | "danger";
  statusLabel: string;
}

const STATUS_COLORS = {
  normal:  { accent: colors.success.DEFAULT, bg: colors.success.light, text: colors.success.DEFAULT },
  warning: { accent: colors.warning.DEFAULT, bg: colors.warning.light, text: colors.warning.DEFAULT },
  danger:  { accent: colors.danger.DEFAULT,  bg: colors.danger.light,  text: colors.danger.DEFAULT  },
};

const CHANGE_COLORS = {
  up:      colors.danger.DEFAULT,
  down:    colors.success.DEFAULT,
  neutral: colors.text.muted,
};

export default function MetricCard({
  card,
  width,
  index = 0,
}: {
  card: MetricCardData;
  width: number;
  index?: number;
}) {
  const sc = STATUS_COLORS[card.status];
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const changeColor = CHANGE_COLORS[card.changeDir];
  const ChangeIcon =
    card.changeDir === "up" ? TrendingUp : card.changeDir === "down" ? TrendingDown : Minus;
  const Icon = card.icon;

  return (
    <Animated.View entering={FadeInRight.duration(250).delay(index * 80)} style={pressStyle}>
      <Pressable
        style={[s.card, { width }]}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }); }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
      >
        {/* Top: Icon tile + Title */}
        <View style={s.header}>
          <View style={[s.iconTile, { backgroundColor: sc.bg }]}>
            <Icon size={18} color={sc.accent} strokeWidth={2} />
          </View>
          <Text style={s.title} numberOfLines={1}>
            {card.title}
          </Text>
        </View>

        {/* Middle: Large value */}
        <View style={s.valueRow}>
          <Text style={s.value} numberOfLines={1} adjustsFontSizeToFit>
            {card.value}
          </Text>
          <Text style={s.unit}>{card.unit}</Text>
        </View>

        {/* Bottom: Status badge + change */}
        <View style={s.footer}>
          <View style={[s.badge, { backgroundColor: sc.bg }]}>
            <View style={[s.dot, { backgroundColor: sc.accent }]} />
            <Text style={[s.badgeText, { color: sc.text }]}>{card.statusLabel}</Text>
          </View>
          <View style={s.changeWrap}>
            <ChangeIcon size={12} color={changeColor} strokeWidth={2.2} />
            <Text style={[s.changeText, { color: changeColor }]}>{card.change}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: 14,
    gap: 10,
    ...shadows.card,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
    flex: 1,
  },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  value: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.text.DEFAULT,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    fontFamily: fonts.regular,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontFamily: fonts.semibold },
  changeWrap: { flexDirection: "row", alignItems: "center", gap: 2 },
  changeText: { fontFamily: fonts.mono, fontSize: 11 },
});
