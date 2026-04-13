import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Alert, Platform } from "react-native";
import { CartesianChart, Line, AreaRange, Scatter } from "victory-native";
import { matchFont } from "@shopify/react-native-skia";
import { ChevronDown, Download } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import { mockHealthMetrics } from "@/lib/mock-data";

const RANGE_OPTS = ["7N", "30N", "3T", "1N"];

type MetricKey = "bp" | "sugar" | "hr" | "weight";
const METRIC_LABELS: Record<MetricKey, string> = {
  bp: "Huyết áp",
  sugar: "Đường huyết",
  hr: "Nhịp tim",
  weight: "Cân nặng",
};

function formatDateShort(iso: string) {
  const parts = iso.split("-");
  return `${parts[2]}/${parts[1]}`;
}

export default function MainChart() {
  const [metric, setMetric] = useState<MetricKey>("bp");
  const [rangeIdx, setRangeIdx] = useState(0);

  const axisFont = useMemo(
    () =>
      matchFont({
        fontFamily: Platform.select({ ios: "Helvetica Neue", android: "sans-serif" }) ?? "sans-serif",
        fontSize: 10,
      }),
    []
  );

  const bpData = useMemo(() =>
    mockHealthMetrics.bloodPressure.map((d, i) => ({
      x: i,
      label: formatDateShort(d.date),
      systolic: d.systolic,
      diastolic: d.diastolic,
      normalLow: 90,
      normalHigh: 120,
      danger: 140,
    })),
    []
  );

  const sugarData = useMemo(() =>
    mockHealthMetrics.bloodSugar.map((d, i) => ({
      x: i,
      value: d.value,
      normalLow: 3.9,
      normalHigh: 5.5,
    })),
    []
  );

  const hrData = useMemo(() =>
    mockHealthMetrics.heartRate.map((d, i) => ({
      x: i,
      value: d.value,
      normalLow: 60,
      normalHigh: 100,
    })),
    []
  );

  const weightData = useMemo(() =>
    mockHealthMetrics.weight.map((d, i) => ({
      x: i,
      value: d.value,
      normalLow: 65,
      normalHigh: 80,
    })),
    []
  );

  // Count warnings
  const warningCount = metric === "bp"
    ? bpData.filter((d) => d.systolic > 130).length
    : metric === "sugar"
    ? sugarData.filter((d) => d.value > 5.5).length
    : 0;

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <Pressable
          style={s.metricPicker}
          onPress={() => Alert.alert(
            "Chọn chỉ số",
            undefined,
            (Object.keys(METRIC_LABELS) as MetricKey[]).map((k) => ({
              text: METRIC_LABELS[k],
              onPress: () => setMetric(k),
            }))
          )}
        >
          <Text style={s.metricLabel}>{METRIC_LABELS[metric]}</Text>
          <ChevronDown size={16} color={colors.text.secondary} strokeWidth={1.8} />
        </Pressable>

        <View style={s.rangeRow}>
          <View style={s.rangeTabs}>
            {RANGE_OPTS.map((opt, i) => (
              <Pressable
                key={opt}
                style={[s.rangeTab, i === rangeIdx && s.rangeTabActive]}
                onPress={() => setRangeIdx(i)}
              >
                <Text style={[s.rangeText, i === rangeIdx && s.rangeTextActive]}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={s.downloadBtn} onPress={() => Alert.alert("Xuất dữ liệu")}>
            <Download size={16} color={colors.text.secondary} strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>

      {/* Chart */}
      <View style={s.chartArea}>
        {metric === "bp" && (
          <CartesianChart
            data={bpData}
            xKey="x"
            yKeys={["systolic", "diastolic", "normalLow", "normalHigh", "danger"]}
            axisOptions={{
              font: axisFont,
              tickCount: { x: 7, y: 5 },
              formatXLabel: (v) => bpData[v as number]?.label ?? "",
            }}
            padding={{ top: 10, bottom: 30, left: 40, right: 10 }}
          >
            {({ points }) => (
              <>
                <AreaRange
                  upperPoints={points.normalHigh}
                  lowerPoints={points.normalLow}
                  color={colors.success.light}
                  opacity={0.2}
                />
                <Line points={points.systolic} color={colors.brand.DEFAULT} strokeWidth={2} strokeCap="round" />
                <Line points={points.diastolic} color={colors.brand.dark} strokeWidth={2} strokeCap="round" />
                <Line points={points.danger} color={colors.danger.DEFAULT} strokeWidth={1.5} opacity={0.5} />
                <Scatter points={points.systolic} radius={4} color={colors.brand.DEFAULT} />
              </>
            )}
          </CartesianChart>
        )}

        {metric === "sugar" && (
          <CartesianChart
            data={sugarData}
            xKey="x"
            yKeys={["value", "normalLow", "normalHigh"]}
            axisOptions={{ font: axisFont, tickCount: { x: 7, y: 5 } }}
            padding={{ top: 10, bottom: 30, left: 40, right: 10 }}
          >
            {({ points }) => (
              <>
                <AreaRange
                  upperPoints={points.normalHigh}
                  lowerPoints={points.normalLow}
                  color={colors.success.light}
                  opacity={0.2}
                />
                <Line points={points.value} color={colors.warning.DEFAULT} strokeWidth={2} strokeCap="round" />
                <Scatter points={points.value} radius={4} color={colors.warning.DEFAULT} />
              </>
            )}
          </CartesianChart>
        )}

        {metric === "hr" && (
          <CartesianChart
            data={hrData}
            xKey="x"
            yKeys={["value", "normalLow", "normalHigh"]}
            axisOptions={{ font: axisFont, tickCount: { x: 7, y: 5 } }}
            padding={{ top: 10, bottom: 30, left: 40, right: 10 }}
          >
            {({ points }) => (
              <>
                <AreaRange
                  upperPoints={points.normalHigh}
                  lowerPoints={points.normalLow}
                  color={colors.success.light}
                  opacity={0.2}
                />
                <Line points={points.value} color={colors.coral.DEFAULT} strokeWidth={2} strokeCap="round" />
                <Scatter points={points.value} radius={4} color={colors.coral.DEFAULT} />
              </>
            )}
          </CartesianChart>
        )}

        {metric === "weight" && (
          <CartesianChart
            data={weightData}
            xKey="x"
            yKeys={["value", "normalLow", "normalHigh"]}
            axisOptions={{ font: axisFont, tickCount: { x: 6, y: 5 } }}
            padding={{ top: 10, bottom: 30, left: 40, right: 10 }}
          >
            {({ points }) => (
              <>
                <AreaRange
                  upperPoints={points.normalHigh}
                  lowerPoints={points.normalLow}
                  color={colors.brand.light}
                  opacity={0.2}
                />
                <Line points={points.value} color={colors.brand.DEFAULT} strokeWidth={2.5} strokeCap="round" />
                <Scatter points={points.value} radius={4} color={colors.brand.DEFAULT} />
              </>
            )}
          </CartesianChart>
        )}
      </View>

      {/* Footer */}
      <View style={s.footer}>
        {metric === "bp" && (
          <View style={s.legend}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: colors.brand.DEFAULT }]} />
              <Text style={s.legendText}>Tâm thu</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDash, { backgroundColor: colors.brand.dark }]} />
              <Text style={s.legendText}>Tâm trương</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: colors.success.DEFAULT }]} />
              <Text style={s.legendText}>Bình thường</Text>
            </View>
          </View>
        )}
        {warningCount > 0 && (
          <Text style={s.warning}>⚠ {warningCount} lần vượt ngưỡng</Text>
        )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricLabel: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },
  rangeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rangeTabs: {
    flexDirection: "row",
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.sm,
    padding: 2,
  },
  rangeTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rangeTabActive: {
    backgroundColor: colors.surface.card,
    ...shadows.card,
  },
  rangeText: { fontSize: 12, color: colors.text.secondary, fontFamily: fonts.regular },
  rangeTextActive: { color: colors.brand.DEFAULT, fontFamily: fonts.medium },
  downloadBtn: { padding: 4 },
  chartArea: { height: 240, marginTop: 16 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  legend: { flexDirection: "row", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendDash: { width: 16, height: 2 },
  legendText: { fontSize: 11, color: colors.text.muted, fontFamily: fonts.regular },
  warning: { fontSize: 11, color: colors.warning.DEFAULT, fontFamily: fonts.medium },
});
