import { View, Text, Pressable, StyleSheet } from "react-native";
import { Plus, ClipboardPen, QrCode, FolderClock } from "lucide-react-native";
import { colors, fonts } from "@/theme";
import { useRouter } from "expo-router";

const ACTIONS = [
  { icon: Plus, label: "Thêm thuốc" },
  { icon: ClipboardPen, label: "Ghi chỉ số" },
  { icon: QrCode, label: "Quét QR" },
  { icon: FolderClock, label: "Lịch sử khám" },
] as const;

export default function QuickActions() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {ACTIONS.map(({ icon: Icon, label }) => (
        <Pressable
          key={label}
          onPress={() => {
            if (label === "Thêm thuốc") {
              router.push("/med-manager");
            } else if (label === "Ghi chỉ số") {
              router.push("/health-dashboard");
            } else if (label === "Quét QR") {
              router.push("/scan");
            } else if (label === "Lịch sử khám") {
              router.push("/clinic-visits");
            }
          }}
          style={styles.item}
        >
          {({ pressed }) => (
            <>
              <View
                style={[
                  styles.iconBox,
                  pressed && styles.iconBoxPressed,
                ]}
              >
                <Icon
                  size={24}
                  color={pressed ? "#FFFFFF" : colors.brand.DEFAULT}
                  strokeWidth={1.8}
                />
              </View>
              <Text style={styles.label}>{label}</Text>
            </>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  item: {
    alignItems: "center",
    gap: 6,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBoxPressed: {
    backgroundColor: colors.brand.DEFAULT,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
  },
});
