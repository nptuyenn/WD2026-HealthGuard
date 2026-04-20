import { View, Text, StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/theme";
import VaccinationItem from "./VaccinationItem";
import type { Vaccination } from "@/lib/child-growth-api";

interface Props {
  ageGroup: string;
  items: Vaccination[];
  onMarkCompleted: (v: Vaccination) => void;
}

export default function VaccinationGroup({ ageGroup, items, onMarkCompleted }: Props) {
  const completed = items.filter((i) => i.status === "completed").length;
  const hasOverdue = items.some((i) => i.status === "overdue");
  const hasPendingUpcoming = items.some((i) => i.status === "pending");
  const allCompleted = completed === items.length;

  const nodeColor = allCompleted
    ? colors.success.DEFAULT
    : hasOverdue
    ? colors.danger.DEFAULT
    : hasPendingUpcoming
    ? colors.warning.DEFAULT
    : colors.text.muted;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={[s.node, { backgroundColor: nodeColor }]} />
        <Text style={s.groupTitle}>{ageGroup.toUpperCase()}</Text>
        <View style={s.flex1} />
        <View style={[s.badge, allCompleted && s.badgeDone]}>
          <Text style={[s.badgeText, allCompleted && s.badgeTextDone]}>
            {completed}/{items.length}{allCompleted ? " ✓" : ""}
          </Text>
        </View>
      </View>

      <View style={s.items}>
        {items.map((item, idx) => (
          <VaccinationItem
            key={item.id}
            item={item}
            index={idx}
            onMarkCompleted={onMarkCompleted}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  node: { width: 8, height: 8, borderRadius: 4 },
  groupTitle: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  flex1: { flex: 1 },
  badge: {
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeDone: { backgroundColor: colors.success.light },
  badgeText: { fontSize: 11, fontFamily: fonts.medium, color: colors.text.muted },
  badgeTextDone: { color: colors.success.DEFAULT },
  items: { gap: 6 },
});
