import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

type StatusType =
  | "normal"
  | "warning"
  | "danger"
  | "completed"
  | "overdue"
  | "pending"
  | "upcoming"
  | "missed";

const STATUS_MAP: Record<
  StatusType,
  { bg: string; text: string; defaultLabel: string }
> = {
  normal:    { bg: colors.success.light,   text: colors.success.DEFAULT, defaultLabel: "Bình thường" },
  completed: { bg: colors.success.light,   text: colors.success.DEFAULT, defaultLabel: "Hoàn thành" },
  warning:   { bg: colors.warning.light,   text: colors.warning.DEFAULT, defaultLabel: "Cảnh báo" },
  upcoming:  { bg: colors.warning.light,   text: colors.warning.DEFAULT, defaultLabel: "Sắp tới" },
  danger:    { bg: colors.danger.light,    text: colors.danger.DEFAULT,  defaultLabel: "Nguy hiểm" },
  overdue:   { bg: colors.danger.light,    text: colors.danger.DEFAULT,  defaultLabel: "Quá hạn" },
  missed:    { bg: colors.danger.light,    text: colors.danger.DEFAULT,  defaultLabel: "Đã bỏ lỡ" },
  pending:   { bg: colors.surface.secondary, text: colors.text.muted,   defaultLabel: "Chờ" },
};

interface Props {
  status: StatusType;
  label?: string;
  showDot?: boolean;
}

export default function StatusBadge({ status, label, showDot = false }: Props) {
  const cfg = STATUS_MAP[status];
  return (
    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
      {showDot && <View style={[s.dot, { backgroundColor: cfg.text }]} />}
      <Text style={[s.text, { color: cfg.text }]}>{label ?? cfg.defaultLabel}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  dot: { width: 4, height: 4, borderRadius: 2 },
  text: { fontSize: 10, fontFamily: fonts.medium },
});
