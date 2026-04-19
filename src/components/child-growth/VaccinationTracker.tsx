import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Syringe } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";
import VaccinationGroup from "./VaccinationGroup";
import type { Vaccination } from "@/lib/child-growth-api";

type Props = {
  vaccinations: Vaccination[];
  seeding: boolean;
  onSeedTcmr: () => void;
  onMarkCompleted: (v: Vaccination) => void;
};

export default function VaccinationTracker({
  vaccinations,
  seeding,
  onSeedTcmr,
  onMarkCompleted,
}: Props) {
  const completed = vaccinations.filter((v) => v.status === "completed").length;
  const total = vaccinations.length;
  const pct = total > 0 ? completed / total : 0;

  const fillW = useSharedValue(0);
  useEffect(() => {
    fillW.value = withTiming(pct, { duration: 600 });
  }, [pct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillW.value * 100}%` as unknown as number,
    backgroundColor: colors.success.DEFAULT,
  }));

  if (total === 0) {
    return (
      <View style={s.empty}>
        <Syringe size={48} color={colors.text.muted} strokeWidth={1.5} />
        <Text style={s.emptyTitle}>Chưa có lịch tiêm chủng</Text>
        <Text style={s.emptySubtitle}>
          Nhấn bên dưới để tự động tạo lịch TCMR theo ngày sinh.
        </Text>
        <Pressable
          style={[s.seedBtn, seeding && { opacity: 0.6 }]}
          onPress={onSeedTcmr}
          disabled={seeding}
        >
          {seeding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.seedBtnText}>Tạo lịch TCMR</Text>
          )}
        </Pressable>
      </View>
    );
  }

  const groups: Record<string, Vaccination[]> = {};
  for (const v of vaccinations) {
    const key = v.ageGroup ?? "Khác";
    if (!groups[key]) groups[key] = [];
    groups[key].push(v);
  }

  return (
    <View style={s.container}>
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

      <View style={s.timeline}>
        <View style={s.verticalLine} />
        {Object.entries(groups).map(([ageGroup, items]) => (
          <VaccinationGroup
            key={ageGroup}
            ageGroup={ageGroup}
            items={items}
            onMarkCompleted={onMarkCompleted}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  empty: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.text.DEFAULT },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    textAlign: "center",
    maxWidth: 280,
  },
  seedBtn: {
    backgroundColor: colors.brand.DEFAULT,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  seedBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: fontSizes.base,
  },
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
