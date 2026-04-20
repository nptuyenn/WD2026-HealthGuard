import { forwardRef, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
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
import DatePickerField from "@/components/shared/DatePickerField";
import { METRIC_META, type MetricInput, type MetricType } from "@/lib/health-metrics-api";

const PICKABLE: MetricType[] = [
  "blood_pressure",
  "glucose",
  "heart_rate",
  "weight",
  "spo2",
  "temperature",
];

interface Props {
  onSave: (input: MetricInput) => Promise<void>;
}

const MetricForm = forwardRef<BottomSheet, Props>(({ onSave }, ref) => {
  const [metricType, setMetricType] = useState<MetricType>("blood_pressure");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [notes, setNotes] = useState("");
  const [recordedAt, setRecordedAt] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  );

  const isBP = metricType === "blood_pressure";
  const meta = useMemo(() => METRIC_META[metricType], [metricType]);

  const reset = () => {
    setValue1(""); setValue2(""); setNotes(""); setRecordedAt(new Date());
  };

  const pickType = () =>
    Alert.alert(
      "Chọn loại chỉ số",
      undefined,
      PICKABLE.map((k) => ({
        text: METRIC_META[k].label,
        onPress: () => setMetricType(k),
      })).concat([{ text: "Hủy", onPress: () => {} }])
    );

  const parse = (s: string) => {
    const n = parseFloat(s.replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  };

  const handleSubmit = async () => {
    const v1 = parse(value1);
    if (Number.isNaN(v1)) return Alert.alert("Thiếu giá trị", "Vui lòng nhập số hợp lệ.");
    let v2: number | null = null;
    if (isBP) {
      const parsed2 = parse(value2);
      if (Number.isNaN(parsed2)) return Alert.alert("Huyết áp", "Vui lòng nhập cả tâm thu và tâm trương.");
      v2 = parsed2;
    }

    setSubmitting(true);
    try {
      await onSave({
        metricType,
        valueNum: v1,
        valueNum2: v2,
        unit: meta.unit,
        recordedAt: recordedAt.toISOString(),
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
      snapPoints={["85%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={s.sheetBg}
      handleIndicatorStyle={s.handle}
    >
      <BottomSheetScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Ghi chỉ số mới</Text>

        <View style={s.form}>
          <View style={s.field}>
            <Text style={s.label}>Loại chỉ số</Text>
            <Pressable style={s.selectBox} onPress={pickType}>
              <Text style={s.selectText}>{meta.label}</Text>
              <ChevronDown size={16} color={colors.text.muted} strokeWidth={1.8} />
            </Pressable>
            <Text style={s.hint}>Bình thường: {meta.thresholdText} {meta.unit}</Text>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Giá trị</Text>
            {isBP ? (
              <View style={s.bpRow}>
                <TextInput
                  style={[s.valueInput, { flex: 1 }]}
                  placeholder="120"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  value={value1}
                  onChangeText={setValue1}
                  editable={!submitting}
                />
                <Text style={s.slashText}>/</Text>
                <TextInput
                  style={[s.valueInput, { flex: 1 }]}
                  placeholder="80"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  value={value2}
                  onChangeText={setValue2}
                  editable={!submitting}
                />
                <Text style={s.unitText}>{meta.unit}</Text>
              </View>
            ) : (
              <View style={s.singleValueRow}>
                <TextInput
                  style={[s.valueInput, { flex: 1, textAlign: "center" }]}
                  placeholder="0"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="decimal-pad"
                  value={value1}
                  onChangeText={setValue1}
                  editable={!submitting}
                />
                <Text style={s.unitText}>{meta.unit}</Text>
              </View>
            )}
          </View>

          <DatePickerField
            label="Thời gian đo"
            value={recordedAt}
            onChange={setRecordedAt}
            mode="datetime"
            maximumDate={new Date()}
          />

          <View style={s.field}>
            <Text style={s.label}>Ghi chú</Text>
            <TextInput
              style={[s.input, { height: 72, textAlignVertical: "top" }]}
              placeholder="Ghi chú thêm... (tùy chọn)"
              placeholderTextColor={colors.text.muted}
              multiline
              value={notes}
              onChangeText={setNotes}
              editable={!submitting}
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
              <Text style={s.btnSubmitText}>Lưu chỉ số</Text>
            )}
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

MetricForm.displayName = "MetricForm";
export default MetricForm;

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
  hint: { fontSize: 11, color: colors.text.muted, fontFamily: fonts.regular, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },
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
  bpRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  singleValueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  valueInput: {
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 28,
    color: colors.text.DEFAULT,
    fontFamily: fonts.mono,
  },
  slashText: { fontSize: 24, color: colors.text.muted, fontFamily: fonts.bold },
  unitText: { fontSize: 14, color: colors.text.muted, fontFamily: fonts.regular, minWidth: 50 },
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
