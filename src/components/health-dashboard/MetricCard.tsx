import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInRight,
} from "react-native-reanimated";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import SparklineChart from "./SparklineChart";

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
  normal:  { border: colors.success.DEFAULT, bg: colors.success.light, text: colors.success.DEFAULT, icon: colors.success.DEFAULT },
  warning: { border: colors.warning.DEFAULT, bg: colors.warning.light, text: colors.warning.DEFAULT, icon: colors.warning.DEFAULT },
  danger:  { border: colors.danger.DEFAULT,  bg: colors.danger.light,  text: colors.danger.DEFAULT,  icon: colors.danger.DEFAULT },
};

// For BP-like metrics: "up" is bad (danger), "down" is good (success)
// We use "changeDir" to determine color: up=danger, down=success, neutral=muted
const CHANGE_COLORS = {
  up:      colors.danger.DEFAULT,
  down:    colors.success.DEFAULT,
  neutral: colors.text.muted,
};

export default function MetricCard({ card, width, index = 0 }: { card: MetricCardData; width: number; index?: number }) {
  const sc = STATUS_COLORS[card.status];
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const changeColor = CHANGE_COLORS[card.changeDir];
  const ChangeIcon =
    card.changeDir === "up"
      ? TrendingUp
      : card.changeDir === "down"
      ? TrendingDown
      : Minus;
  const Icon = card.icon;

  return (
    <Animated.View
      entering={FadeInRight.duration(250).delay(index * 80)}
      style={pressStyle}
    >
    <Pressable
      style={[s.card, { width, borderLeftColor: sc.border }]}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
    >
      <View style={s.row1}>
        <Icon size={20} color={sc.icon} strokeWidth={1.8} />
        <View style={s.changeWrap}>
          <ChangeIcon size={14} color={changeColor} strokeWidth={2} />
          <Text style={[s.changeText, { color: changeColor }]}>{card.change}</Text>
        </View>
      </View>

      <View style={s.row2}>
        <Text style={s.value}>{card.value}</Text>
        <Text style={s.unit}>{card.unit}</Text>
      </View>

      <SparklineChart data={card.sparklineData} color={sc.border} height={32} />

      <View style={[s.badge, { backgroundColor: sc.bg }]}>
        <Text style={[s.badgeText, { color: sc.text }]}>{card.statusLabel}</Text>
      </View>

      <Text style={s.title} numberOfLines={1}>{card.title}</Text>
    </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: 16,
    borderLeftWidth: 3,
    gap: 8,
    minWidth: 140,
    ...shadows.card,
  },
  row1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeWrap: { flexDirection: "row", alignItems: "center", gap: 2 },
  changeText: { fontFamily: fonts.mono, fontSize: fontSizes.xs },
  row2: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  value: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["2xl"],
    color: colors.text.DEFAULT,
  },
  unit: { fontSize: fontSizes.xs, color: colors.text.muted, fontFamily: fonts.regular },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontFamily: fonts.medium },
  title: { fontSize: fontSizes.xs, color: colors.text.secondary, fontFamily: fonts.medium },
});
