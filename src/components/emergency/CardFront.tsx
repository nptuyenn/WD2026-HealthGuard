import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import { colors, fonts, radius } from "@/theme";
import { API_URL } from "@/lib/api";
import type { EmergencyContact } from "@/lib/emergency-api";

type Props = {
  fullName: string;
  dob: string | null;
  bloodType: string | null;
  primaryContact: EmergencyContact | null;
  publicToken: string | null;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "").toUpperCase() + (parts.at(-1)?.[0] ?? "").toUpperCase();
}

export default function CardFront({ fullName, dob, bloodType, primaryContact, publicToken }: Props) {
  const qrUrl = publicToken ? `${API_URL}/emergency/${publicToken}` : "";
  const dobStr = dob ? new Date(dob).toLocaleDateString("vi-VN") : "—";

  return (
    <LinearGradient
      colors={["#FFFFFF", colors.brand[50], colors.brand.light]}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <Text style={styles.appName}>HEALTHGUARD</Text>
        {qrUrl ? <QRCode value={qrUrl} size={48} /> : <View style={styles.qrPlaceholder} />}
      </View>

      <View style={styles.middle}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(fullName)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.fullName} numberOfLines={1}>{fullName.toUpperCase()}</Text>
          <Text style={styles.infoText}>Sinh: {dobStr}</Text>
          <View style={styles.bloodRow}>
            <Text style={styles.infoText}>Nhóm máu: </Text>
            <Text style={styles.bloodType}>{bloodType ?? "—"}</Text>
          </View>
        </View>
      </View>

      {primaryContact && (
        <View style={styles.bottom}>
          <Text style={styles.contactLabel}>
            {"☎ Khẩn cấp: "}
            <Text style={styles.contactPhone}>{primaryContact.phone}</Text>
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: radius.lg, padding: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  appName: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 3,
    color: colors.brand.DEFAULT,
  },
  qrPlaceholder: { width: 48, height: 48, borderRadius: 4, backgroundColor: colors.surface.secondary },
  middle: { flexDirection: "row", gap: 16, marginTop: 16 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 24, fontFamily: fonts.bold, color: colors.brand.DEFAULT },
  info: { flex: 1, gap: 2 },
  fullName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: 1,
    color: colors.text.DEFAULT,
  },
  infoText: { fontSize: 12, color: colors.text.secondary, fontFamily: fonts.regular },
  bloodRow: { flexDirection: "row", alignItems: "center" },
  bloodType: { fontSize: 12, fontFamily: fonts.bold, color: colors.danger.DEFAULT },
  bottom: {
    marginTop: 12,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderTopColor: colors.border.DEFAULT,
    paddingTop: 8,
  },
  contactLabel: { fontSize: 12, color: colors.text.secondary, fontFamily: fonts.regular },
  contactPhone: { fontFamily: fonts.mono, fontWeight: "500" },
});
