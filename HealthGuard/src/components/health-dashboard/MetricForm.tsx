import { forwardRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { ChevronDown } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";

type MetricType = "Huyết áp" | "Đường huyết" | "Nhịp tim" | "Cân nặng" | "SpO2" | "Nhiệt độ";

const METRIC_UNITS: Record<MetricType, string> = {
  "Huyết áp": "mmHg",
  "Đường huyết": "mmol/L",
  "Nhịp tim": "bpm",
  "Cân nặng": "kg",
  "SpO2": "%",
  "Nhiệt độ": "°C",
};

const METRICS: MetricType[] = Object.keys(METRIC_UNITS) as MetricType[];

const MetricForm = forwardRef<BottomSheet, object>((_props, ref) => {
  const [metricType, setMetricType] = useState<MetricType>("Huyết áp");

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  );

  const isBP = metricType === "Huyết áp";
  const unit = METRIC_UNITS[metricType];

  const handleSave = () => {
    Alert.alert("Thành công", "Đã ghi nhận chỉ số");
    (ref as React.RefObject<BottomSheet>).current?.close();
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
        <Text style={s.title}>Ghi chỉ số mới</Text>

        <View style={s.form}>
          {/* Loại chỉ số */}
          <View style={s.field}>
            <Text style={s.label}>Loại chỉ số</Text>
            <Pressable
              style={s.selectBox}
              onPress={() =>
                Alert.alert(
                  "Chọn loại chỉ số",
                  undefined,
                  METRICS.map((m) => ({ text: m, onPress: () => setMetricType(m) }))
                )
              }
            >
              <Text style={s.selectText}>{metricType}</Text>
              <ChevronDown size={16} color={colors.text.muted} strokeWidth={1.8} />
            </Pressable>
          </View>

          {/* Giá trị */}
          <View style={s.field}>
            <Text style={s.label}>Giá trị</Text>
            {isBP ? (
              <View style={s.bpRow}>
                <TextInput
                  style={[s.valueInput, { flex: 1 }]}
                  placeholder="120"
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.muted}
                  fontFamily={fonts.mono}
                />
                <Text style={s.slashText}>/</Text>
                <TextInput
                  style={[s.valueInput, { flex: 1 }]}
                  placeholder="80"
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.muted}
                  fontFamily={fonts.mono}
                />
                <Text style={s.unitText}>{unit}</Text>
              </View>
            ) : (
              <View style={s.singleValueRow}>
                <TextInput
                  style={[s.valueInput, { flex: 1, textAlign: "center" }]}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.muted}
                  fontFamily={fonts.mono}
                />
                <Text style={s.unitText}>{unit}</Text>
              </View>
            )}
          </View>

          {/* Ngày giờ đo */}
          <View style={s.field}>
            <Text style={s.label}>Ngày giờ đo</Text>
            <Pressable
              style={s.selectBox}
              onPress={() => Alert.alert("Chọn ngày giờ")}
            >
              <Text style={s.selectText}>13/04/2026 — 08:00</Text>
              <ChevronDown size={16} color={colors.text.muted} strokeWidth={1.8} />
            </Pressable>
          </View>

          {/* Ghi chú */}
          <View style={s.field}>
            <Text style={s.label}>Ghi chú</Text>
            <TextInput
              style={[s.input, { height: 72 }]}
              placeholder="Ghi chú thêm..."
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              fontFamily={fonts.regular}
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
          <Pressable style={s.btnSubmit} onPress={handleSave}>
            <Text style={s.btnSubmitText}>Lưu chỉ số</Text>
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
