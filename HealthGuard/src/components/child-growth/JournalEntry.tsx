import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { Thermometer, Scale, Stethoscope } from "lucide-react-native";
import { colors, fonts, radius, shadows } from "@/theme";

export interface HealthLog {
  id: string;
  childId: string;
  logDate: string;
  weightKg: number | null;
  heightCm: number | null;
  temperature: number | null;
  notes: string;
  tags: string[];
}

function getIcon(tags: string[]) {
  if (tags.includes("sốt")) return Thermometer;
  if (tags.includes("khám-định-kỳ")) return Scale;
  return Stethoscope;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function getTitle(log: HealthLog): string {
  if (log.tags.includes("sốt") && log.temperature) return `Sốt ${log.temperature}°C`;
  if (log.tags.includes("khám-bệnh")) return "Khám bệnh";
  if (log.tags.includes("khám-định-kỳ")) return "Cân đo định kỳ";
  return "Nhật ký sức khỏe";
}

export default function JournalEntry({ log, index = 0 }: { log: HealthLog; index?: number }) {
  const Icon = getIcon(log.tags);

  return (
    <Animated.View entering={FadeInLeft.duration(200).delay(index * 60)}>
    <View style={s.card}>
      <View style={s.row1}>
        <Text style={s.date}>{formatDate(log.logDate)}</Text>
        <Icon size={16} color={colors.text.secondary} strokeWidth={1.8} />
      </View>

      <Text style={s.title}>{getTitle(log)}</Text>

      {(log.weightKg || log.heightCm || log.temperature) && (
        <View style={s.metricsRow}>
          {log.temperature && (
            <Text style={s.metric}>
              Nhiệt độ: <Text style={s.metricVal}>{log.temperature}°C</Text>
            </Text>
          )}
          {log.weightKg && (
            <Text style={s.metric}>
              Cân: <Text style={s.metricVal}>{log.weightKg}kg</Text>
            </Text>
          )}
          {log.heightCm && (
            <Text style={s.metric}>
              Cao: <Text style={s.metricVal}>{log.heightCm}cm</Text>
            </Text>
          )}
        </View>
      )}

      {log.notes ? (
        <Text style={s.notes} numberOfLines={2}>{log.notes}</Text>
      ) : null}

      <View style={s.tags}>
        {log.tags.map((tag) => (
          <View key={tag} style={s.tag}>
            <Text style={s.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    padding: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.light,
    gap: 4,
    ...shadows.card,
  },
  row1: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 12, color: colors.text.muted, fontFamily: fonts.mono },
  title: { fontSize: 14, fontFamily: fonts.medium, color: colors.text.DEFAULT },
  metricsRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  metric: { fontSize: 12, color: colors.text.secondary, fontFamily: fonts.regular },
  metricVal: { fontFamily: fonts.mono },
  notes: { fontSize: 12, color: colors.text.secondary, fontFamily: fonts.regular },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  tag: {
    backgroundColor: colors.surface.secondary,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: colors.text.secondary, fontFamily: fonts.regular },
});
