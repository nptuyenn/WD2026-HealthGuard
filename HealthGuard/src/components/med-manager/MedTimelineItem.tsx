import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInLeft,
} from "react-native-reanimated";
import { CheckCircle, XCircle } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";

export interface MedScheduleItem {
  id: string;
  name: string;
  dosage: string;
  unit: string;
  instructions: string;
  time: string;           // "07:30"
  status: "taken" | "pending" | "missed" | "future";
}

interface Props {
  item: MedScheduleItem;
  index?: number;
}

export default function MedTimelineItem({ item, index = 0 }: Props) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const borderColor =
    item.status === "taken"
      ? colors.success.DEFAULT
      : item.status === "pending"
      ? colors.warning.DEFAULT
      : item.status === "missed"
      ? colors.danger.DEFAULT
      : colors.text.muted;

  const bgColor =
    item.status === "pending"
      ? "rgba(245,158,11,0.08)"
      : colors.surface.card;

  const opacity = item.status === "future" ? 0.6 : 1;

  return (
    <Animated.View
      entering={FadeInLeft.duration(200).delay(index * 50)}
      style={pressStyle}
    >
    <Pressable
      style={[s.card, { borderLeftColor: borderColor, backgroundColor: bgColor, opacity }]}
      onPress={() => item.status === "pending" && Alert.alert("Đánh dấu đã uống", `${item.name}?`)}
      onPressIn={() => { scale.value = withTiming(0.98, { duration: 100 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
    >
      <View style={s.left}>
        <Text style={s.name}>
          {item.name} {item.dosage}{item.unit}
        </Text>
        <Text style={s.detail}>{item.instructions}</Text>
      </View>

      <View style={s.right}>
        <Text style={s.time}>{item.time}</Text>

        {item.status === "taken" && (
          <View style={s.takenDot}>
            <CheckCircle size={16} color={colors.success.DEFAULT} strokeWidth={1.8} />
          </View>
        )}

        {item.status === "pending" && (
          <Pressable
            style={s.drinkBtn}
            onPress={() => Alert.alert("Đánh dấu đã uống", `${item.name}?`)}
          >
            <Text style={s.drinkBtnText}>Uống ✓</Text>
          </Pressable>
        )}

        {item.status === "missed" && (
          <XCircle size={20} color={colors.danger.DEFAULT} strokeWidth={1.8} />
        )}
      </View>
    </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 3,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  left: { flex: 1 },
  name: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },
  detail: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  right: { alignItems: "flex-end", gap: 4 },
  time: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.text.secondary,
  },
  takenDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success.light,
    justifyContent: "center",
    alignItems: "center",
  },
  drinkBtn: {
    backgroundColor: colors.brand.DEFAULT,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  drinkBtnText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontFamily: fonts.medium,
  },
});
