import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryScatter,
  VictoryAxis,
} from "victory-native";
import { ChevronDown, Sparkles } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import { mockHealthMetrics, mockAIInsight } from "@/lib/mock-data";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_LABELS[d.getDay()];
}

export default function HealthSummaryChart() {
  const bp = mockHealthMetrics.bloodPressure;

  const systolicData = bp.map((d, i) => ({ x: i, y: d.systolic }));
  const diastolicData = bp.map((d, i) => ({ x: i, y: d.diastolic }));
  const normalRange = bp.map((_, i) => ({ x: i, y: 120, y0: 90 }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable style={styles.titleRow} onPress={() => {}}>
          <Text style={styles.titleText}>Huyết áp 7 ngày qua</Text>
          <ChevronDown size={16} color={colors.text.secondary} strokeWidth={1.8} />
        </Pressable>
        <Text style={styles.detailLink}>Xem chi tiết →</Text>
      </View>

      <View style={styles.chartArea}>
        <VictoryChart
          height={160}
          padding={{ top: 10, bottom: 30, left: 35, right: 10 }}
        >
          <VictoryArea
            data={normalRange}
            style={{
              data: {
                fill: colors.success.light,
                fillOpacity: 0.3,
                stroke: "transparent",
              },
            }}
          />
          <VictoryLine
            data={systolicData}
            style={{
              data: {
                stroke: colors.brand.DEFAULT,
                strokeWidth: 2,
              },
            }}
          />
          <VictoryLine
            data={diastolicData}
            style={{
              data: {
                stroke: colors.brand.dark,
                strokeWidth: 2,
                strokeDasharray: "5,5",
              },
            }}
          />
          <VictoryScatter
            data={systolicData}
            size={3}
            style={{ data: { fill: colors.brand.DEFAULT } }}
          />
          <VictoryAxis
            tickValues={bp.map((_, i) => i)}
            tickFormat={(i: number) => getDayLabel(bp[i]?.date ?? "")}
            style={{
              tickLabels: {
                fontSize: 10,
                fill: colors.text.muted,
                fontFamily: fonts.regular,
              },
              axis: { stroke: colors.border.DEFAULT },
              grid: { stroke: "transparent" },
            }}
          />
          <VictoryAxis
            dependentAxis
            domain={[60, 150]}
            style={{
              tickLabels: {
                fontSize: 10,
                fill: colors.text.muted,
                fontFamily: fonts.regular,
              },
              axis: { stroke: colors.border.DEFAULT },
              grid: { stroke: colors.border.DEFAULT, strokeDasharray: "4,4" },
            }}
          />
        </VictoryChart>
      </View>

      <View style={styles.insightRow}>
        <Sparkles size={16} color={colors.brand.DEFAULT} strokeWidth={1.8} />
        <Text style={styles.insightText} numberOfLines={1}>
          {mockAIInsight.summary.split("。")[0] ||
            "Huyết áp ổn định, trung bình 122/80. Tiếp tục duy trì."}
        </Text>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  titleText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },
  detailLink: {
    fontSize: fontSizes.sm,
    color: colors.brand.DEFAULT,
    fontFamily: fonts.medium,
  },
  chartArea: {
    height: 160,
    marginTop: 12,
  },
  insightRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderTopColor: colors.border.DEFAULT,
    alignItems: "center",
  },
  insightText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontStyle: "italic",
    fontFamily: fonts.regular,
  },
});
