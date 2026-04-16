// src/components/health-dashboard/MainChart.tsx
import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import {
  VictoryChart, VictoryLine, VictoryScatter,
  VictoryAxis, VictoryArea,
} from "victory-native";
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

const AXIS_STYLE = {
  axis: { stroke: colors.border.DEFAULT },
  tickLabels: { fontSize: 10, fill: colors.text.muted, fontFamily: fonts.regular },
  grid: { stroke: colors.border.DEFAULT, strokeDasharray: "4,4", opacity: 0.4 },
};

export default function MainChart() {
  const [metric, setMetric] = useState<MetricKey>("bp");
  const [rangeIdx, setRangeIdx] = useState(0);

  const bpData = useMemo(() =>
    mockHealthMetrics.bloodPressure.map((d, i) => ({
      x: i,
      systolic: d.systolic,
      diastolic: d.diastolic,
      label: formatDateShort(d.date),
    })), []);

  const sugarData = useMemo(() =>
    mockHealthMetrics.bloodSugar.map((d, i) => ({ x: i, y: d.value })), []);

  const hrData = useMemo(() =>
    mockHealthMetrics.heartRate.map((d, i) => ({ x: i, y: d.value })), []);

  const weightData = useMemo(() =>
    mockHealthMetrics.weight.map((d, i) => ({ x: i, y: d.value })), []);

  const tickLabels = bpData.map((d) => d.label);

  const warningCount = metric === "bp"
    ? bpData.filter((d) => d.systolic > 130).length
    : metric === "sugar"
    ? sugarData.filter((d) => d.y > 5.5).length
    : 0;

  const chartHeight = 240;
  const padding = { top: 10, bottom: 30, left: 44, right: 10 };

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <Pressable
          style={s.metricPicker}
          onPress={() =>
            Alert.alert(
              "Chọn chỉ số",
              undefined,
              (Object.keys(METRIC_LABELS) as MetricKey[]).map((k) => ({
                text: METRIC_LABELS[k],
                onPress: () => setMetric(k),
              }))
            )
          }
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
          <VictoryChart height={chartHeight} padding={padding} domain={{ y: [60, 160] }}>
            {/* Vùng bình thường */}
            <VictoryArea
              data={bpData.map((d) => ({ x: d.x, y: 120, y0: 90 }))}
              style={{ data: { fill: colors.success.light, opacity: 0.25, stroke: "none" } }}
            />
            <VictoryAxis
              tickValues={bpData.map((d) => d.x)}
              tickFormat={(t) => tickLabels[t] ?? ""}
              style={AXIS_STYLE}
            />
            <VictoryAxis dependentAxis tickValues={[70, 90, 110, 130, 150]} style={AXIS_STYLE} />
            {/* Ngưỡng nguy hiểm */}
            <VictoryLine
              data={bpData.map((d) => ({ x: d.x, y: 140 }))}
              style={{ data: { stroke: colors.danger.DEFAULT, strokeWidth: 1.5, opacity: 0.5, strokeDasharray: "4,4" } }}
            />
            <VictoryLine
              data={bpData.map((d) => ({ x: d.x, y: d.diastolic }))}
              style={{ data: { stroke: colors.brand.dark, strokeWidth: 2 } }}
            />
            <VictoryLine
              data={bpData.map((d) => ({ x: d.x, y: d.systolic }))}
              style={{ data: { stroke: colors.brand.DEFAULT, strokeWidth: 2 } }}
            />
            <VictoryScatter
              data={bpData.map((d) => ({ x: d.x, y: d.systolic }))}
              size={4}
              style={{ data: { fill: colors.brand.DEFAULT } }}
            />
          </VictoryChart>
        )}

        {metric === "sugar" && (
          <VictoryChart height={chartHeight} padding={padding}>
            <VictoryArea
              data={sugarData.map((d) => ({ x: d.x, y: 5.5, y0: 3.9 }))}
              style={{ data: { fill: colors.success.light, opacity: 0.25, stroke: "none" } }}
            />
            <VictoryAxis style={AXIS_STYLE} />
            <VictoryAxis dependentAxis style={AXIS_STYLE} />
            <VictoryLine data={sugarData} style={{ data: { stroke: colors.warning.DEFAULT, strokeWidth: 2 } }} />
            <VictoryScatter data={sugarData} size={4} style={{ data: { fill: colors.warning.DEFAULT } }} />
          </VictoryChart>
        )}

        {metric === "hr" && (
          <VictoryChart height={chartHeight} padding={padding}>
            <VictoryArea
              data={hrData.map((d) => ({ x: d.x, y: 100, y0: 60 }))}
              style={{ data: { fill: colors.success.light, opacity: 0.25, stroke: "none" } }}
            />
            <VictoryAxis style={AXIS_STYLE} />
            <VictoryAxis dependentAxis style={AXIS_STYLE} />
            <VictoryLine data={hrData} style={{ data: { stroke: colors.coral.DEFAULT, strokeWidth: 2 } }} />
            <VictoryScatter data={hrData} size={4} style={{ data: { fill: colors.coral.DEFAULT } }} />
          </VictoryChart>
        )}

        {metric === "weight" && (
          <VictoryChart height={chartHeight} padding={padding}>
            <VictoryArea
              data={weightData.map((d) => ({ x: d.x, y: 80, y0: 65 }))}
              style={{ data: { fill: colors.brand.light, opacity: 0.25, stroke: "none" } }}
            />
            <VictoryAxis style={AXIS_STYLE} />
            <VictoryAxis dependentAxis style={AXIS_STYLE} />
            <VictoryLine data={weightData} style={{ data: { stroke: colors.brand.DEFAULT, strokeWidth: 2.5 } }} />
            <VictoryScatter data={weightData} size={4} style={{ data: { fill: colors.brand.DEFAULT } }} />
          </VictoryChart>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricPicker: { flexDirection: "row", alignItems: "center", gap: 4 },
  metricLabel: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.text.DEFAULT },
  rangeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rangeTabs: {
    flexDirection: "row",
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.sm,
    padding: 2,
  },
  rangeTab: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  rangeTabActive: { backgroundColor: colors.surface.card, ...shadows.card },
  rangeText: { fontSize: 12, color: colors.text.secondary, fontFamily: fonts.regular },
  rangeTextActive: { color: colors.brand.DEFAULT, fontFamily: fonts.medium },
  downloadBtn: { padding: 4 },
  chartArea: { height: 240, marginTop: 16 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  legend: { flexDirection: "row", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendDash: { width: 16, height: 2 },
  legendText: { fontSize: 11, color: colors.text.muted, fontFamily: fonts.regular },
  warning: { fontSize: 11, color: colors.warning.DEFAULT, fontFamily: fonts.medium },
});