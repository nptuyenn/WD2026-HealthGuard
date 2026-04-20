import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal, Platform } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Calendar, Clock } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";

interface Props {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDatetime(d: Date) {
  return `${formatDate(d)}  ${formatTime(d)}`;
}

export default function DatePickerField({
  label,
  value,
  onChange,
  mode = "date",
  minimumDate,
  maximumDate,
  placeholder,
}: Props) {
  const [show, setShow] = useState(false);
  // iOS datetime: pick date first, then time
  const [iosStep, setIosStep] = useState<"date" | "time">("date");
  const [tempDate, setTempDate] = useState<Date>(value ?? new Date());

  const displayValue = value
    ? mode === "date" ? formatDate(value)
    : mode === "time" ? formatTime(value)
    : formatDatetime(value)
    : null;

  const icon = mode === "time"
    ? <Clock size={16} color={colors.text.muted} strokeWidth={1.8} />
    : <Calendar size={16} color={colors.text.muted} strokeWidth={1.8} />;

  const handleOpen = () => {
    setTempDate(value ?? new Date());
    setIosStep("date");
    setShow(true);
  };

  // Android: picker fires onChange immediately and closes itself
  const handleAndroid = (_e: DateTimePickerEvent, selected?: Date) => {
    setShow(false);
    if (selected) onChange(selected);
  };

  // iOS: show in modal with Done button
  const handleIosChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (selected) setTempDate(selected);
  };

  const handleIosDone = () => {
    if (mode === "datetime" && iosStep === "date") {
      setIosStep("time");
      return;
    }
    setShow(false);
    onChange(tempDate);
  };

  const iosPickerMode = mode === "datetime" ? iosStep : mode;

  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <Pressable style={s.field} onPress={handleOpen}>
        <Text style={[s.value, !displayValue && s.placeholder]}>
          {displayValue ?? (placeholder ?? "Chọn ngày")}
        </Text>
        {icon}
      </Pressable>

      {/* Android: render directly, auto-dismisses */}
      {Platform.OS === "android" && show && (
        <DateTimePicker
          value={tempDate}
          mode={mode === "datetime" ? "date" : mode}
          display="default"
          onChange={handleAndroid}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* iOS: modal with done button */}
      {Platform.OS === "ios" && (
        <Modal visible={show} transparent animationType="slide">
          <Pressable style={s.overlay} onPress={() => setShow(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Pressable onPress={() => setShow(false)}>
                <Text style={s.cancelText}>Hủy</Text>
              </Pressable>
              <Text style={s.sheetTitle}>
                {mode === "datetime" && iosStep === "time" ? "Chọn giờ" : "Chọn ngày"}
              </Text>
              <Pressable onPress={handleIosDone}>
                <Text style={s.doneText}>
                  {mode === "datetime" && iosStep === "date" ? "Tiếp" : "Xong"}
                </Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={tempDate}
              mode={iosPickerMode}
              display="spinner"
              onChange={handleIosChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              locale="vi-VN"
              style={{ width: "100%" }}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 12, fontFamily: fonts.medium, color: colors.text.secondary, marginBottom: 4 },
  field: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
    backgroundColor: "#fff",
  },
  value: { fontFamily: fonts.regular, fontSize: fontSizes.base, color: colors.text.DEFAULT },
  placeholder: { color: colors.text.muted },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.DEFAULT,
  },
  sheetTitle: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.text.DEFAULT },
  cancelText: { fontFamily: fonts.regular, fontSize: fontSizes.base, color: colors.text.secondary },
  doneText: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.brand.DEFAULT },
});
