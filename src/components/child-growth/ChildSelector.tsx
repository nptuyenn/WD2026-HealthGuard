import { FlatList, View, Text, Pressable, StyleSheet } from "react-native";
import { Plus } from "lucide-react-native";
import { colors, fonts, radius } from "@/theme";
import type { Profile } from "@/store/auth";

const AVATAR_COLORS = [
  colors.brand.light,
  colors.purple.light,
  colors.warning.light,
  colors.success.light,
];

function initials(name: string) {
  return (name.trim().split(/\s+/).pop()?.charAt(0) ?? "B").toUpperCase();
}

interface Props {
  profiles: Profile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddPress: () => void;
}

export default function ChildSelector({ profiles, selectedId, onSelect, onAddPress }: Props) {
  return (
    <FlatList
      horizontal
      data={profiles}
      keyExtractor={(p) => p.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.list}
      ListFooterComponent={
        <Pressable style={s.item} onPress={onAddPress}>
          <View style={s.addAvatar}>
            <Plus size={20} color={colors.text.muted} strokeWidth={2} />
          </View>
          <Text style={s.addLabel}>Thêm bé</Text>
        </Pressable>
      }
      ListEmptyComponent={null}
      renderItem={({ item, index }) => {
        const selected = item.id === selectedId;
        const bg = AVATAR_COLORS[index % AVATAR_COLORS.length];
        return (
          <Pressable style={s.item} onPress={() => onSelect(item.id)}>
            <View style={[s.avatar, { backgroundColor: bg }, selected && s.avatarSelected]}>
              <Text style={s.initials}>{initials(item.fullName)}</Text>
            </View>
            <Text style={[s.label, selected && s.labelSelected]} numberOfLines={1}>
              {item.fullName}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: 16, gap: 12, paddingVertical: 8 },
  item: { alignItems: "center", gap: 4 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSelected: { borderWidth: 2, borderColor: colors.brand.DEFAULT },
  initials: { fontFamily: fonts.bold, fontSize: 16, color: colors.text.DEFAULT },
  label: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.text.secondary,
    maxWidth: 56,
    textAlign: "center",
    opacity: 0.6,
  },
  labelSelected: { fontFamily: fonts.semibold, opacity: 1 },
  addAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
  },
  addLabel: { fontSize: 12, color: colors.text.muted, fontFamily: fonts.regular },
});
