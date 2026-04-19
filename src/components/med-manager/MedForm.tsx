import { forwardRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { ChevronDown } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";
import type { MedicationInput } from "@/lib/medications-api";

const UNITS = ["mg", "ml", "viên", "giọt", "IU"];

export type MedFormSubmit = {
  input: MedicationInput;
  reminderOn: boolean;
};

interface Props {
  onSave: (data: MedFormSubmit) => Promise<void>;
}

const MedForm = forwardRef<BottomSheet, Props>(({ onSave }, ref) => {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [note, setNote] = useState("");
  const [unitIdx, setUnitIdx] = useState(0);
  const [times, setTimes] = useState("07:30");
  const [stock, setStock] = useState("");
  const [reminder, setReminder] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  );

  const cycleUnit = () => setUnitIdx((i) => (i + 1) % UNITS.length);

  const reset = () => {
    setName(""); setDose(""); setNote(""); setUnitIdx(0); setTimes("07:30"); setStock("");
  };

  const parseTimes = (raw: string): string[] | null => {
    const parts = raw.split(",").map((t) => t.trim()).filter(Boolean);
    if (parts.length === 0) return null;
    const re = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (const p of parts) if (!re.test(p)) return null;
    return parts;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên thuốc.");
      return;
    }
    const parsed = parseTimes(times);
    if (!parsed) {
      Alert.alert("Giờ không hợp lệ", "Định dạng HH:MM, cách nhau dấu phẩy. VD: 07:30, 19:30");
      return;
    }

    const stockN = stock ? parseInt(stock, 10) : null;
    if (stock && (Number.isNaN(stockN!) || stockN! < 0)) {
      Alert.alert("Số lượng không hợp lệ");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        input: {
          name: name.trim(),
          dosage: dose.trim() || null,
          unit: UNITS[unitIdx],
          instructions: note.trim() || null,
          stockTotal: stockN,
          stockRemaining: stockN,
          schedules: [{ timesOfDay: parsed }],
        },
        reminderOn: reminder,
      });
      reset();
      (ref as React.RefObject<BottomSheet>).current?.close();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không lưu được thuốc.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["85%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={s.sheetBg}
      handleIndicatorStyle={s.handle}
    >
      <BottomSheetScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Thêm thuốc mới</Text>

        <View style={s.form}>
          <View style={s.field}>
            <Text style={s.label}>Tên thuốc</Text>
            <TextInput
              style={s.input}
              placeholder="VD: Paracetamol"
              placeholderTextColor={colors.text.muted}
              value={name}
              onChangeText={setName}
              editable={!submitting}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Liều lượng</Text>
            <View style={s.row}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="VD: 500"
                keyboardType="numeric"
                placeholderTextColor={colors.text.muted}
                value={dose}
                onChangeText={setDose}
                editable={!submitting}
              />
              <Pressable style={s.unitSelect} onPress={cycleUnit}>
                <Text style={s.unitText}>{UNITS[unitIdx]}</Text>
                <ChevronDown size={14} color={colors.text.muted} strokeWidth={1.8} />
              </Pressable>
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Giờ uống (HH:MM, cách nhau dấu phẩy)</Text>
            <TextInput
              style={s.input}
              placeholder="VD: 07:30, 19:30"
              placeholderTextColor={colors.text.muted}
              value={times}
              onChangeText={setTimes}
              editable={!submitting}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Số lượng trong tủ</Text>
            <TextInput
              style={s.input}
              placeholder="VD: 30"
              keyboardType="numeric"
              placeholderTextColor={colors.text.muted}
              value={stock}
              onChangeText={setStock}
              editable={!submitting}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Ghi chú</Text>
            <TextInput
              style={s.input}
              placeholder="Trước ăn, sau ăn..."
              placeholderTextColor={colors.text.muted}
              value={note}
              onChangeText={setNote}
              editable={!submitting}
            />
          </View>

          <View style={s.reminderRow}>
            <Text style={s.label}>Nhắc nhở (push thông báo)</Text>
            <Switch
              value={reminder}
              onValueChange={setReminder}
              trackColor={{ false: colors.border.DEFAULT, true: colors.brand.DEFAULT }}
              disabled={submitting}
            />
          </View>
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
              <Text style={s.btnSubmitText}>Thêm thuốc</Text>
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
  row: { flexDirection: "row", gap: 8 },
  unitSelect: {
    width: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
  },
  unitText: { fontFamily: fonts.regular, fontSize: fontSizes.base, color: colors.text.DEFAULT },
  reminderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
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
