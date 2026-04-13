import { View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { shadows, radius } from "@/theme";
import CardFront from "./CardFront";
import CardBack from "./CardBack";

export default function CardPreview3D() {
  const rotation = useSharedValue(0);
  const isFlipped = useSharedValue(false);

  const flipCard = () => {
    rotation.value = withTiming(isFlipped.value ? 0 : 180, { duration: 600 });
    isFlipped.value = !isFlipped.value;
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value}deg` }],
    backfaceVisibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: interpolate(
      rotation.value,
      [89, 91],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value + 180}deg` }],
    backfaceVisibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: interpolate(
      rotation.value,
      [89, 91],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View style={styles.container}>
      <Pressable onPress={flipCard} style={styles.cardOuter}>
        {/* Shadow wrapper — overflow visible để shadow hiện */}
        <View style={styles.shadow}>
          {/* Clip wrapper — overflow hidden để bo góc */}
          <View style={styles.clip}>
            <Animated.View style={frontStyle}>
              <CardFront />
            </Animated.View>
            <Animated.View style={backStyle}>
              <CardBack />
            </Animated.View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 24,
  },
  cardOuter: {
    width: "100%",
    maxWidth: 340,
    aspectRatio: 1.586,
  },
  shadow: {
    flex: 1,
    borderRadius: radius.lg,
    ...shadows.cardHover,
  },
  clip: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
});
