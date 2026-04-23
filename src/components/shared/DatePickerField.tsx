import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar, Clock } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";

interface Props {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  mode?: "date" | "time";
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("vi-VN");
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [tempDate, setTempDate] = useState(value ?? new Date());

  const displayValue = value
    ? mode === "time"
      ? formatTime(value)
      : formatDate(value)
    : null;

  const icon =
    mode === "time" ? (
      <Clock size={16} color={colors.text.muted} />
    ) : (
      <Calendar size={16} color={colors.text.muted} />
    );

  const open = () => {
    setTempDate(value ?? new Date());
    setShow(true);
  };

  // ANDROID
  const onAndroidChange = (_: DateTimePickerEvent, date?: Date) => {
    setShow(false);
    if (date) onChange(date);
  };

  // IOS
  const onIosChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) setTempDate(date);
  };

  return (
    <View>
      <Text style={s.label}>{label}</Text>

      <Pressable style={s.field} onPress={open}>
        <Text style={[s.value, !displayValue && s.placeholder]}>
          {displayValue ?? placeholder ?? "Chọn"}
        </Text>
        {icon}
      </Pressable>

      {/* ANDROID */}
      {Platform.OS === "android" && show && (
        <DateTimePicker
          value={tempDate}
          mode={mode}
          display="default"
          onChange={onAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* IOS (INLINE - KHÔNG MODAL) */}
      {Platform.OS === "ios" && show && (
        <View style={s.iosContainer}>
          
          <View style={s.header}>
            <Pressable onPress={() => setShow(false)}>
              <Text style={s.cancel}>Hủy</Text>
            </Pressable>

            <Text style={s.title}>
              {mode === "time" ? "Chọn giờ" : "Chọn ngày"}
            </Text>

            <Pressable
              onPress={() => {
                setShow(false);
                onChange(tempDate);
              }}
            >
              <Text style={s.done}>Xong</Text>
            </Pressable>
          </View>

          <DateTimePicker
            value={tempDate}
            mode={mode}
            display="spinner"
            onChange={onIosChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={{ height: 200 }} // 🔥 quan trọng
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  label: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
    marginBottom: 4,
  },

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

  value: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },

  placeholder: {
    color: colors.text.muted,
  },

  iosContainer: {
    backgroundColor: "#fff",
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.base,
  },

  cancel: {
    color: colors.text.secondary,
  },

  done: {
    color: colors.brand.DEFAULT,
  },
});