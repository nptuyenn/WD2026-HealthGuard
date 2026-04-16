import { View, Text, Pressable, StyleSheet } from "react-native";
import { VictoryLine, VictoryChart, VictoryAxis, VictoryScatter, VictoryArea } from "victory-native";
import { ChevronDown } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import { mockHealthMetrics } from "@/lib/mock-data";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_LABELS[d.getDay()];
}

export default function HealthSummaryChart() {
  const bp = mockHealthMetrics.bloodPressure;

  const systolicData = bp.map((d, i) => ({ x: i + 1, y: d.systolic, label: getDayLabel(d.date) }));
  const diastolicData = bp.map((d, i) => ({ x: i + 1, y: d.diastolic }));
  const tickLabels = bp.map((d, i) => getDayLabel(d.date));

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.titleRow} onPress={() => {}}>
          <Text style={styles.titleText}>Huyết áp 7 ngày qua</Text>
          <ChevronDown size={16} color={colors.text.secondary} strokeWidth={1.8} />
        </Pressable>
        <Text style={styles.detailLink}>Xem chi tiết →</Text>
      </View>

      {/* Chart */}
      <View style={styles.chartArea}>
        <VictoryChart
          height={160}
          padding={{ top: 10, bottom: 30, left: 38, right: 10 }}
          domain={{ y: [60, 150] }}
        >
          {/* Vùng bình thường 90–120 */}


          {/* Trục X */}
          <VictoryAxis
            tickValues={systolicData.map(d => d.x)}
            tickFormat={(t) => tickLabels[t - 1] ?? ""}
            style={{
              axis: { stroke: colors.border.DEFAULT },
              tickLabels: { fontSize: 10, fill: colors.text.muted, fontFamily: fonts.regular },
              grid: { stroke: "none" },
            }}
          />

          {/* Trục Y */}
          <VictoryAxis
            dependentAxis
            tickValues={[70, 90, 110, 130, 150]}
            style={{
              axis: { stroke: colors.border.DEFAULT },
              tickLabels: { fontSize: 10, fill: colors.text.muted, fontFamily: fonts.regular },
              grid: { stroke: colors.border.DEFAULT, strokeDasharray: "4,4", opacity: 0.5 },
            }}
          />

          {/* Diastolic line */}
          <VictoryLine
            data={diastolicData}
            style={{ data: { stroke: colors.brand.dark, strokeWidth: 1.5, opacity: 0.65 } }}
          />

          {/* Systolic line */}
          <VictoryLine
            data={systolicData}
            style={{ data: { stroke: colors.brand.DEFAULT, strokeWidth: 2 } }}
          />

        </VictoryChart>
      </View>

      {/* AI insight */}
      <View style={styles.insightRow}>
        <Text>✨</Text>
        <Text style={styles.insightText} numberOfLines={1}>
          Huyết áp ổn định, trung bình 122/80. Tiếp tục duy trì.
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
    marginTop: 4,
  },
  insightText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontStyle: "italic",
    fontFamily: fonts.regular,
  },
});