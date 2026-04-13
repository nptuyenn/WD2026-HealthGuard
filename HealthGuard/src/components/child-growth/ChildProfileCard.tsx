import { View, Text, StyleSheet } from "react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import { mockChildren, mockChildHealthLogs } from "@/lib/mock-data";

function ageLabel(dob: string): string {
  const birth = new Date(dob);
  const now = new Date("2026-04-13");
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (totalMonths < 24) return `${totalMonths} tháng tuổi`;
  return `${Math.floor(totalMonths / 12)} tuổi`;
}

const AVATAR_COLORS = [colors.brand.light, colors.purple.light];

export default function ChildProfileCard({ childId }: { childId: string }) {
  const child = mockChildren.find((c) => c.id === childId);
  if (!child) return null;

  const latestLog = mockChildHealthLogs
    .filter((l) => l.childId === childId && l.weightKg !== null)
    .sort((a, b) => b.logDate.localeCompare(a.logDate))[0];

  const idx = mockChildren.findIndex((c) => c.id === childId);
  const bg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const initials = child.name.split(" ").pop()?.charAt(0).toUpperCase() ?? "B";

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <View style={s.card}>
      <View style={[s.avatar, { backgroundColor: bg }]}>
        <Text style={s.initials}>{initials}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name}>
          {child.name} — {ageLabel(child.dateOfBirth)}
        </Text>
        {latestLog && (
          <Text style={s.metrics}>
            Cân:{" "}
            <Text style={s.metricValue}>{latestLog.weightKg}kg</Text>
            {latestLog.heightCm ? (
              <>
                {"  |  Cao: "}
                <Text style={s.metricValue}>{latestLog.heightCm}cm</Text>
              </>
            ) : null}
          </Text>
        )}
        {latestLog && (
          <Text style={s.updated}>Cập nhật: {formatDate(latestLog.logDate)}</Text>
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
