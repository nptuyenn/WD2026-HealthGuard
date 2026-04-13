import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  CartesianChart,
  Line,
  Scatter,
} from "victory-native";
import { Rect, useFont } from "@shopify/react-native-skia";
import * as VN from "victory-native";
// Debug: log at module load to find what's undefined
console.log("[HealthSummaryChart] checks:", {
  Rect: typeof Rect,
  useFont: typeof useFont,
  CartesianChart: typeof VN.CartesianChart,
  Line: typeof VN.Line,
  Scatter: typeof VN.Scatter,
});
import { ChevronDown, Sparkles } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import { mockHealthMetrics } from "@/lib/mock-data";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_LABELS[d.getDay()];
}

export default function HealthSummaryChart() {
  const bp = mockHealthMetrics.bloodPressure;

  // Load a real .ttf via Skia — matchFont() is unreliable on Skia v2.x
  const axisFont = useFont(
    require("@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf"),
    10
  );

  const chartData = bp.map((d) => ({
    day: getDayLabel(d.date),
    systolic: d.systolic,
    diastolic: d.diastolic,
    rangeHigh: 120,
    rangeLow: 90,
  }));

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.titleRow} onPress={() => {}}>
          <Text style={styles.titleText}>Huyết áp 7 ngày qua</Text>
          <ChevronDown
            size={16}
            color={colors.text.secondary}
            strokeWidth={1.8}
          />
        </Pressable>
        <Text style={styles.detailLink}>Xem chi tiết →</Text>
      </View>

      {/* Chart */}
      <View style={styles.chartArea}>
        <CartesianChart
          data={chartData}
          xKey="day"
          yKeys={["systolic", "diastolic"]}
          domain={{ y: [60, 150] }}
          domainPadding={{ left: 10, right: 10 }}
          padding={{ top: 10, bottom: 30, left: 35, right: 10 }}
          axisOptions={{
            font: axisFont,
            labelColor: colors.text.muted,
            lineColor: colors.border.DEFAULT,
          }}
        >
          {({ points, chartBounds, yScale }) => {
            const yHigh = yScale(120);
            const yLow = yScale(90);
            return (
            <>
              {/* Vùng bình thường 90–120 mmHg */}
              <Rect
                x={chartBounds.left}
                y={yHigh}
                width={chartBounds.right - chartBounds.left}
                height={yLow - yHigh}
                color={colors.success.light}
                opacity={0.4}
              />

              {/* Systolic line */}
              <Line
                points={points.systolic}
                color={colors.brand.DEFAULT}
                strokeWidth={2}
              />

              {/* Diastolic line (mờ hơn để phân biệt) */}
              <Line
                points={points.diastolic}
                color={colors.brand.dark}
                strokeWidth={1.5}
                opacity={0.65}
              />

              {/* Dots cho systolic */}
              <Scatter
                points={points.systolic}
                radius={3}
                color={colors.brand.DEFAULT}
              />
            </>
            );
          }}
        </CartesianChart>
      </View>

      {/* AI insight row */}
      <View style={styles.insightRow}>
        <Sparkles size={16} color={colors.brand.DEFAULT} strokeWidth={1.8} />
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
