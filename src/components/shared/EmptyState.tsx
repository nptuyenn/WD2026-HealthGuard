import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";

interface Props {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: Props) {
  return (
    <View style={s.container}>
      <View style={s.iconWrap}>
        <Icon size={48} color={colors.text.muted} strokeWidth={1.5} />
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.description}>{description}</Text>
      {actionLabel && onAction && (
        <Pressable style={s.actionBtn} onPress={onAction}>
          <Text style={s.actionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: "center", padding: 40 },
  iconWrap: { opacity: 0.4 },
  title: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.medium,
    color: colors.text.DEFAULT,
    marginTop: 16,
  },
  description: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    textAlign: "center",
    maxWidth: 280,
    marginTop: 4,
    fontFamily: fonts.regular,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.brand.DEFAULT,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  actionText: { color: colors.brand.DEFAULT, fontFamily: fonts.medium, fontSize: fontSizes.sm },
});
