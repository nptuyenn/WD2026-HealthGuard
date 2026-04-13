import { View, Pressable, StyleSheet } from "react-native";
import { colors, shadows } from "@/theme";

interface Props {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  onPress: () => void;
  label?: string;
}

export default function FloatingActionButton({ icon: Icon, onPress, label }: Props) {
  return (
    <View style={s.wrap} pointerEvents="box-none">
      <Pressable
        style={({ pressed }) => [s.fab, pressed && s.pressed]}
        onPress={onPress}
        accessibilityLabel={label}
        accessibilityRole="button"
      >
        <Icon size={24} color="#FFFFFF" strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 24,
    right: 16,
    zIndex: 40,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.glow,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
