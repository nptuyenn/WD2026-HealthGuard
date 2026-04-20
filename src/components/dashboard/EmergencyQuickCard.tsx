import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Droplets, AlertTriangle, Phone } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import { useActiveProfile } from "@/store/auth";
import { getEmergencyCard, type EmergencyCard } from "@/lib/emergency-api";

export default function EmergencyQuickCard() {
  const router = useRouter();
  const profile = useActiveProfile();
  const [card, setCard] = useState<EmergencyCard | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const c = await getEmergencyCard(profile.id);
      setCard(c);
    } catch {}
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const bloodType = profile?.bloodType ?? "—";
  const allergyList = card?.allergies ?? [];
  const allergyText = allergyList.slice(0, 2).join(", ") || "—";
  const primaryContact = card?.contacts?.find((c) => c.isPrimary) ?? card?.contacts?.[0] ?? null;

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/emergency-card")}
      style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.95 }]}
    >
      <LinearGradient
        colors={["#FEE2E2", "#FFF1F2"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.gradient}
      >
        <View style={styles.row}>
          <View style={styles.infoItem}>
            <Droplets size={16} color={colors.danger.DEFAULT} />
            <Text style={styles.bloodTypeText}>Nhóm máu: {bloodType}</Text>
          </View>
          {allergyList.length > 0 && (
            <View style={styles.infoItem}>
              <AlertTriangle size={16} color={colors.danger.DEFAULT} />
              <Text style={styles.allergyText}>Dị ứng: {allergyText}</Text>
            </View>
          )}
        </View>

        {primaryContact && (
          <View style={styles.contactRow}>
            <Phone size={14} color={colors.text.secondary} />
            <Text style={styles.contactText}>
              Liên hệ: {primaryContact.name} — {primaryContact.phone}
            </Text>
          </View>
        )}

        <Text style={styles.qrLink}>Xem QR →</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    ...shadows.card,
  },
  gradient: {
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bloodTypeText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm,
    color: colors.text.DEFAULT,
  },
  allergyText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: fonts.regular,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: fonts.regular,
  },
  qrLink: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.brand.DEFAULT,
    alignSelf: "flex-end",
  },
});
