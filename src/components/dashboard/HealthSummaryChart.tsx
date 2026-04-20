import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
} from "victory-native";
import { useFocusEffect } from "expo-router";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import { useActiveProfile } from "@/store/auth";
import { getMetricSummary, type MetricSummary } from "@/lib/health-metrics-api";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getDayLabel(iso: string): string {
  return DAY_LABELS[new Date(iso).getDay()];
}

export default function HealthSummaryChart() {
  const profile = useActiveProfile();
  const [summary, setSummary] = useState<MetricSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 72;

  const load = useCallback(async () => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const s = await getMetricSummary(profile.id);
      setSummary(s);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const bp = summary?.blood_pressure?.series ?? [];
  const last7 = bp.slice(-7);

  const systolic = last7.map((p, i) => ({ x: i + 1, y: p.valueNum }));
  const diastolic = last7.map((p, i) => ({ x: i + 1, y: p.valueNum2 ?? 0 }));
  const tickLabels = last7.map((p) => getDayLabel(p.recordedAt));

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={{ paddingVertical: 60, alignItems: "center" }}>
          <ActivityIndicator color={colors.brand.DEFAULT} />
        </View>
      </View>
    );
  }

  if (last7.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Huyết áp 7 ngày qua</Text>
        </View>
        <Text style={styles.emptyText}>
          Chưa có dữ liệu huyết áp. Vào tab "Sức khỏe" để ghi chỉ số đầu tiên.
        </Text>
      </View>
    );
  }

  const avgSys = Math.round(systolic.reduce((a, b) => a + b.y, 0) / systolic.length);
  const avgDia = Math.round(diastolic.reduce((a, b) => a + b.y, 0) / diastolic.length);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Huyết áp 7 ngày qua</Text>
        <Text style={styles.avgText}>TB: {avgSys}/{avgDia}</Text>
      </View>

      <View style={styles.chartArea}>
        <VictoryChart
          width={chartWidth}
          height={160}
          padding={{ top: 10, bottom: 30, left: 38, right: 10 }}
          domain={{ y: [60, 160] }}
        >
          <VictoryAxis
            tickValues={systolic.map((d) => d.x)}
            tickFormat={(t) => tickLabels[t - 1] ?? ""}
            style={{
              axis: { stroke: colors.border.DEFAULT },
              tickLabels: { fontSize: 10, fill: colors.text.muted, fontFamily: fonts.regular },
              grid: { stroke: "none" },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickValues={[70, 90, 110, 130, 150]}
            style={{
              axis: { stroke: colors.border.DEFAULT },
              tickLabels: { fontSize: 10, fill: colors.text.muted, fontFamily: fonts.regular },
              grid: { stroke: colors.border.DEFAULT, strokeDasharray: "4,4", opacity: 0.5 },
            }}
          />
          <VictoryLine
            data={diastolic}
            style={{ data: { stroke: colors.brand.dark, strokeWidth: 1.5, opacity: 0.65 } }}
          />
          <VictoryLine
            data={systolic}
            style={{ data: { stroke: colors.brand.DEFAULT, strokeWidth: 2 } }}
          />
        </VictoryChart>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: 20,
    ...shadows.card,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },
  avgText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontFamily: fonts.mono,
  },
  chartArea: {
    marginTop: 12,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 20,
    textAlign: "center",
    color: colors.text.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
});
