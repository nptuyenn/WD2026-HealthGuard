import { FlatList, StyleSheet, Text, View } from "react-native";
import { Heart, Droplets, Scale, HeartPulse, Activity, Thermometer } from "lucide-react-native";
import { colors, fonts } from "@/theme";
import MetricCard, { type MetricCardData } from "./MetricCard";
import {
  METRIC_META,
  ALERT_STATUS,
  formatMetricValue,
  type MetricSummary,
  type MetricType,
} from "@/lib/health-metrics-api";

const CARD_WIDTH = 170;

const ICONS: Record<MetricType, MetricCardData["icon"]> = {
  blood_pressure: Heart,
  glucose: Droplets,
  heart_rate: HeartPulse,
  weight: Scale,
  spo2: Activity,
  temperature: Thermometer,
  bmi: Scale,
};

const DISPLAY_ORDER: MetricType[] = [
  "blood_pressure",
  "glucose",
  "heart_rate",
  "weight",
  "spo2",
  "temperature",
];

function buildCards(summary: MetricSummary): MetricCardData[] {
  return DISPLAY_ORDER.filter((type) => summary[type]?.latest != null).map((type) => {
    const entry = summary[type]!;
    const latest = entry.latest!;
    const meta = METRIC_META[type];
    const status = ALERT_STATUS[entry.alert];

    let change = "—";
    let changeDir: MetricCardData["changeDir"] = "neutral";
    if (entry.series.length >= 2) {
      const prev = entry.series[entry.series.length - 2].valueNum;
      const curr = latest.valueNum;
      const diff = curr - prev;
      if (Math.abs(diff) < 0.1) {
        changeDir = "neutral";
        change = "0";
      } else {
        changeDir = diff > 0 ? "up" : "down";
        change = `${diff > 0 ? "+" : ""}${diff.toFixed(Math.abs(diff) < 10 ? 1 : 0)}`;
      }
    }

    return {
      id: type,
      title: meta.label,
      icon: ICONS[type],
      value: formatMetricValue(type, latest.valueNum, latest.valueNum2),
      unit: latest.unit,
      change,
      changeDir,
      sparklineData: entry.series.map((p) => p.valueNum),
      status: status.kind,
      statusLabel: status.label,
    };
  });
}

type Props = {
  summary: MetricSummary | null;
};

export default function MetricCardRow({ summary }: Props) {
  const cards = summary ? buildCards(summary) : [];

  if (cards.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>
          Chưa có chỉ số nào. Nhấn "Ghi chỉ số mới" bên dưới để bắt đầu theo dõi.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={cards}
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
  empty: { paddingHorizontal: 32, paddingVertical: 24, alignItems: "center" },
  emptyText: {
    textAlign: "center",
    color: colors.text.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
});
