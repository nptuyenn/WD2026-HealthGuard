import { FlatList, View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Plus } from "lucide-react-native";
import { colors, fonts, radius } from "@/theme";
import { mockChildren } from "@/lib/mock-data";

const AVATAR_COLORS = [colors.brand.light, colors.purple.light, colors.warning.light, colors.success.light];

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ChildSelector({ selectedId, onSelect }: Props) {
  return (
    <FlatList
      horizontal
      data={mockChildren}
      keyExtractor={(c) => c.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.list}
      ListFooterComponent={
        <Pressable style={s.item} onPress={() => Alert.alert("Thêm bé")}>
          <View style={s.addAvatar}>
            <Plus size={20} color={colors.text.muted} strokeWidth={2} />
          </View>
          <Text style={s.addLabel}>Thêm bé</Text>
        </Pressable>
      }
      renderItem={({ item, index }) => {
        const selected = item.id === selectedId;
        const initials = item.name.split(" ").pop()?.charAt(0).toUpperCase() ?? "B";
        const bg = AVATAR_COLORS[index % AVATAR_COLORS.length];
        return (
          <Pressable style={s.item} onPress={() => onSelect(item.id)}>
            <View
              style={[
                s.avatar,
                { backgroundColor: bg },
                selected && s.avatarSelected,
              ]}
            >
              <Text style={s.initials}>{initials}</Text>
            </View>
            <Text style={[s.label, selected && s.labelSelected]} numberOfLines={1}>
              {item.name}
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
  avatarSelected: {
    borderWidth: 2,
    borderColor: colors.brand.DEFAULT,
  },
  initials: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text.DEFAULT,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.text.secondary,
    maxWidth: 56,
    textAlign: "center",
    opacity: 0.6,
  },
  labelSelected: {
    fontFamily: fonts.semibold,
    opacity: 1,
  },
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
