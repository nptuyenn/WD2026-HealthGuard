import { View, Text, Pressable, FlatList, StyleSheet, Alert, useWindowDimensions } from "react-native";
import { colors, fonts, radius } from "@/theme";
import CabinetCard from "./CabinetCard";
import { mockCabinet } from "@/lib/mock-data";

export default function CabinetGrid() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - 48) / 2;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Tủ thuốc của bạn</Text>
        <Pressable style={s.addBtn} onPress={() => Alert.alert("Thêm vào tủ thuốc")}>
          <Text style={s.addBtnText}>+ Thêm vào tủ</Text>
        </Pressable>
      </View>

      <FlatList
        data={mockCabinet}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={s.columnWrapper}
        contentContainerStyle={s.listContent}
        renderItem={({ item, index }) => <CabinetCard item={item} width={cardWidth} index={index} />}
      />
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
  title: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text.DEFAULT,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: colors.brand.DEFAULT,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: {
    fontSize: 13,
    color: colors.brand.DEFAULT,
    fontFamily: fonts.medium,
  },
  columnWrapper: { gap: 12 },
  listContent: { gap: 12 },
});
