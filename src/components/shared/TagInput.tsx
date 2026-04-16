import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { X } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";

type ChipColor = "danger" | "warning" | "brand";

const CHIP_STYLES: Record<ChipColor, { bg: string; text: string }> = {
  danger:  { bg: colors.danger.light,  text: colors.danger.DEFAULT },
  warning: { bg: colors.warning.light, text: colors.warning.DEFAULT },
  brand:   { bg: colors.brand.light,   text: colors.brand.DEFAULT },
};

interface Props {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
  chipColor?: ChipColor;
}

export default function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder = "Thêm tag...",
  chipColor = "brand",
}: Props) {
  const [input, setInput] = useState("");
  const chip = CHIP_STYLES[chipColor];

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
    }
    setInput("");
  };

  return (
    <View>
      <TextInput
        style={s.input}
        value={input}
        onChangeText={setInput}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        fontFamily={fonts.regular}
      />

      {tags.length > 0 && (
        <View style={s.tagRow}>
          {tags.map((tag) => (
            <View key={tag} style={[s.tag, { backgroundColor: chip.bg }]}>
              <Text style={[s.tagText, { color: chip.text }]}>{tag}</Text>
              <Pressable onPress={() => onRemove(tag)} hitSlop={8}>
                <X size={14} color={chip.text} strokeWidth={2} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 13, fontFamily: fonts.medium },
});
