import { forwardRef, useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { colors, fonts, fontSizes, radius } from "@/theme";
import DatePickerField from "@/components/shared/DatePickerField";
import type { AppointmentInput } from "@/lib/appointments-api";

interface Props {
  onSave: (input: AppointmentInput) => Promise<void>;
}

const AppointmentForm = forwardRef<BottomSheet, Props>(({ onSave }, ref) => {
  const [title, setTitle] = useState("");
  const [doctor, setDoctor] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  const reset = () => {
    setTitle(""); setDoctor(""); setLocation(""); setScheduledAt(null); setNotes("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề lịch hẹn.");
    if (!scheduledAt) return Alert.alert("Thiếu thông tin", "Vui lòng chọn ngày và giờ hẹn.");

    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        doctorName: doctor.trim() || null,
        location: location.trim() || null,
        scheduledAt: scheduledAt.toISOString(),
        notes: notes.trim() || null,
      });
      reset();
      (ref as React.RefObject<BottomSheet>).current?.close();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không lưu được lịch hẹn.");
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
        <Text style={s.title}>Thêm lịch tái khám</Text>

        <View style={s.form}>
          <Field label="Tiêu đề *" value={title} onChangeText={setTitle} placeholder="VD: Tái khám định kỳ" />
          <Field label="Bác sĩ" value={doctor} onChangeText={setDoctor} placeholder="VD: BS. Nguyễn Văn A" />
          <Field label="Địa điểm" value={location} onChangeText={setLocation} placeholder="VD: BV Bạch Mai" />

          <DatePickerField
            label="Ngày & Giờ hẹn *"
            value={scheduledAt}
            onChange={setScheduledAt}
            mode="datetime"
            minimumDate={new Date()}
            placeholder="Chọn ngày và giờ"
          />

          <Field label="Ghi chú" value={notes} onChangeText={setNotes} placeholder="Nhịn ăn trước khi khám..." />
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
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.btnSubmitText}>Thêm lịch</Text>}
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
      />
    </View>
  );
}

AppointmentForm.displayName = "AppointmentForm";
export default AppointmentForm;

const s = StyleSheet.create({
  sheetBg: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: { backgroundColor: colors.border.DEFAULT, width: 40 },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontFamily: fonts.semibold, fontSize: fontSizes.lg, color: colors.text.DEFAULT, marginBottom: 20 },
  form: { gap: 16 },
  field: { gap: 4 },
  label: { fontSize: 12, fontFamily: fonts.medium, color: colors.text.secondary },
  input: {
    borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: radius.sm,
    padding: 12, fontSize: fontSizes.base, color: colors.text.DEFAULT, fontFamily: fonts.regular,
  },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 24 },
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
