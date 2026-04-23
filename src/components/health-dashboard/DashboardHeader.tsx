import { View, Text, StyleSheet } from "react-native";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";
import type { MetricSummary, MetricType } from "@/lib/health-metrics-api";

const METRIC_KEYS: MetricType[] = [
  "blood_pressure",
  "glucose",
  "heart_rate",
  "weight",
  "spo2",
  "temperature",
];

type Props = { summary: MetricSummary | null };

export default function DashboardHeader({ summary }: Props) {
  const tracked = summary
    ? METRIC_KEYS.filter((k) => summary[k]?.latest != null)
    : [];
  const total = tracked.length;
  const alerts = tracked.filter((k) => {
    const a = summary![k]!.alert;
    return a !== "ok";
  }).length;
  const normal = total - alerts;

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <View style={s.container}>
      <View style={s.top}>
        <View>
          <Text style={s.subtitle}>{today}</Text>
          <Text style={s.title}>Sức khỏe của bạn</Text>
        </View>
        <View style={s.iconWrap}>
          <Activity size={22} color={colors.brand.DEFAULT} strokeWidth={2} />
        </View>
      </View>

      {total > 0 && (
        <View style={s.statsRow}>
          <StatPill
            icon={<CheckCircle2 size={14} color={colors.success.DEFAULT} strokeWidth={2} />}
            value={normal}
            label="Bình thường"
            color={colors.success.DEFAULT}
            bg={colors.success.light}
          />
          <StatPill
            icon={<AlertCircle size={14} color={colors.warning.DEFAULT} strokeWidth={2} />}
            value={alerts}
            label="Cần chú ý"
            color={colors.warning.DEFAULT}
            bg={colors.warning.light}
          />
          <StatPill
            icon={<Activity size={14} color={colors.brand.DEFAULT} strokeWidth={2} />}
            value={total}
            label="Đang theo dõi"
            color={colors.brand.DEFAULT}
            bg={colors.brand.light}
          />
        </View>
      )}
    </View>
  );
}

function StatPill({
  icon,
  value,
  label,
  color,
  bg,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <View style={s.pillTop}>
        {icon}
        <Text style={[s.pillValue, { color }]}>{value}</Text>
      </View>
      <Text style={s.pillLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 14 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.text.muted,
    textTransform: "capitalize",
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.text.DEFAULT,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: { flexDirection: "row", gap: 8 },
  pill: {
    flex: 1,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  pillTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  pillValue: { fontSize: fontSizes.lg, fontFamily: fonts.bold },
  pillLabel: { fontSize: 10, fontFamily: fonts.medium, color: colors.text.secondary },
});
