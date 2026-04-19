import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Calendar, Stethoscope, MapPin, Trash2 } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import type { Appointment } from "@/lib/appointments-api";

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const map: Record<Appointment["status"], { bg: string; text: string; label: string }> = {
    upcoming: { bg: colors.purple.light, text: colors.purple.DEFAULT, label: "Sắp tới" },
    completed: { bg: colors.success.light, text: colors.success.DEFAULT, label: "Hoàn thành" },
    cancelled: { bg: colors.danger.light, text: colors.danger.DEFAULT, label: "Đã hủy" },
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

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("vi-VN")} — ${d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

const borderColor = (status: Appointment["status"]) => {
  if (status === "upcoming") return colors.purple.DEFAULT;
  if (status === "completed") return colors.success.DEFAULT;
  return colors.danger.DEFAULT;
};

type Props = {
  apt: Appointment;
  index?: number;
  onDelete: (id: string) => void;
};

export default function AppointmentCard({ apt, index = 0, onDelete }: Props) {
  const confirmDelete = () =>
    Alert.alert("Xóa lịch hẹn", `Xóa "${apt.title}"?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => onDelete(apt.id) },
    ]);

  return (
    <Animated.View entering={FadeInUp.duration(250).delay(index * 80)}>
      <View style={[s.card, { borderLeftColor: borderColor(apt.status) }]}>
        <View style={s.row}>
          <View style={s.dateRow}>
            <Calendar size={14} color={colors.text.secondary} strokeWidth={1.8} />
            <Text style={s.dateText}>{formatDateTime(apt.scheduledAt)}</Text>
          </View>
          <StatusBadge status={apt.status} />
        </View>

        <Text style={s.title}>{apt.title}</Text>

        {(apt.doctorName || apt.location) && (
          <View style={s.metaRow}>
            {apt.doctorName ? (
              <>
                <Stethoscope size={14} color={colors.text.muted} strokeWidth={1.8} />
                <Text style={s.metaText}>{apt.doctorName}</Text>
              </>
            ) : null}
            {apt.doctorName && apt.location ? <Text style={s.metaText}> — </Text> : null}
            {apt.location ? (
              <>
                <MapPin size={14} color={colors.text.muted} strokeWidth={1.8} />
                <Text style={s.metaText}>{apt.location}</Text>
              </>
            ) : null}
          </View>
        )}

        {apt.notes ? (
          <View style={s.noteBox}>
            <Text style={s.noteText}>Ghi chú: {apt.notes}</Text>
          </View>
        ) : null}

        <View style={s.actions}>
          <Pressable style={s.iconBtn} onPress={confirmDelete}>
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
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text.secondary },
  title: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.text.DEFAULT },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  metaText: { fontSize: 13, color: colors.text.secondary, fontFamily: fonts.regular },
  noteBox: { backgroundColor: colors.surface.secondary, padding: 8, borderRadius: radius.sm },
  noteText: {
    fontSize: 12,
    color: colors.text.muted,
    fontStyle: "italic",
    fontFamily: fonts.regular,
  },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  iconBtn: { padding: 8 },
});
