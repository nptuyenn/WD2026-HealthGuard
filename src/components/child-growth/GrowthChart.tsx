import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryScatter,
  VictoryAxis,
} from "victory-native";
import { Plus } from "lucide-react-native";
import { colors, fonts, radius, shadows } from "@/theme";
import SegmentedControl from "@/components/med-manager/SegmentedControl";
import type { GrowthRecord } from "@/lib/child-growth-api";

const WHO_WEIGHT = {
  p3:  [3.3,4.3,5.1,5.7,6.2,6.6,6.9,7.2,7.5,7.7,7.9,8.1,8.3,8.5,8.7,8.9,9.1,9.3,9.5],
  p50: [3.5,5.0,5.9,6.6,7.1,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6,9.9,10.1,10.3,10.5,10.8,11.0],
  p97: [4.3,5.8,7.0,7.8,8.4,8.9,9.4,9.8,10.2,10.5,10.9,11.2,11.5,11.8,12.1,12.4,12.7,13.0,13.3],
};

const WHO_HEIGHT = {
  p3:  [46.1,50.8,54.4,57.3,59.7,61.7,63.3,64.8,66.2,67.5,68.7,69.9,71.0,72.1,73.1,74.1,75.0,76.0,76.9],
  p50: [49.9,54.7,58.4,61.4,63.9,65.9,67.6,69.2,70.6,72.0,73.3,74.5,75.7,76.9,78.0,79.1,80.2,81.2,82.3],
  p97: [53.7,58.6,62.4,65.5,68.0,70.1,71.9,73.5,75.0,76.5,77.9,79.2,80.5,81.8,83.0,84.2,85.4,86.6,87.6],
};

function monthsBetween(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

type Props = {
  childName: string;
  dob: string | null;
  records: GrowthRecord[];
  onAddPress: () => void;
};

export default function GrowthChart({ childName, dob, records, onAddPress }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 64;
  const [metric, setMetric] = useState(0);

  const childPoints = useMemo(() => {
    if (!dob) return [];
    const birth = new Date(dob);
    return records
      .map((r) => {
        const x = monthsBetween(birth, new Date(r.measuredOn));
        const y = metric === 0 ? r.weightKg : r.heightCm;
        return y == null ? null : { x, y };
      })
      .filter((p): p is { x: number; y: number } => p !== null && p.x >= 0)
      .sort((a, b) => a.x - b.x);
  }, [records, dob, metric]);

  const maxX = useMemo(
    () => Math.max(18, ...childPoints.map((p) => p.x)),
    [childPoints]
  );

  const dataset = metric === 0 ? WHO_WEIGHT : WHO_HEIGHT;
  const bandData = useMemo(
    () =>
      Array.from({ length: 19 }, (_, i) => ({
        x: i,
        y: dataset.p97[i],
        y0: dataset.p3[i],
      })),
    [metric]
  );
  const medianData = useMemo(
    () => Array.from({ length: 19 }, (_, i) => ({ x: i, y: dataset.p50[i] })),
    [metric]
  );

  const yLabel = metric === 0 ? "kg" : "cm";
  const hasAnyChildData = childPoints.length > 0;

  return (
    <View style={s.card}>
      <SegmentedControl
        segments={["Cân nặng", "Chiều cao"]}
        selected={metric}
        onSelect={setMetric}
      />

      <View style={s.chartWrap}>
        <VictoryChart
          width={chartWidth}
          height={240}
          padding={{ top: 16, bottom: 36, left: 44, right: 16 }}
          domain={{ x: [0, maxX] }}
        >
          <VictoryAxis
            tickValues={Array.from({ length: Math.floor(maxX / 3) + 1 }, (_, i) => i * 3)}
            style={{
              axis: { stroke: colors.border.DEFAULT },
              tickLabels: { fontSize: 10, fill: colors.text.muted },
              grid: { stroke: "transparent" },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: colors.border.DEFAULT },
              tickLabels: { fontSize: 10, fill: colors.text.muted },
              grid: { stroke: colors.border.DEFAULT, strokeDasharray: "4, 4", opacity: 0.3 },
            }}
          />
          <VictoryArea
            data={bandData}
            style={{ data: { fill: colors.brand.light, fillOpacity: 0.5 } }}
            interpolation="monotoneX"
          />
          <VictoryLine
            data={medianData}
            style={{ data: { stroke: colors.brand.DEFAULT, strokeWidth: 1.5, strokeOpacity: 0.5, strokeDasharray: "5, 4" } }}
            interpolation="monotoneX"
          />
          {childPoints.length > 1 && (
            <VictoryLine
              data={childPoints}
              style={{ data: { stroke: colors.brand.DEFAULT, strokeWidth: 2.5 } }}
              interpolation="monotoneX"
            />
          )}
          {childPoints.length > 0 && (
            <VictoryScatter
              data={childPoints}
              size={4}
              style={{ data: { fill: colors.brand.DEFAULT } }}
            />
          )}
        </VictoryChart>
      </View>

      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.legendLine, { backgroundColor: colors.brand.DEFAULT }]} />
          <Text style={s.legendText}>{childName}</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendBand, { backgroundColor: colors.brand.light }]} />
          <Text style={s.legendText}>Chuẩn WHO (P3–P97)</Text>
        </View>
        <Text style={s.yUnit}>{yLabel}</Text>
      </View>

      <Text style={s.countText}>
        {hasAnyChildData
          ? `${childPoints.length} chỉ số đã ghi`
          : `Chưa có dữ liệu tăng trưởng của ${childName}. Nhấn "Thêm chỉ số" bên dưới.`}
      </Text>

      <Pressable style={s.addBtn} onPress={onAddPress}>
        <Plus size={16} color="#fff" />
        <Text style={s.addBtnText}>Thêm chỉ số</Text>
      </Pressable>
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
  chartWrap: { marginTop: 12, alignItems: "center" },
  legend: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendLine: { width: 16, height: 2 },
  legendBand: { width: 16, height: 8, borderRadius: 2 },
  legendText: { fontSize: 12, color: colors.text.secondary, fontFamily: fonts.regular },
  yUnit: { fontSize: 11, color: colors.text.muted, fontFamily: fonts.mono, marginLeft: "auto" },
  emptyText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 12,
    color: colors.text.muted,
    fontFamily: fonts.regular,
  },
  countText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 12,
    color: colors.text.muted,
    fontFamily: fonts.regular,
  },
  addBtn: {
    marginTop: 16,
    backgroundColor: colors.brand.DEFAULT,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  addBtnText: { color: "#fff", fontFamily: fonts.semibold, fontSize: 14 },
});
