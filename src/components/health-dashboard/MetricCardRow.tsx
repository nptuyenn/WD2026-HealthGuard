import { FlatList, StyleSheet, useWindowDimensions } from "react-native";
import { Heart, Droplets, Scale, HeartPulse } from "lucide-react-native";
import { colors } from "@/theme";
import MetricCard, { type MetricCardData } from "./MetricCard";
import { mockHealthMetrics } from "@/lib/mock-data";

const CARD_WIDTH = 148;

const CARDS: MetricCardData[] = [
  {
    id: "bp",
    title: "Huyết áp",
    icon: Heart,
    value: "120/80",
    unit: "mmHg",
    change: "-2",
    changeDir: "down",
    sparklineData: mockHealthMetrics.bloodPressure.map((d) => d.systolic),
    status: "normal",
    statusLabel: "Bình thường",
  },
  {
    id: "sugar",
    title: "Đường huyết",
    icon: Droplets,
    value: "5.6",
    unit: "mmol/L",
    change: "+0.3",
    changeDir: "up",
    sparklineData: mockHealthMetrics.bloodSugar.map((d) => d.value),
    status: "warning",
    statusLabel: "Cao nhẹ",
  },
  {
    id: "bmi",
    title: "BMI",
    icon: Scale,
    value: "22.5",
    unit: "kg/m²",
    change: "0",
    changeDir: "neutral",
    sparklineData: mockHealthMetrics.weight.map((d) => d.value),
    status: "normal",
    statusLabel: "Bình thường",
  },
  {
    id: "hr",
    title: "Nhịp tim",
    icon: HeartPulse,
    value: "72",
    unit: "bpm",
    change: "-3",
    changeDir: "down",
    sparklineData: mockHealthMetrics.heartRate.map((d) => d.value),
    status: "normal",
    statusLabel: "Bình thường",
  },
];

interface Props {
  onCardPress?: (id: string) => void;
}

export default function MetricCardRow({ onCardPress }: Props) {
  return (
    <FlatList
      horizontal
      data={CARDS}
      keyExtractor={(c) => c.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + 12}
      decelerationRate="fast"
      contentContainerStyle={s.list}
      renderItem={({ item, index }) => (
        <MetricCard card={item} width={CARD_WIDTH} index={index} />
      )}
    />
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: 16, gap: 12, paddingVertical: 4 },
});
