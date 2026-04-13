import { useMemo } from "react";
import { View, Platform } from "react-native";
import { CartesianChart, Line } from "victory-native";
import { matchFont } from "@shopify/react-native-skia";

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

  const font = useMemo(
    () =>
      matchFont({
        fontFamily: Platform.select({ ios: "Helvetica Neue", android: "sans-serif" }) ?? "sans-serif",
        fontSize: 8,
      }),
    []
  );

  return (
    <View style={{ height, width: "100%" }}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={["y"]}
        padding={0}
        axisOptions={{
          font,
          tickCount: { x: 0, y: 0 },
          lineColor: "transparent",
          labelColor: "transparent",
        }}
      >
        {({ points }) => (
          <Line
            points={points.y}
            color={color}
            strokeWidth={1.5}
            strokeCap="round"
          />
        )}
      </CartesianChart>
    </View>
  );
}
