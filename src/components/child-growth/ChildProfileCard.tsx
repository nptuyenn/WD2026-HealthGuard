import { View, Text, StyleSheet } from "react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import type { Profile } from "@/store/auth";
import type { GrowthRecord } from "@/lib/child-growth-api";

function ageLabel(dob: string | null): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (totalMonths < 0) return "—";
  if (totalMonths < 24) return `${totalMonths} tháng tuổi`;
  return `${Math.floor(totalMonths / 12)} tuổi`;
}

function initials(name: string) {
  return (name.trim().split(/\s+/).pop()?.charAt(0) ?? "B").toUpperCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN");
}

type Props = {
  profile: Profile;
  latestGrowth: GrowthRecord | null;
};

export default function ChildProfileCard({ profile, latestGrowth }: Props) {
  return (
    <View style={s.card}>
      <View style={[s.avatar, { backgroundColor: colors.brand.light }]}>
        <Text style={s.initials}>{initials(profile.fullName)}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name}>
          {profile.fullName} — {ageLabel(profile.dob)}
        </Text>
        {latestGrowth && (latestGrowth.weightKg || latestGrowth.heightCm) && (
          <Text style={s.metrics}>
            {latestGrowth.weightKg && (
              <>
                Cân: <Text style={s.metricValue}>{latestGrowth.weightKg}kg</Text>
              </>
            )}
            {latestGrowth.weightKg && latestGrowth.heightCm ? "  |  " : ""}
            {latestGrowth.heightCm && (
              <>
                Cao: <Text style={s.metricValue}>{latestGrowth.heightCm}cm</Text>
              </>
            )}
          </Text>
        )}
        {latestGrowth && (
          <Text style={s.updated}>Cập nhật: {formatDate(latestGrowth.measuredOn)}</Text>
        )}
        {!latestGrowth && (
          <Text style={s.updated}>Chưa có chỉ số tăng trưởng nào.</Text>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginHorizontal: 16,
    ...shadows.card,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: { fontFamily: fonts.bold, fontSize: 20, color: colors.text.DEFAULT },
  info: { flex: 1 },
  name: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.text.DEFAULT },
  metrics: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  metricValue: { fontFamily: fonts.mono },
  updated: { fontSize: 12, color: colors.text.muted, marginTop: 2, fontFamily: fonts.regular },
});
