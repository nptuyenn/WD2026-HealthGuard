import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, fonts, radius, shadows } from "@/theme";

interface Props {
  segments: string[];
  selected: number;
  onSelect: (index: number) => void;
}

export default function SegmentedControl({ segments, selected, onSelect }: Props) {
  return (
    <View style={s.wrap}>
      {segments.map((seg, i) => (
        <Pressable
          key={seg}
          style={[s.segment, i === selected && s.segmentActive]}
          onPress={() => onSelect(i)}
        >
          <Text style={[s.text, i === selected ? s.textActive : s.textInactive]}>
            {seg}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.surface.card,
    ...shadows.card,
  },
  text: {
    fontSize: 14,
  },
  textActive: {
    fontFamily: fonts.semibold,
    color: colors.text.DEFAULT,
  },
  textInactive: {
    fontFamily: fonts.regular,
    color: colors.text.secondary,
  },
});
