import { forwardRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { ChevronDown } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";

const UNITS = ["mg", "ml", "viên", "giọt", "IU"];
const FREQUENCIES = ["1 lần/ngày", "2 lần/ngày", "3 lần/ngày", "Khi cần", "Tùy chỉnh"];

interface Props {
  onSave?: (med: any) => void;
}

const MedForm = forwardRef<BottomSheet, Props>(({ onSave }, ref) => {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [note, setNote] = useState("");
  const [unitIdx, setUnitIdx] = useState(0);
  const [freqIdx, setFreqIdx] = useState(0);
  const [reminder, setReminder] = useState(true);

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  );

  const cycleUnit = () => setUnitIdx((i) => (i + 1) % UNITS.length);
  const cycleFreq = () => setFreqIdx((i) => (i + 1) % FREQUENCIES.length);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Vui lòng nhập tên thuốc");
      return;
    }
    const med = {
      id: Date.now().toString(),
      name: name.trim(),
      dosage: dose.trim(),
      unit: UNITS[unitIdx],
      frequency: FREQUENCIES[freqIdx],
      instructions: note.trim(),
      timesPerDay: ["07:30"],
    };
    onSave?.(med);
    // reset
    setName("");
    setDose("");
    setNote("");
    setUnitIdx(0);
    setFreqIdx(0);
    (ref as React.RefObject<BottomSheet>).current?.close();
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
              placeholder="Nhập tên thuốc..."
              placeholderTextColor={colors.text.muted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Liều lượng</Text>
            <View style={s.row}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Liều"
                keyboardType="numeric"
                placeholderTextColor={colors.text.muted}
                value={dose}
                onChangeText={setDose}
              />
              <Pressable style={s.unitSelect} onPress={cycleUnit}>
                <Text style={s.unitText}>{UNITS[unitIdx]}</Text>
                <ChevronDown size={14} color={colors.text.muted} strokeWidth={1.8} />
              </Pressable>
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Tần suất</Text>
            <Pressable style={s.selectBox} onPress={cycleFreq}>
              <Text style={s.selectText}>{FREQUENCIES[freqIdx]}</Text>
              <ChevronDown size={16} color={colors.text.muted} strokeWidth={1.8} />
            </Pressable>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Giờ uống</Text>
            <Pressable style={s.selectBox} onPress={() => Alert.alert("Chọn giờ uống")}>
              <Text style={s.selectText}>07:30</Text>
              <ChevronDown size={16} color={colors.text.muted} strokeWidth={1.8} />
            </Pressable>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Ghi chú</Text>
            <TextInput
              style={s.input}
              placeholder="Trước ăn, sau ăn..."
              placeholderTextColor={colors.text.muted}
              value={note}
              onChangeText={setNote}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Ngày bắt đầu</Text>
            <Pressable style={s.selectBox} onPress={() => Alert.alert("Chọn ngày bắt đầu")}>
              <Text style={s.selectText}>13/04/2026</Text>
              <ChevronDown size={16} color={colors.text.muted} strokeWidth={1.8} />
            </Pressable>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Ngày kết thúc</Text>
            <Pressable style={s.selectBox} onPress={() => Alert.alert("Chọn ngày kết thúc")}>
              <Text style={[s.selectText, { color: colors.text.muted }]}>Không thời hạn</Text>
              <ChevronDown size={16} color={colors.text.muted} strokeWidth={1.8} />
            </Pressable>
          </View>

          <View style={s.reminderRow}>
            <Text style={s.label}>Nhắc nhở</Text>
            <Switch
              value={reminder}
              onValueChange={setReminder}
              trackColor={{ false: colors.border.DEFAULT, true: colors.brand.DEFAULT }}
            />
          </View>
        </View>

        <View style={s.btnRow}>
          <Pressable
            style={s.btnCancel}
            onPress={() => (ref as React.RefObject<BottomSheet>).current?.close()}
          >
            <Text style={s.btnCancelText}>Hủy</Text>
          </Pressable>
          <Pressable style={s.btnSubmit} onPress={handleSubmit}>
            <Text style={s.btnSubmitText}>Thêm thuốc</Text>
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
  selectBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
  },
  selectText: { fontSize: fontSizes.base, color: colors.text.DEFAULT, fontFamily: fonts.regular },
  reminderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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