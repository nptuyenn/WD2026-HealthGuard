import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Calendar, Stethoscope, MapPin, Pencil, Trash2 } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";

export interface Appointment {
  id: string;
  title: string;
  doctorName: string;
  hospital: string;
  appointmentDate: string;   // "2026-04-15T09:00"
  notes: string;
  status: "upcoming" | "completed" | "cancelled" | "missed";
}

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const map = {
    upcoming:  { bg: colors.purple.light,   text: colors.purple.DEFAULT,  label: "Sắp tới" },
    completed: { bg: colors.success.light,  text: colors.success.DEFAULT, label: "Hoàn thành" },
    cancelled: { bg: colors.danger.light,   text: colors.danger.DEFAULT,  label: "Đã hủy" },
    missed:    { bg: colors.danger.light,   text: colors.danger.DEFAULT,  label: "Bỏ lỡ" },
  };
  const { bg, text, label } = map[status];
  return (
    <View style={[sb.badge, { backgroundColor: bg }]}>
      <Text style={[sb.text, { color: text }]}>{label}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  badge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  text: { fontSize: 11, fontFamily: fonts.medium },
});

function formatDate(iso: string) {
  const [datePart, timePart] = iso.split("T");
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y} — ${timePart}`;
}

const borderColor = (status: Appointment["status"]) => {
  if (status === "upcoming") return colors.purple.DEFAULT;
  if (status === "completed") return colors.success.DEFAULT;
  return colors.danger.DEFAULT;
};

export default function AppointmentCard({ apt, index = 0 }: { apt: Appointment; index?: number }) {
  return (
    <Animated.View entering={FadeInUp.duration(250).delay(index * 80)}>
    <View style={[s.card, { borderLeftColor: borderColor(apt.status) }]}>
      <View style={s.row}>
        <View style={s.dateRow}>
          <Calendar size={14} color={colors.text.secondary} strokeWidth={1.8} />
          <Text style={s.dateText}>{formatDate(apt.appointmentDate)}</Text>
        </View>
        <StatusBadge status={apt.status} />
      </View>

      <Text style={s.title}>{apt.title}</Text>

      <View style={s.metaRow}>
        <Stethoscope size={14} color={colors.text.muted} strokeWidth={1.8} />
        <Text style={s.metaText}>{apt.doctorName}</Text>
        <Text style={s.metaText}> — </Text>
        <MapPin size={14} color={colors.text.muted} strokeWidth={1.8} />
        <Text style={s.metaText}>{apt.hospital}</Text>
      </View>

      {apt.notes ? (
        <View style={s.noteBox}>
          <Text style={s.noteText}>Ghi chú: {apt.notes}</Text>
        </View>
      ) : null}

      <View style={s.actions}>
        <Pressable style={s.iconBtn} onPress={() => Alert.alert("OK", "Chỉnh sửa")}>
          <Pencil size={18} color={colors.text.secondary} strokeWidth={1.8} />
        </Pressable>
        <Pressable style={s.iconBtn} onPress={() => Alert.alert("Xóa", `Xóa ${apt.title}?`)}>
          <Trash2 size={18} color={colors.danger.DEFAULT} strokeWidth={1.8} />
        </Pressable>
      </View>
    </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    padding: 16,
    borderLeftWidth: 3,
    gap: 8,
    ...shadows.card,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text.secondary },
  title: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.text.DEFAULT },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  metaText: { fontSize: 13, color: colors.text.secondary, fontFamily: fonts.regular },
  noteBox: {
    backgroundColor: colors.surface.secondary,
    padding: 8,
    borderRadius: radius.sm,
  },
  noteText: {
    fontSize: 12,
    color: colors.text.muted,
    fontStyle: "italic",
    fontFamily: fonts.regular,
  },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  iconBtn: { padding: 8 },
});
