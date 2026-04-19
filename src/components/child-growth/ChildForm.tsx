import { forwardRef, useState } from "react";
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
import type { ProfileInput } from "@/lib/child-growth-api";

const GENDERS = [
  { value: "male", label: "Bé trai" },
  { value: "female", label: "Bé gái" },
];

interface Props {
  onSave: (input: ProfileInput) => Promise<void>;
}

const ChildForm = forwardRef<BottomSheet, Props>(({ onSave }, ref) => {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState(GENDERS[0].value);
  const [submitting, setSubmitting] = useState(false);

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  );

  const reset = () => {
    setFullName(""); setDob(""); setGender(GENDERS[0].value);
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) return Alert.alert("Thiếu thông tin", "Vui lòng nhập tên bé.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob))
      return Alert.alert("Ngày sinh không hợp lệ", "Định dạng YYYY-MM-DD. VD: 2024-05-10");

    setSubmitting(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        dob: new Date(`${dob}T00:00:00`).toISOString(),
        gender,
        relationship: "child",
      });
      reset();
      (ref as React.RefObject<BottomSheet>).current?.close();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không lưu được hồ sơ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["70%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={s.sheetBg}
      handleIndicatorStyle={s.handle}
    >
      <BottomSheetScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Thêm bé mới</Text>

        <View style={s.form}>
          <View style={s.field}>
            <Text style={s.label}>Họ và tên</Text>
            <TextInput
              style={s.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="VD: Nguyễn An"
              placeholderTextColor={colors.text.muted}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Ngày sinh (YYYY-MM-DD)</Text>
            <TextInput
              style={s.input}
              value={dob}
              onChangeText={setDob}
              placeholder="2024-05-10"
              placeholderTextColor={colors.text.muted}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Giới tính</Text>
            <View style={s.genderRow}>
              {GENDERS.map((g) => (
                <Pressable
                  key={g.value}
                  style={[s.genderBtn, gender === g.value && s.genderBtnActive]}
                  onPress={() => setGender(g.value)}
                >
                  <Text style={[s.genderText, gender === g.value && s.genderTextActive]}>
                    {g.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={s.note}>
            Sau khi lưu, lịch tiêm TCMR sẽ được tạo tự động theo ngày sinh của bé.
          </Text>
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
              <Text style={s.btnSubmitText}>Thêm bé</Text>
            )}
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

ChildForm.displayName = "ChildForm";
export default ChildForm;

const s = StyleSheet.create({
  sheetBg: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: { backgroundColor: colors.border.DEFAULT, width: 40 },
  content: { padding: 24 },
  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg,
    color: colors.text.DEFAULT,
    marginBottom: 20,
  },
  form: { gap: 16 },
  field: { gap: 4 },
  label: { fontSize: 12, fontFamily: fonts.medium, color: colors.text.secondary },
  input: {
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },
  genderRow: { flexDirection: "row", gap: 8 },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
    alignItems: "center",
  },
  genderBtnActive: {
    backgroundColor: colors.brand.light,
    borderColor: colors.brand.DEFAULT,
  },
  genderText: { fontFamily: fonts.regular, color: colors.text.secondary },
  genderTextActive: { fontFamily: fonts.semibold, color: colors.brand.DEFAULT },
  note: {
    fontSize: 12,
    color: colors.text.muted,
    fontStyle: "italic",
    fontFamily: fonts.regular,
  },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
  },
  btnCancelText: { fontFamily: fonts.medium, color: colors.text.secondary, fontSize: fontSizes.base },
  btnSubmit: {
    flex: 1,
    backgroundColor: colors.brand.DEFAULT,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
  },
  btnSubmitText: { fontFamily: fonts.semibold, color: "#FFFFFF", fontSize: fontSizes.base },
});
