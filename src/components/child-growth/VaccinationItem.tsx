import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInLeft,
} from "react-native-reanimated";
import { CheckCircle2, AlertCircle, Clock, Circle, Check } from "lucide-react-native";
import { colors, fonts, radius } from "@/theme";
import type { Vaccination } from "@/lib/child-growth-api";

const SOON_DAYS = 30;

function isUpcoming(date: string) {
  const diff = (new Date(date).getTime() - Date.now()) / 86400000;
  return diff >= 0 && diff <= SOON_DAYS;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN");
}

type Props = {
  item: Vaccination;
  index?: number;
  onMarkCompleted: (vax: Vaccination) => void;
};

export default function VaccinationItem({ item, index = 0, onMarkCompleted }: Props) {
  const { status, vaccineName, doseNumber, scheduledDate, administeredAt } = item;

  const pulseOpacity = useSharedValue(1);
  useEffect(() => {
    if (status === "overdue") {
      pulseOpacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [status]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));

  const upcoming = status === "pending" && isUpcoming(scheduledDate);
  const future = status === "pending" && !upcoming;

  const bg =
    status === "completed"
      ? "rgba(16,185,129,0.08)"
      : status === "overdue"
      ? "rgba(239,68,68,0.1)"
      : upcoming
      ? "rgba(245,158,11,0.08)"
      : "transparent";

  const borderStyle =
    status === "overdue" ? { borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" } : {};

  const confirmMark = () =>
    Alert.alert("Ghi nhận tiêm", `${vaccineName} — Mũi ${doseNumber}?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Đã tiêm", onPress: () => onMarkCompleted(item) },
    ]);

  return (
    <Animated.View entering={FadeInLeft.duration(200).delay(index * 40)}>
      <View style={[s.row, { backgroundColor: bg }, borderStyle]}>
        <View style={s.iconWrap}>
          {status === "completed" && (
            <CheckCircle2 size={20} color={colors.success.DEFAULT} strokeWidth={1.8} />
          )}
          {status === "overdue" && (
            <Animated.View style={pulseStyle}>
              <AlertCircle size={20} color={colors.danger.DEFAULT} strokeWidth={1.8} />
            </Animated.View>
          )}
          {upcoming && <Clock size={20} color={colors.warning.DEFAULT} strokeWidth={1.8} />}
          {future && <Circle size={20} color={colors.text.muted} strokeWidth={1.8} />}
          {status === "skipped" && <Circle size={20} color={colors.text.muted} strokeWidth={1.8} />}
        </View>

        <View style={s.info}>
          <Text style={s.name}>
            {vaccineName} — Mũi {doseNumber}
          </Text>
          {status === "completed" && administeredAt && (
            <Text style={[s.date, { color: colors.success.DEFAULT }]}>
              Đã tiêm: {formatDate(administeredAt)}
            </Text>
          )}
          {status === "overdue" && (
            <Text style={[s.date, s.overdue]}>
              Quá hạn! Lịch: {formatDate(scheduledDate)}
            </Text>
          )}
          {(upcoming || future) && (
            <Text style={[s.date, { color: colors.text.muted }]}>
              Dự kiến: {formatDate(scheduledDate)}
            </Text>
          )}
        </View>

        {(status === "overdue" || upcoming) && (
          <Pressable style={s.actionBtn} onPress={confirmMark}>
            <Text style={s.actionText}>Ghi nhận</Text>
          </Pressable>
        )}
        {status === "completed" && (
          <Check size={16} color={colors.success.DEFAULT} strokeWidth={2} />
        )}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    gap: 12,
  },
  iconWrap: { width: 20 },
  info: { flex: 1 },
  name: { fontSize: 14, fontFamily: fonts.medium, color: colors.text.DEFAULT },
  date: { fontSize: 12, fontFamily: fonts.regular, marginTop: 1 },
  overdue: { color: colors.danger.DEFAULT, fontFamily: fonts.medium },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: { fontSize: 11, color: colors.text.secondary, fontFamily: fonts.medium },
});
