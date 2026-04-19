import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInUp,
} from "react-native-reanimated";
import { Pill } from "lucide-react-native";
import { colors, fonts, radius, shadows } from "@/theme";

export interface CabinetItem {
  id: string;
  name: string;
  quantityTotal: number;
  quantityRemaining: number;
  expiryDate: string;
  lowStockThreshold: number;
}

function formatExpiry(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function isExpired(iso: string) {
  if (!iso) return false;
  const today = new Date().toISOString().slice(0, 10);
  return iso < today;
}

export default function CabinetCard({
  item,
  width,
  index = 0,
}: {
  item: CabinetItem;
  width: number;
  index?: number;
}) {
  const pct = item.quantityTotal > 0 ? item.quantityRemaining / item.quantityTotal : 0;
  const fillW = useSharedValue(0);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  useEffect(() => {
    fillW.value = withTiming(pct, { duration: 500 });
  }, []);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillW.value * 100}%` as unknown as number,
    backgroundColor:
      pct > 0.5
        ? colors.success.DEFAULT
        : pct > 0.2
        ? colors.warning.DEFAULT
        : colors.danger.DEFAULT,
  }));

  const expired = isExpired(item.expiryDate);
  const lowStock =
    item.quantityRemaining > 0 && item.quantityRemaining < item.lowStockThreshold;
  const empty = item.quantityRemaining === 0 && item.quantityTotal > 0;

  const badge = expired
    ? { bg: colors.danger.DEFAULT, label: "Hết hạn" }
    : empty
    ? { bg: colors.text.muted, label: "Hết" }
    : lowStock
    ? { bg: colors.warning.DEFAULT, label: "Sắp hết" }
    : null;

  const borderStyle = expired
    ? { borderWidth: 2, borderColor: colors.danger.DEFAULT, opacity: 0.8 }
    : lowStock
    ? { borderWidth: 2, borderColor: colors.warning.DEFAULT }
    : {};

  return (
    <Animated.View
      entering={FadeInUp.duration(250).delay(index * 60)}
      style={pressStyle}
    >
      <Pressable
        style={[s.card, { width }, borderStyle]}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }); }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
      >
        {badge && (
          <View style={[s.badge, { backgroundColor: badge.bg }]}>
            <Text style={s.badgeText}>{badge.label}</Text>
          </View>
        )}

        <View style={s.iconWrap}>
          <Pill size={24} color={colors.brand.DEFAULT} strokeWidth={1.8} />
        </View>

        <Text style={s.name} numberOfLines={2}>{item.name}</Text>
        <Text style={s.remaining}>
          {item.quantityTotal > 0 ? `Còn: ${item.quantityRemaining} viên` : "Chưa nhập kho"}
        </Text>

        {item.quantityTotal > 0 && (
          <View style={s.progressBg}>
            <Animated.View style={[s.progressFill, fillStyle]} />
          </View>
        )}

        <Text style={s.expiry}>HSD: {formatExpiry(item.expiryDate)}</Text>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: 16,
    alignItems: "center",
    position: "relative",
    ...shadows.card,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, color: "#FFFFFF", fontFamily: fonts.medium },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    textAlign: "center",
    color: colors.text.DEFAULT,
    marginTop: 8,
  },
  remaining: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: fonts.regular,
    marginTop: 4,
  },
  progressBg: {
    height: 4,
    backgroundColor: colors.surface.secondary,
    borderRadius: 2,
    marginTop: 6,
    width: "100%",
    overflow: "hidden",
  },
  progressFill: { position: "absolute", height: 4, borderRadius: 2, left: 0 },
  expiry: {
    fontSize: 11,
    color: colors.text.muted,
    fontFamily: fonts.regular,
    marginTop: 4,
  },
});
