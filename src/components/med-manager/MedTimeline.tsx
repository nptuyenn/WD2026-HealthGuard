import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { colors, fonts } from "@/theme";
import MedTimelineItem, { type MedScheduleItem, type DisplayStatus } from "./MedTimelineItem";
import type { TimelineEvent } from "@/lib/medications-api";

interface TimeGroup {
  key: string;
  label: string;
  range: string;
  startH: number;
  endH: number;
}

const TIME_GROUPS: TimeGroup[] = [
  { key: "sang", label: "SÁNG", range: "06:00 - 11:59", startH: 6, endH: 11 },
  { key: "trua", label: "TRƯA", range: "12:00 - 17:59", startH: 12, endH: 17 },
  { key: "toi",  label: "TỐI",  range: "18:00 - 23:59", startH: 18, endH: 23 },
];

function displayStatus(e: TimelineEvent, currentHHMM: string): DisplayStatus {
  if (e.status === "taken") return "taken";
  if (e.status === "missed" || e.status === "skipped") return "missed";
  return e.scheduledTime <= currentHHMM ? "pending" : "future";
}

interface Props {
  events: TimelineEvent[];
  onMarkTaken: (item: MedScheduleItem) => void;
  onAddPress: () => void;
  selectedDate: Date;
  onChangeDate: (d: Date) => void;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function MedTimeline({ events, onMarkTaken, onAddPress, selectedDate, onChangeDate }: Props) {
  const now = new Date();
  const isToday = sameDay(selectedDate, now);
  const currentHHMM = isToday
    ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    : "23:59";
  const currentHour = isToday ? now.getHours() : 24;
  const prefix = isToday ? "Hôm nay, " : "";
  const todayLabel = `${prefix}${selectedDate.toLocaleDateString("vi-VN")}`;

  const shiftDay = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    onChangeDate(d);
  };

  const items: MedScheduleItem[] = events.map((e) => ({
    id: e.eventKey,
    scheduleId: e.scheduleId,
    scheduledAt: e.scheduledAt,
    name: e.medicationName,
    dosage: e.dosage,
    unit: e.unit,
    instructions: e.instructions,
    time: e.scheduledTime,
    status: displayStatus(e, currentHHMM),
  }));

  return (
    <View>
      <View style={s.dateHeader}>
        <Pressable accessibilityLabel="Ngày trước" onPress={() => shiftDay(-1)} hitSlop={8}>
          <ChevronLeft size={20} color={colors.text.secondary} strokeWidth={1.8} />
        </Pressable>
        <Pressable onPress={() => onChangeDate(new Date())}>
          <Text style={s.dateText}>{todayLabel}</Text>
        </Pressable>
        <Pressable accessibilityLabel="Ngày sau" onPress={() => shiftDay(1)} hitSlop={8}>
          <ChevronRight size={20} color={colors.text.secondary} strokeWidth={1.8} />
        </Pressable>
      </View>

      {items.length === 0 && (
        <Text style={s.empty}>Không có lịch uống thuốc cho ngày này.</Text>
      )}

      <View style={s.timeline}>
        <View style={s.verticalLine} />

        {TIME_GROUPS.map((group) => {
          const groupItems = items.filter(({ time }) => {
            const h = parseInt(time.split(":")[0], 10);
            return h >= group.startH && h <= group.endH;
          });

          const gStatus: "past" | "current" | "future" =
            currentHour > group.endH
              ? "past"
              : currentHour >= group.startH
              ? "current"
              : "future";

          const nodeColor =
            gStatus === "past"
              ? colors.success.DEFAULT
              : gStatus === "current"
              ? colors.brand.DEFAULT
              : colors.text.muted;

          if (groupItems.length === 0) return null;

          return (
            <View key={group.key} style={s.group}>
              <View style={s.groupLabel}>
                {gStatus === "current" ? (
                  <View style={s.nodeGlow}>
                    <View style={[s.node, { backgroundColor: nodeColor, borderColor: nodeColor }]} />
                  </View>
                ) : (
                  <View
                    style={[
                      s.node,
                      {
                        backgroundColor: gStatus === "past" ? nodeColor : "#FFFFFF",
                        borderColor: nodeColor,
                      },
                    ]}
                  />
                )}
                <Text style={s.groupTime}>
                  <Text style={s.groupName}>{group.label}</Text>
                  {`  (${group.range})`}
                </Text>
              </View>

              <View style={s.items}>
                {groupItems.map((item, idx) => (
                  <MedTimelineItem
                    key={item.id}
                    item={item}
                    index={idx}
                    onMarkTaken={onMarkTaken}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>

      <Pressable style={s.fab} onPress={onAddPress}>
        <Text style={s.fabIcon}>＋</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text.DEFAULT },
  empty: {
    textAlign: "center",
    marginVertical: 40,
    color: colors.text.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  timeline: { paddingLeft: 24, position: "relative", paddingHorizontal: 16 },
  verticalLine: {
    position: "absolute",
    left: 27,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.border.DEFAULT,
  },
  group: { marginBottom: 24 },
  groupLabel: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  nodeGlow: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  node: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  groupName: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
  },
  groupTime: { fontSize: 11, color: colors.text.muted, fontFamily: fonts.regular },
  items: { marginLeft: 12, gap: 8 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: colors.brand.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  fabIcon: { fontSize: 28, color: "#FFFFFF", lineHeight: 32 },
});
