import { forwardRef, useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Check } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";
import DatePickerField from "@/components/shared/DatePickerField";
import type { Medication, MedicationInput } from "@/lib/medications-api";

export type MedFormSubmit =
  | {
      type: "existing";
      medicationId: string;
      timesOfDay: string[];
      startsOn: string;
      endsOn: string | null;
      reminderOn: boolean;
    }
  | { type: "new"; input: MedicationInput; reminderOn: boolean };

interface Props {
  onSave: (data: MedFormSubmit) => Promise<void>;
  medications?: Medication[];
}

const UNITS = ["mg", "ml", "viên", "giọt", "IU"];

const MedForm = forwardRef<BottomSheet, Props>(({ onSave, medications = [] }, ref) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [times, setTimes] = useState("07:30");
  const [startsOn, setStartsOn] = useState<Date>(new Date());
  const [endsOn, setEndsOn] = useState<Date | null>(null);
  const [reminder, setReminder] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  const reset = () => {
    setSelectedId(null); setNewName(""); setTimes("07:30");
    setStartsOn(new Date()); setEndsOn(null); setReminder(true);
  };

  const parseTimes = (raw: string): string[] | null => {
    const parts = raw.split(",").map((t) => t.trim()).filter(Boolean);
    if (parts.length === 0) return null;
    const re = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (const p of parts) if (!re.test(p)) return null;
    return parts;
  };

  const handleSubmit = async () => {
    const parsed = parseTimes(times);
    if (!parsed) {
      Alert.alert("Giờ không hợp lệ", "Định dạng HH:MM, cách nhau dấu phẩy. VD: 07:30, 19:30");
      return;
    }

    if (!selectedId && !newName.trim()) {
      Alert.alert("Chưa chọn thuốc", "Chọn thuốc từ tủ hoặc nhập tên thuốc mới.");
      return;
    }

    if (endsOn && endsOn < startsOn) {
      Alert.alert("Ngày kết thúc không hợp lệ", "Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }

    setSubmitting(true);
    try {
      const startsIso = startsOn.toISOString();
      const endsIso = endsOn ? endsOn.toISOString() : null;
      if (selectedId) {
        await onSave({
          type: "existing",
          medicationId: selectedId,
          timesOfDay: parsed,
          startsOn: startsIso,
          endsOn: endsIso,
          reminderOn: reminder,
        });
      } else {
        await onSave({
          type: "new",
          input: {
            name: newName.trim(),
            schedules: [{ timesOfDay: parsed, startsOn: startsIso, endsOn: endsIso }],
          },
          reminderOn: reminder,
        });
      }
      reset();
      (ref as React.RefObject<BottomSheet>).current?.close();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không lưu được lịch uống.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["80%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={s.sheetBg}
      handleIndicatorStyle={s.handle}
      onChange={(idx) => { if (idx < 0) reset(); }}
    >
      <BottomSheetScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Đặt lịch uống thuốc</Text>

        {/* Pick from cabinet */}
        {medications.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Chọn từ tủ thuốc</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
              {medications.map((med) => {
                const active = selectedId === med.id;
                return (
                  <Pressable
                    key={med.id}
                    style={[s.chip, active && s.chipActive]}
                    onPress={() => {
                      setSelectedId(active ? null : med.id);
                      if (!active) setNewName("");
                    }}
                  >
                    <View style={s.chipInner}>
                      {active && <Check size={12} color={colors.brand.DEFAULT} strokeWidth={2.5} />}
                      <Text style={[s.chipText, active && s.chipTextActive]} numberOfLines={1}>
                        {med.name}
                      </Text>
                    </View>
                    {med.dosage && (
                      <Text style={[s.chipSub, active && s.chipSubActive]}>
                        {med.dosage}{med.unit ?? ""}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Or type a new name */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>
            {medications.length > 0 ? "Hoặc nhập thuốc mới" : "Tên thuốc *"}
          </Text>
          <TextInput
            style={[s.input, selectedId !== null && s.inputDisabled]}
            placeholder="VD: Paracetamol"
            placeholderTextColor={colors.text.muted}
            value={selectedId ? (medications.find(m => m.id === selectedId)?.name ?? "") : newName}
            onChangeText={(v) => { setSelectedId(null); setNewName(v); }}
            editable={selectedId === null && !submitting}
          />
        </View>

        {/* Date range */}
        <View style={s.section}>
          <DatePickerField
            label="Ngày bắt đầu"
            value={startsOn}
            onChange={setStartsOn}
            mode="date"
          />
        </View>

        <View style={s.section}>
          <DatePickerField
            label="Ngày kết thúc (tùy chọn)"
            value={endsOn}
            onChange={setEndsOn}
            mode="date"
            minimumDate={startsOn}
            placeholder="Không giới hạn"
          />
        </View>

        {/* Times of day */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Giờ uống (HH:MM, cách nhau dấu phẩy)</Text>
          <TextInput
            style={s.input}
            placeholder="VD: 07:30, 19:30"
            placeholderTextColor={colors.text.muted}
            value={times}
            onChangeText={setTimes}
            editable={!submitting}
          />
        </View>

        {/* Reminder toggle */}
        <View style={s.reminderRow}>
          <Text style={s.sectionLabel}>Nhắc nhở (push thông báo)</Text>
          <Switch
            value={reminder}
            onValueChange={setReminder}
            trackColor={{ false: colors.border.DEFAULT, true: colors.brand.DEFAULT }}
            disabled={submitting}
          />
        </View>

        <View style={s.btnRow}>
          <Pressable
            style={s.btnCancel}
            onPress={() => (ref as React.RefObject<BottomSheet>).current?.close()}
            disabled={submitting}
          >
            <Text style={s.btnCancelText}>Hủy</Text>
          </Pressable>
          <Pressable
            style={[s.btnSubmit, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnSubmitText}>Lưu lịch</Text>
            )}
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

MedForm.displayName = "MedForm";
export default MedForm;

const s = StyleSheet.create({
  sheetBg: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: { backgroundColor: colors.border.DEFAULT, width: 40 },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontFamily: fonts.semibold, fontSize: fontSizes.lg, color: colors.text.DEFAULT, marginBottom: 20 },

  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.text.secondary, marginBottom: 6 },

  chipScroll: { flexDirection: "row" },
  chip: {
    borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, minWidth: 80,
  },
  chipActive: { borderColor: colors.brand.DEFAULT, backgroundColor: colors.brand.light },
  chipInner: { flexDirection: "row", alignItems: "center", gap: 4 },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text.DEFAULT },
  chipTextActive: { color: colors.brand.DEFAULT },
  chipSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.text.muted, marginTop: 2 },
  chipSubActive: { color: colors.brand.DEFAULT },

  input: {
    borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: radius.sm,
    padding: 12, fontSize: fontSizes.base, color: colors.text.DEFAULT, fontFamily: fonts.regular,
  },
  inputDisabled: { backgroundColor: colors.surface.DEFAULT, color: colors.text.secondary },

  reminderRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24,
  },

  btnRow: { flexDirection: "row", gap: 12 },
  btnCancel: {
    flex: 1, borderWidth: 1, borderColor: colors.border.DEFAULT,
    borderRadius: radius.md, padding: 14, alignItems: "center",
  },
  btnCancelText: { fontFamily: fonts.medium, color: colors.text.secondary, fontSize: fontSizes.base },
  btnSubmit: {
    flex: 1, backgroundColor: colors.brand.DEFAULT,
    borderRadius: radius.md, padding: 14, alignItems: "center",
  },
  btnSubmitText: { fontFamily: fonts.semibold, color: "#FFFFFF", fontSize: fontSizes.base },
});
