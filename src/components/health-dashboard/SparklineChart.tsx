// src/components/health-dashboard/SparklineChart.tsx
import { useMemo } from "react";
import { View } from "react-native";
import { VictoryLine, VictoryChart } from "victory-native";

interface Props {
  data: number[];
  color: string;
  height?: number;
}

export default function SparklineChart({ data, color, height = 32 }: Props) {
  const chartData = useMemo(
    () => data.map((y, x) => ({ x, y })),
    [data]
  );

  return (
    <View style={{ height, width: "100%" }}>
      <VictoryChart
        height={height}
        padding={0}
      >
        <VictoryLine
          data={chartData}
          style={{
            data: { stroke: color, strokeWidth: 1.5 },
          }}
        />
      </VictoryChart>
    </View>
  );
}