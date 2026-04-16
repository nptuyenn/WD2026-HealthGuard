import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import { colors, fonts, radius } from "@/theme";
import { mockProfile, mockEmergencyContacts } from "@/lib/mock-data";

const QR_URL = `https://healthguard.app/public/emergency/${mockProfile.id}`;

export default function CardFront() {
  const primaryContact = mockEmergencyContacts.find((c) => c.isPrimary);

  return (
    <LinearGradient
      colors={["#FFFFFF", colors.brand[50], colors.brand.light]}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.container}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <Text style={styles.appName}>HEALTHGUARD</Text>
        <QRCode value={QR_URL} size={48} />
      </View>

      {/* Middle */}
      <View style={styles.middle}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>NM</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.fullName}>NGUYỄN VĂN MINH</Text>
          <Text style={styles.infoText}>Sinh: 15/03/1990</Text>
          <View style={styles.bloodRow}>
            <Text style={styles.infoText}>Nhóm máu: </Text>
            <Text style={styles.bloodType}>{mockProfile.bloodType}</Text>
          </View>
          <Text style={styles.infoText}>BHYT: {mockProfile.insuranceNumber}</Text>
        </View>
      </View>

      {/* Bottom */}
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
  container: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  appName: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 3,
    color: colors.brand.DEFAULT,
  },
  middle: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.brand.DEFAULT,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  fullName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: 1,
    color: colors.text.DEFAULT,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: fonts.regular,
  },
  bloodRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bloodType: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.danger.DEFAULT,
  },
  bottom: {
    marginTop: 12,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderTopColor: colors.border.DEFAULT,
    paddingTop: 8,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: fonts.regular,
  },
  contactPhone: {
    fontFamily: fonts.mono,
    fontWeight: "500",
  },
});
