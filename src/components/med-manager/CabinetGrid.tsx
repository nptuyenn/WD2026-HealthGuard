import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { colors, fonts, radius } from "@/theme";
import CabinetCard, { type CabinetItem } from "./CabinetCard";
import type { Medication } from "@/lib/medications-api";

interface Props {
  medications: Medication[];
  onAddPress: () => void;
}

function toCabinetItem(m: Medication): CabinetItem {
  return {
    id: m.id,
    name: m.name + (m.dosage ? ` ${m.dosage}${m.unit ?? ""}` : ""),
    quantityTotal: m.stockTotal ?? 0,
    quantityRemaining: m.stockRemaining ?? 0,
    expiryDate: m.expiryDate ? m.expiryDate.slice(0, 10) : "",
    lowStockThreshold: m.lowStockThreshold,
  };
}

export default function CabinetGrid({ medications, onAddPress }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - 48) / 2;
  const items = medications.map(toCabinetItem);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Tủ thuốc của bạn</Text>
        <Pressable style={s.addBtn} onPress={onAddPress}>
          <Text style={s.addBtnText}>+ Thêm vào tủ</Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <Text style={s.empty}>Tủ thuốc trống. Nhấn "Thêm vào tủ" để bắt đầu.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={s.columnWrapper}
          contentContainerStyle={s.listContent}
          renderItem={({ item, index }) => (
            <CabinetCard item={item} width={cardWidth} index={index} />
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text.DEFAULT },
  addBtn: {
    borderWidth: 1,
    borderColor: colors.brand.DEFAULT,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: { fontSize: 13, color: colors.brand.DEFAULT, fontFamily: fonts.medium },
  empty: {
    textAlign: "center",
    marginVertical: 40,
    color: colors.text.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  columnWrapper: { gap: 12 },
  listContent: { gap: 12 },
});
