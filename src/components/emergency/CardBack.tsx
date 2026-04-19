import { View, Text, StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/theme";

const SECTION_TITLE_BASE: object = {
  fontSize: 10,
  fontFamily: fonts.bold,
  textTransform: "uppercase" as const,
  letterSpacing: 2,
  marginBottom: 4,
};

type Props = {
  allergies: string[];
  conditions: string[];
  notes: string | null;
};

export default function CardBack({ allergies, conditions, notes }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[SECTION_TITLE_BASE, { color: colors.danger.DEFAULT }]}>Dị ứng</Text>
        <View style={styles.chips}>
          {allergies.length === 0 ? (
            <Text style={styles.emptyText}>Không có</Text>
          ) : (
            allergies.map((a) => (
              <View key={a} style={[styles.chip, { backgroundColor: colors.danger.light }]}>
                <Text style={[styles.chipText, { color: colors.danger.DEFAULT }]}>{a}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[SECTION_TITLE_BASE, { color: colors.warning.DEFAULT }]}>Bệnh nền</Text>
        <View style={styles.chips}>
          {conditions.length === 0 ? (
            <Text style={styles.emptyText}>Không có</Text>
          ) : (
            conditions.map((c) => (
              <View key={c} style={[styles.chip, { backgroundColor: colors.warning.light }]}>
                <Text style={[styles.chipText, { color: colors.warning.DEFAULT }]}>{c}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {notes && (
        <View style={styles.section}>
          <Text style={[SECTION_TITLE_BASE, { color: colors.brand.DEFAULT }]}>Ghi chú</Text>
          <Text style={styles.notesText} numberOfLines={3}>{notes}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: 16,
    gap: 10,
  },
  section: { gap: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  chipText: { fontSize: 11, fontFamily: fonts.medium },
  emptyText: { fontSize: 11, color: colors.text.muted, fontStyle: "italic" },
  notesText: { fontSize: 11, color: colors.text.DEFAULT, fontFamily: fonts.regular },
});
