import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { colors, fonts } from "@/theme";
import MedTimelineItem, { type MedScheduleItem } from "./MedTimelineItem";
import { mockMedications, mockMedLogs } from "@/lib/mock-data";

const TODAY_LABEL = "Hôm nay, 12/04/2026";
const TODAY = "2026-04-12";
const CURRENT_HOUR = 12;

interface TimeGroup {
  key: string;
  label: string;
  range: string;
  startH: number;
  endH: number;
}

const TIME_GROUPS: TimeGroup[] = [
  { key: "sang", label: "SÁNG", range: "06:00 - 11:59", startH: 6,  endH: 11 },
  { key: "trua", label: "TRƯA", range: "12:00 - 17:59", startH: 12, endH: 17 },
  { key: "toi",  label: "TỐI",  range: "18:00 - 23:59", startH: 18, endH: 23 },
];

function buildItemsFromData(data: any[]): MedScheduleItem[] {
  if (!data || data.length === 0) return []; 
  return data.flatMap((med) =>
    (med.timesPerDay ?? ["07:30"]).map((time: string) => ({
      id: `${med.id}-${time}`,
      name: med.name,
      dosage: med.dosage ?? "",
      unit: med.unit ?? "",
      instructions: med.instructions ?? "",
      time,
      status: "future" as MedScheduleItem["status"],
    }))
  );
}

function buildItemsFromMock(): MedScheduleItem[] {
  const items: MedScheduleItem[] = [];
  for (const med of mockMedications) {
    for (const time of med.timesPerDay) {
      const scheduledAt = `${TODAY}T${time}`;
      const log = mockMedLogs.find(
        (l) => l.medicationId === med.id && l.scheduledTime === scheduledAt
      );
      const hour = parseInt(time.split(":")[0], 10);
      let status: MedScheduleItem["status"] = "future";
      if (log?.status === "taken") status = "taken";
      else if (log?.status === "pending" && hour <= CURRENT_HOUR) status = "pending";
      else if (!log && hour < CURRENT_HOUR) status = "missed";
      else status = "future";
      items.push({
        id: `${med.id}-${time}`,
        name: med.name,
        dosage: med.dosage,
        unit: med.unit,
        instructions: med.instructions,
        time,
        status,
      });
    }
  }
  return items;
}

function groupStatus(items: MedScheduleItem[], group: TimeGroup): "past" | "current" | "future" {
  if (CURRENT_HOUR > group.endH) return "past";
  if (CURRENT_HOUR >= group.startH && CURRENT_HOUR <= group.endH) return "current";
  return "future";
}

interface Props {
  data?: any[];
  onAddPress: () => void;
}

export default function MedTimeline({ data = [], onAddPress }: Props) {
  const allItems = buildItemsFromData(data);

  return (
    <View>
      <View style={s.dateHeader}>
        <Pressable accessibilityLabel="Hôm qua">
          <ChevronLeft size={20} color={colors.text.secondary} strokeWidth={1.8} />
        </Pressable>
        <Text style={s.dateText}>{TODAY_LABEL}</Text>
        <Pressable accessibilityLabel="Ngày mai">
          <ChevronRight size={20} color={colors.text.secondary} strokeWidth={1.8} />
        </Pressable>
      </View>

      <View style={s.timeline}>
        <View style={s.verticalLine} />

        {TIME_GROUPS.map((group) => {
          const items = allItems.filter(({ time }) => {
            const h = parseInt(time.split(":")[0], 10);
            return h >= group.startH && h <= group.endH;
          });
          const gStatus = groupStatus(items, group);
          const nodeColor =
            gStatus === "past"
              ? colors.success.DEFAULT
              : gStatus === "current"
              ? colors.brand.DEFAULT
              : colors.text.muted;

          return (
            <View key={group.key} style={s.group}>
              <View style={s.groupLabel}>
                {gStatus === "current" ? (
                  <View style={s.nodeGlow}>
                    <View style={[s.node, { backgroundColor: nodeColor, borderColor: nodeColor }]} />
                  </View>
                ) : (
                  <View style={[s.node, {
                    backgroundColor: gStatus === "past" ? nodeColor : "#FFFFFF",
                    borderColor: nodeColor,
                  }]} />
                )}
                <Text style={s.groupTime}>
                  <Text style={s.groupName}>{group.label}</Text>
                  {`  (${group.range})`}
                </Text>
              </View>

              <View style={s.items}>
                {items.map((item, idx) => (
                  <MedTimelineItem key={item.id} item={item} index={idx} />
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