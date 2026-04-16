import { useState, useMemo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { CartesianChart, Line, AreaRange, Scatter } from "victory-native";
import { matchFont } from "@shopify/react-native-skia";
import { colors, fonts, radius, shadows } from "@/theme";
import SegmentedControl from "@/components/med-manager/SegmentedControl";

// WHO weight data (boys, kg), months 0–18
const WHO_WEIGHT = {
  p3:  [3.3,4.3,5.1,5.7,6.2,6.6,6.9,7.2,7.5,7.7,7.9,8.1,8.3,8.5,8.7,8.9,9.1,9.3,9.5],
  p50: [3.5,5.0,5.9,6.6,7.1,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6,9.9,10.1,10.3,10.5,10.8,11.0],
  p97: [4.3,5.8,7.0,7.8,8.4,8.9,9.4,9.8,10.2,10.5,10.9,11.2,11.5,11.8,12.1,12.4,12.7,13.0,13.3],
  child: [3.4,4.8,5.7,6.5,7.0,null,null,null,null,null,9.2,null,9.6,null,10.1,null,10.3,null,10.5],
};

// WHO height data (boys, cm), months 0–18 (approximate)
const WHO_HEIGHT = {
  p3:  [46.1,50.8,54.4,57.3,59.7,61.7,63.3,64.8,66.2,67.5,68.7,69.9,71.0,72.1,73.1,74.1,75.0,76.0,76.9],
  p50: [49.9,54.7,58.4,61.4,63.9,65.9,67.6,69.2,70.6,72.0,73.3,74.5,75.7,76.9,78.0,79.1,80.2,81.2,82.3],
  p97: [53.7,58.6,62.4,65.5,68.0,70.1,71.9,73.5,75.0,76.5,77.9,79.2,80.5,81.8,83.0,84.2,85.4,86.6,87.6],
  child:[49.0,53.5,57.0,60.0,63.0,null,null,null,null,null,72.0,null,75.5,null,77.5,null,79.0,null,78.0],
};

export default function GrowthChart({ childId }: { childId: string }) {
  const [metric, setMetric] = useState(0); // 0=weight, 1=height
  const dataset = metric === 0 ? WHO_WEIGHT : WHO_HEIGHT;

  const axisFont = useMemo(
    () =>
      matchFont({
        fontFamily: Platform.select({ ios: "Helvetica Neue", android: "sans-serif" }) ?? "sans-serif",
        fontSize: 10,
      }),
    []
  );

  // Build data array for CartesianChart (months 0..18)
  const data = useMemo(
    () =>
      Array.from({ length: 19 }, (_, i) => ({
        month: i,
        p3: dataset.p3[i],
        p50: dataset.p50[i],
        p97: dataset.p97[i],
        child: dataset.child[i] ?? undefined,
      })),
    [metric]
  );

  // Filter out null/undefined for scatter
  const childPoints = data.filter((d) => d.child !== undefined);

  const yLabel = metric === 0 ? "kg" : "cm";

  return (
    <View style={s.card}>
      <SegmentedControl
        segments={["Cân nặng", "Chiều cao"]}
        selected={metric}
        onSelect={setMetric}
      />

      <View style={s.chartWrap}>
        <CartesianChart
          data={data}
          xKey="month"
          yKeys={["p3", "p50", "p97", "child"]}
          axisOptions={{
            font: axisFont,
            tickCount: { x: 7, y: 5 },
            formatXLabel: (v) => String(v),
            formatYLabel: (v) => `${v}`,
          }}
          padding={{ top: 10, bottom: 30, left: 40, right: 10 }}
        >
          {({ points }) => (
            <>
              {/* WHO P3–P97 band */}
              <AreaRange
                upperPoints={points.p97}
                lowerPoints={points.p3}
                color={colors.brand.light}
                opacity={0.4}
              />
              {/* P50 median dashed */}
              <Line
                points={points.p50}
                color={colors.brand.DEFAULT}
                strokeWidth={1.5}
                opacity={0.5}
                strokeCap="round"
              />
              {/* Child line */}
              <Line
                points={points.child}
                color={colors.brand.DEFAULT}
                strokeWidth={2.5}
                strokeCap="round"
              />
              {/* Child dots */}
              <Scatter
                points={points.child}
                radius={4}
                color={colors.brand.DEFAULT}
              />
            </>
          )}
        </CartesianChart>
      </View>

      {/* Legend */}
      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.legendLine, { backgroundColor: colors.brand.DEFAULT }]} />
          <Text style={s.legendText}>Bé An</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendBand, { backgroundColor: colors.brand.light }]} />
          <Text style={s.legendText}>Chuẩn WHO</Text>
        </View>
        <Text style={s.yUnit}>{yLabel}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: 16,
    marginHorizontal: 16,
    ...shadows.card,
  },
  chartWrap: { height: 240, marginTop: 12 },
  legend: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendLine: { width: 16, height: 2 },
  legendBand: { width: 16, height: 8, borderRadius: 2 },
  legendText: { fontSize: 12, color: colors.text.secondary, fontFamily: fonts.regular },
  yUnit: { fontSize: 11, color: colors.text.muted, fontFamily: fonts.mono, marginLeft: "auto" },
});
