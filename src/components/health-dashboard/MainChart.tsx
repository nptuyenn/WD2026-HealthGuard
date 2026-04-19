import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Alert, useWindowDimensions } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryArea,
} from "victory-native";
import { ChevronDown } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import type { MetricSummary, MetricType } from "@/lib/health-metrics-api";
import { METRIC_META } from "@/lib/health-metrics-api";

const PICKABLE: MetricType[] = ["blood_pressure", "glucose", "heart_rate", "weight", "spo2"];

const AXIS_STYLE = {
  axis: { stroke: colors.border.DEFAULT },
  tickLabels: { fontSize: 10, fill: colors.text.muted, fontFamily: fonts.regular },
  grid: { stroke: colors.border.DEFAULT, strokeDasharray: "4,4", opacity: 0.4 },
};

function dayShort(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function normalRangeFor(type: MetricType): [number, number] | null {
  switch (type) {
    case "blood_pressure":
      return [90, 120];
    case "glucose":
      return [70, 126];
    case "heart_rate":
      return [60, 100];
    case "spo2":
      return [95, 100];
    case "temperature":
      return [36, 37.5];
    default:
      return null;
  }
}

type Props = {
  summary: MetricSummary | null;
};

export default function MainChart({ summary }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 64;
  const [metric, setMetric] = useState<MetricType>("blood_pressure");

  const entry = summary?.[metric] ?? null;
  const series = entry?.series ?? [];

  const points = useMemo(
    () => series.map((p, i) => ({ x: i, y: p.valueNum, y2: p.valueNum2, label: dayShort(p.recordedAt) })),
    [series]
  );

  const normal = normalRangeFor(metric);
  const hasData = points.length > 0;
  const chartHeight = 240;
  const padding = { top: 10, bottom: 30, left: 44, right: 10 };

  const pickMetric = () =>
    Alert.alert(
      "Chọn chỉ số",
      undefined,
      PICKABLE.map((k) => ({
        text: METRIC_META[k].label,
        onPress: () => setMetric(k),
      })).concat([{ text: "Hủy", onPress: () => {} }])
    );

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Pressable style={s.metricPicker} onPress={pickMetric}>
          <Text style={s.metricLabel}>{METRIC_META[metric].label}</Text>
          <ChevronDown size={16} color={colors.text.secondary} strokeWidth={1.8} />
        </Pressable>
        <Text style={s.rangeHint}>{series.length} điểm · 30 ngày qua</Text>
      </View>

      <View style={s.chartArea}>
        {!hasData ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>Chưa có dữ liệu {METRIC_META[metric].label}</Text>
          </View>
        ) : (
          <VictoryChart
            width={chartWidth}
            height={chartHeight}
            padding={padding}
          >
            {normal && (
              <VictoryArea
                data={points.map((p) => ({ x: p.x, y: normal[1], y0: normal[0] }))}
                style={{ data: { fill: colors.success.light, opacity: 0.25, stroke: "none" } }}
              />
            )}
            <VictoryAxis
              tickValues={points.map((p) => p.x)}
              tickFormat={(t) => points[t]?.label ?? ""}
              style={AXIS_STYLE}
            />
            <VictoryAxis dependentAxis style={AXIS_STYLE} />
            {metric === "blood_pressure" && (
              <VictoryLine
                data={points.map((p) => ({ x: p.x, y: p.y2 ?? 0 }))}
                style={{ data: { stroke: colors.brand.dark, strokeWidth: 2 } }}
              />
            )}
            <VictoryLine
              data={points}
              style={{ data: { stroke: colors.brand.DEFAULT, strokeWidth: 2 } }}
            />
            <VictoryScatter
              data={points}
              size={4}
              style={{ data: { fill: colors.brand.DEFAULT } }}
            />
          </VictoryChart>
        )}
      </View>

      <View style={s.footer}>
        <Text style={s.legendText}>Ngưỡng: {METRIC_META[metric].thresholdText}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: 20,
    marginHorizontal: 16,
    ...shadows.card,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricPicker: { flexDirection: "row", alignItems: "center", gap: 4 },
  metricLabel: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.text.DEFAULT },
  rangeHint: { fontSize: 11, color: colors.text.muted, fontFamily: fonts.regular },
  chartArea: { marginTop: 12, alignItems: "center" },
  empty: { height: 240, justifyContent: "center", alignItems: "center" },
  emptyText: { color: colors.text.muted, fontFamily: fonts.regular },
  footer: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  legendText: { fontSize: 11, color: colors.text.muted, fontFamily: fonts.regular },
});
