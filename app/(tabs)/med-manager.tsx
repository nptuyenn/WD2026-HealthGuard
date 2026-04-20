import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, ActivityIndicator, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import BottomSheet from "@gorhom/bottom-sheet";
import { colors, fonts, fontSizes, spacing } from "@/theme";
import SegmentedControl from "@/components/med-manager/SegmentedControl";
import MedTimeline from "@/components/med-manager/MedTimeline";
import MedForm, { type MedFormSubmit } from "@/components/med-manager/MedForm";
import CabinetGrid from "@/components/med-manager/CabinetGrid";
import AppointmentCalendar from "@/components/med-manager/AppointmentCalendar";
import AppointmentForm from "@/components/med-manager/AppointmentForm";
import { useActiveProfile } from "@/store/auth";
import {
  listMedications,
  getToday,
  createMedication,
  logDose,
  type Medication,
  type TimelineEvent,
} from "@/lib/medications-api";
import {
  listAppointments,
  createAppointment,
  deleteAppointment,
  type Appointment,
  type AppointmentInput,
} from "@/lib/appointments-api";
import {
  scheduleMedicationReminders,
} from "@/lib/med-notifications";

const SEGMENTS = ["Lịch thuốc", "Tủ thuốc", "Tái khám"];

export default function MedManagerScreen() {
  const profile = useActiveProfile();

  const [tab, setTab] = useState(0);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const medFormRef = useRef<BottomSheet>(null);
  const apptFormRef = useRef<BottomSheet>(null);

  const loadAll = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [t, m, a] = await Promise.all([
        getToday(profile.id),
        listMedications(profile.id),
        listAppointments(profile.id),
      ]);
      setEvents(t);
      setMedications(m);
      setAppointments(a);
    } catch (err: any) {
      Alert.alert("Lỗi tải dữ liệu", err?.message ?? "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const handleCreateMed = useCallback(
    async ({ input, reminderOn }: MedFormSubmit) => {
      if (!profile) return;
      const med = await createMedication(profile.id, input);
      if (reminderOn && med.schedules[0]?.timesOfDay.length) {
        await scheduleMedicationReminders(
          med.id,
          med.name,
          med.dosage,
          med.unit,
          med.schedules[0].timesOfDay
        );
      }
      await loadAll();
    },
    [profile?.id, loadAll]
  );

  const handleMarkTaken = useCallback(
    async (item: { scheduleId: string; scheduledAt: string; name: string }) => {
      try {
        await logDose({
          scheduleId: item.scheduleId,
          scheduledAt: item.scheduledAt,
          status: "taken",
        });
        await loadAll();
      } catch (err: any) {
        Alert.alert("Lỗi", err?.message ?? "Không đánh dấu được.");
      }
    },
    [loadAll]
  );

  const handleCreateAppt = useCallback(
    async (input: AppointmentInput) => {
      if (!profile) return;
      await createAppointment(profile.id, input);
      await loadAll();
    },
    [profile?.id, loadAll]
  );

  const handleDeleteAppt = useCallback(
    async (id: string) => {
      if (!profile) return;
      try {
        await deleteAppointment(profile.id, id);
        await loadAll();
      } catch (err: any) {
        Alert.alert("Lỗi", err?.message ?? "Không xóa được.");
      }
    },
    [profile?.id, loadAll]
  );

  if (!profile) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.center}>
          <Text style={s.muted}>Chưa có hồ sơ sức khỏe.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.segmentWrap}>
          <SegmentedControl segments={SEGMENTS} selected={tab} onSelect={setTab} />
        </View>

        {tab === 0 && (
          <Animated.View entering={FadeIn.duration(150)}>
            <MedTimeline
              events={events}
              onMarkTaken={handleMarkTaken}
              onAddPress={() => medFormRef.current?.expand()}
            />
          </Animated.View>
        )}
        {tab === 1 && (
          <Animated.View entering={FadeIn.duration(150)}>
            <CabinetGrid
              medications={medications}
              onAddPress={() => medFormRef.current?.expand()}
            />
          </Animated.View>
        )}
        {tab === 2 && (
          <Animated.View entering={FadeIn.duration(150)}>
            <AppointmentCalendar
              appointments={appointments}
              onAddPress={() => apptFormRef.current?.expand()}
              onDelete={handleDeleteAppt}
            />
          </Animated.View>
        )}
      </ScrollView>

      <MedForm ref={medFormRef} onSave={handleCreateMed} />
      <AppointmentForm ref={apptFormRef} onSave={handleCreateAppt} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.DEFAULT },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing["4xl"] },
  segmentWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { fontFamily: fonts.regular, fontSize: fontSizes.base, color: colors.text.secondary },
});
