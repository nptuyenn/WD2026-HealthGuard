import { View, Text, StyleSheet } from "react-native";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";
import { WifiOff } from "lucide-react-native";

interface Props {
  visible: boolean;
}

export default function OfflineBanner({ visible }: Props) {
  if (!visible) return null;
  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(300)}
      style={s.banner}
    >
      <WifiOff size={14} color="#FFFFFF" strokeWidth={2} />
      <Text style={s.text}>Đang offline — dữ liệu được lưu cục bộ</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    height: 32,
    backgroundColor: "#374151",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  text: { fontSize: 12, color: "#FFFFFF" },
});
