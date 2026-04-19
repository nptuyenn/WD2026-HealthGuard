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
import type { EmergencyContact } from "@/lib/emergency-api";

type Props = {
  fullName: string;
  dob: string | null;
  bloodType: string | null;
  primaryContact: EmergencyContact | null;
  publicToken: string | null;
  allergies: string[];
  conditions: string[];
  notes: string | null;
};

export default function CardPreview3D(props: Props) {
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
    opacity: interpolate(rotation.value, [89, 91], [1, 0], Extrapolation.CLAMP),
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value + 180}deg` }],
    backfaceVisibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: interpolate(rotation.value, [89, 91], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.container}>
      <Pressable onPress={flipCard} style={styles.cardOuter}>
        <View style={styles.shadow}>
          <View style={styles.clip}>
            <Animated.View style={frontStyle}>
              <CardFront
                fullName={props.fullName}
                dob={props.dob}
                bloodType={props.bloodType}
                primaryContact={props.primaryContact}
                publicToken={props.publicToken}
              />
            </Animated.View>
            <Animated.View style={backStyle}>
              <CardBack
                allergies={props.allergies}
                conditions={props.conditions}
                notes={props.notes}
              />
            </Animated.View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 24 },
  cardOuter: { width: "100%", maxWidth: 340, aspectRatio: 1.586 },
  shadow: { flex: 1, borderRadius: radius.lg, ...shadows.cardHover },
  clip: { flex: 1, borderRadius: radius.lg, overflow: "hidden" },
});
