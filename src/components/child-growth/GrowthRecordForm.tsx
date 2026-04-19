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

type GrowthInput = {
  measuredOn: string;
  weightKg?: number | null;
  heightCm?: number | null;
  headCm?: number | null;
  notes?: string | null;
};

interface Props {
  onSave: (input: GrowthInput) => Promise<void>;
}

function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const GrowthRecordForm = forwardRef<BottomSheet, Props>(({ onSave }, ref) => {
  const [dateStr, setDateStr] = useState(todayYMD());
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [head, setHead] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  );

  const reset = () => {
    setDateStr(todayYMD()); setWeight(""); setHeight(""); setHead(""); setNotes("");
  };

  const parseNum = (s: string) => {
    if (!s.trim()) return null;
    const n = parseFloat(s.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : NaN;
  };

  const handleSubmit = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
      return Alert.alert("Ngày không hợp lệ", "Định dạng YYYY-MM-DD.");

    const w = parseNum(weight);
    const h = parseNum(height);
    const hd = parseNum(head);
    if (w !== null && Number.isNaN(w)) return Alert.alert("Cân nặng không hợp lệ");
    if (h !== null && Number.isNaN(h)) return Alert.alert("Chiều cao không hợp lệ");
    if (hd !== null && Number.isNaN(hd)) return Alert.alert("Vòng đầu không hợp lệ");
    if (w === null && h === null && hd === null)
      return Alert.alert("Thiếu thông tin", "Vui lòng nhập ít nhất một chỉ số.");

    setSubmitting(true);
    try {
      await onSave({
        measuredOn: new Date(`${dateStr}T00:00:00`).toISOString(),
        weightKg: w,
        heightCm: h,
        headCm: hd,
        notes: notes.trim() || null,
      });
      reset();
      (ref as React.RefObject<BottomSheet>).current?.close();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không lưu được chỉ số.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["75%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={s.sheetBg}
      handleIndicatorStyle={s.handle}
    >
      <BottomSheetScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Thêm chỉ số tăng trưởng</Text>

        <View style={s.form}>
          <Field label="Ngày đo (YYYY-MM-DD)" value={dateStr} onChangeText={setDateStr} />
          <Field label="Cân nặng (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="VD: 9.5" />
          <Field label="Chiều cao (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="VD: 78" />
          <Field label="Vòng đầu (cm)" value={head} onChangeText={setHead} keyboardType="decimal-pad" placeholder="VD: 46" />
          <Field label="Ghi chú" value={notes} onChangeText={setNotes} placeholder="Tùy chọn" />
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
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.btnSubmitText}>Lưu</Text>}
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
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
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
        keyboardType={keyboardType ?? "default"}
      />
    </View>
  );
}

GrowthRecordForm.displayName = "GrowthRecordForm";
export default GrowthRecordForm;

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
