import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from "react-native";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";
import AppointmentCard, { type Appointment } from "./AppointmentCard";
import { mockAppointments } from "@/lib/mock-data";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  // 0=Sun…6=Sat → map to Mon-first: Mon=0, …, Sun=6
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

export default function AppointmentCalendar() {
  const { width: screenWidth } = useWindowDimensions();
  const cellW = (screenWidth - 32) / 7;

  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3); // 0-indexed → April
  const [selectedDay, setSelectedDay] = useState(13);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);

  // Build grid cells: empty slots + day numbers
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = `Tháng ${month + 1}, ${year}`;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Dates with appointments this month (format: "YYYY-MM-DD")
  const aptsThisMonth = (mockAppointments as Appointment[]).filter((a) => {
    const d = a.appointmentDate.split("T")[0];
    const [ay, am] = d.split("-").map(Number);
    return ay === year && am === month + 1;
  });

  const dotForDay = (day: number): Appointment["status"] | null => {
    const isoDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const apt = aptsThisMonth.find((a) => a.appointmentDate.startsWith(isoDate));
    return apt?.status ?? null;
  };

  const dotColor = (status: Appointment["status"]) => {
    if (status === "upcoming") return colors.purple.DEFAULT;
    if (status === "completed") return colors.success.DEFAULT;
    return colors.danger.DEFAULT;
  };

  return (
    <View style={s.container}>
      {/* Calendar header */}
      <View style={s.calHeader}>
        <Pressable onPress={prevMonth}><ChevronLeft size={20} color={colors.text.secondary} strokeWidth={1.8} /></Pressable>
        <Text style={s.monthLabel}>{monthLabel}</Text>
        <Pressable onPress={nextMonth}><ChevronRight size={20} color={colors.text.secondary} strokeWidth={1.8} /></Pressable>
      </View>

      {/* Weekday row */}
      <View style={s.weekRow}>
        {WEEKDAYS.map((wd) => (
          <Text key={wd} style={[s.weekDay, { width: cellW }]}>{wd}</Text>
        ))}
      </View>

      {/* Date grid */}
      <FlatList
        data={cells}
        keyExtractor={(_, i) => String(i)}
        numColumns={7}
        scrollEnabled={false}
        renderItem={({ item: day }) => {
          if (day === null) {
            return <View style={{ width: cellW, height: 40 }} />;
          }
          const isSelected = day === selectedDay;
          const isToday = year === 2026 && month === 3 && day === 13;
          const dot = dotForDay(day);

          return (
            <Pressable
              style={[
                s.cell,
                { width: cellW },
                isToday && s.todayCell,
                isSelected && s.selectedCell,
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  s.cellText,
                  isSelected && s.selectedText,
                ]}
              >
                {day}
              </Text>
              {dot && !isSelected && (
                <View style={[s.dot, { backgroundColor: dotColor(dot) }]} />
              )}
            </Pressable>
          );
        }}
      />

      {/* Appointment list */}
      <View style={s.listHeader}>
        <Text style={s.listTitle}>Lịch tái khám</Text>
        <Pressable style={s.addBtn} onPress={() => Alert.alert("Thêm lịch tái khám")}>
          <Plus size={14} color={colors.brand.DEFAULT} strokeWidth={2} />
          <Text style={s.addBtnText}>Thêm lịch</Text>
        </Pressable>
      </View>

      <View style={s.aptList}>
        {(mockAppointments as Appointment[]).map((apt, idx) => (
          <AppointmentCard key={apt.id} apt={apt} index={idx} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  monthLabel: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.text.DEFAULT },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekDay: { fontSize: 12, color: colors.text.muted, textAlign: "center", fontFamily: fonts.medium },
  cell: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cellText: { fontSize: 14, color: colors.text.DEFAULT, fontFamily: fonts.regular },
  todayCell: { borderWidth: 2, borderColor: colors.brand.DEFAULT, borderRadius: 20 },
  selectedCell: { backgroundColor: colors.brand.DEFAULT, borderRadius: 20 },
  selectedText: { color: "#FFFFFF", fontFamily: fonts.semibold },
  dot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  listTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text.DEFAULT },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.brand.DEFAULT,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: { fontSize: 13, color: colors.brand.DEFAULT, fontFamily: fonts.medium },
  aptList: { gap: 12 },
});
