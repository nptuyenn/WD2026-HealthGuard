import { useEffect, useRef, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import { colors, fonts, fontSizes, spacing } from "@/theme";
import CardPreview3D from "@/components/emergency/CardPreview3D";
import EmergencyForm from "@/components/emergency/EmergencyForm";
import QRShareSheet from "@/components/emergency/QRShareSheet";
import { useAuth, useActiveProfile } from "@/store/auth";
import {
  getEmergencyCard,
  upsertEmergencyCard,
  type EmergencyCard,
  type EmergencyContact,
} from "@/lib/emergency-api";
import { api } from "@/lib/api";

export default function EmergencyCardScreen() {
  const qrSheetRef = useRef<BottomSheet>(null);
  const refreshUser = useAuth((state) => state.refreshUser);
  const profile = useActiveProfile();

  const [card, setCard] = useState<EmergencyCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCard = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const c = await getEmergencyCard(profile.id);
      setCard(c);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không tải được thẻ khẩn cấp.");
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  const handleSave = useCallback(
    async (data: {
      dob: string | null;
      gender: string | null;
      bloodType: string | null;
      allergies: string[];
      conditions: string[];
      contacts: EmergencyContact[];
      notes: string | null;
    }) => {
      if (!profile) return;
      setSaving(true);
      try {
        const profileChanged =
          data.bloodType !== profile.bloodType ||
          data.dob !== profile.dob ||
          data.gender !== profile.gender;
        if (profileChanged) {
          await api(`/api/v1/profiles/${profile.id}`, {
            method: "PATCH",
            body: JSON.stringify({ bloodType: data.bloodType, dob: data.dob, gender: data.gender }),
          });
          await refreshUser();
        }
        const updated = await upsertEmergencyCard(profile.id, {
          allergies: data.allergies,
          conditions: data.conditions,
          contacts: data.contacts,
          notes: data.notes,
        });
        setCard(updated);
        Alert.alert("Đã lưu", "Thẻ khẩn cấp đã được cập nhật.");
      } catch (err: any) {
        Alert.alert("Lỗi", err?.message ?? "Lưu thất bại.");
      } finally {
        setSaving(false);
      }
    },
    [profile, refreshUser]
  );

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Chưa có hồ sơ sức khỏe.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  const primaryContact =
    card?.contacts.find((c) => c.isPrimary) ?? card?.contacts[0] ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CardPreview3D
          fullName={profile.fullName}
          dob={profile.dob}
          gender={profile.gender}
          bloodType={profile.bloodType}
          primaryContact={primaryContact}
          publicToken={card?.publicToken ?? null}
          allergies={card?.allergies ?? []}
          conditions={card?.conditions ?? []}
          notes={card?.notes ?? null}
        />

        <EmergencyForm
          dob={profile.dob}
          gender={profile.gender}
          bloodType={profile.bloodType}
          allergies={card?.allergies ?? []}
          conditions={card?.conditions ?? []}
          contacts={card?.contacts ?? []}
          notes={card?.notes ?? null}
          saving={saving}
          hasToken={!!card?.publicToken}
          onSave={handleSave}
          onShareQR={() => qrSheetRef.current?.expand()}
        />
      </ScrollView>

      <QRShareSheet ref={qrSheetRef} publicToken={card?.publicToken ?? null} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.DEFAULT },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.base,
    color: colors.text.secondary,
  },
});
