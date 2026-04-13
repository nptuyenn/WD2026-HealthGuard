import { View, Text, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { colors, fonts, radius } from "@/theme";
import VaccinationGroup from "./VaccinationGroup";
import { mockVaccinations } from "@/lib/mock-data";
import type { VaccinationRecord } from "./VaccinationItem";

export default function VaccinationTracker({ childId }: { childId: string }) {
  const childVax = mockVaccinations.filter((v) => v.childId === childId) as VaccinationRecord[];
  const completed = childVax.filter((v) => v.status === "completed").length;
  const total = childVax.length;
  const pct = total > 0 ? completed / total : 0;

  const fillW = useSharedValue(0);
  useEffect(() => {
    fillW.value = withTiming(pct, { duration: 600 });
  }, [childId]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillW.value * 100}%` as unknown as number,
    backgroundColor: colors.success.DEFAULT,
  }));

  // Group by ageGroup
  const groups: Record<string, VaccinationRecord[]> = {};
  for (const v of childVax) {
    if (!groups[v.ageGroup]) groups[v.ageGroup] = [];
    groups[v.ageGroup].push(v);
  }

  return (
    <View style={s.container}>
      {/* Progress */}
      <View style={s.progressSection}>
        <View style={s.progressHeader}>
          <Text style={s.progressLabel}>
            Đã tiêm {completed}/{total} mũi
          </Text>
          <Text style={s.progressPct}>{Math.round(pct * 100)}%</Text>
        </View>
        <View style={s.progressBg}>
          <Animated.View style={[s.progressFill, fillStyle]} />
        </View>
      </View>

      {/* Groups */}
      <View style={s.timeline}>
        <View style={s.verticalLine} />
        {Object.entries(groups).map(([ageGroup, items]) => (
          <VaccinationGroup key={ageGroup} ageGroup={ageGroup} items={items} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  progressSection: { marginBottom: 20 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: { fontSize: 14, fontFamily: fonts.medium, color: colors.text.DEFAULT },
  progressPct: { fontSize: 14, fontFamily: fonts.medium, color: colors.success.DEFAULT },
  progressBg: {
    height: 8,
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    height: 8,
    borderRadius: radius.full,
  },
  timeline: { position: "relative", paddingLeft: 16 },
  verticalLine: {
    position: "absolute",
    left: 19,
    top: 4,
    bottom: 0,
    width: 2,
    backgroundColor: colors.border.DEFAULT,
  },
});
