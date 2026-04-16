import { View, Text, StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/theme";
import { mockAllergies, mockConditions, mockMedications } from "@/lib/mock-data";

const SECTION_TITLE_BASE: object = {
  fontSize: 10,
  fontFamily: fonts.bold,
  textTransform: "uppercase" as const,
  letterSpacing: 2,
  marginBottom: 4,
};

export default function CardBack() {
  const activeMeds = mockMedications.filter((m) => m.isActive);

  return (
    <View style={styles.container}>
      {/* Dị ứng */}
      <View style={styles.section}>
        <Text style={[SECTION_TITLE_BASE, { color: colors.danger.DEFAULT }]}>
          Dị ứng
        </Text>
        <View style={styles.chips}>
          {mockAllergies.map((a) => (
            <View
              key={a.id}
              style={[styles.chip, { backgroundColor: colors.danger.light }]}
            >
              <Text style={[styles.chipText, { color: colors.danger.DEFAULT }]}>
                {a.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bệnh nền */}
      <View style={styles.section}>
        <Text style={[SECTION_TITLE_BASE, { color: colors.warning.DEFAULT }]}>
          Bệnh nền
        </Text>
        <View style={styles.chips}>
          {mockConditions.map((c) => (
            <View
              key={c.id}
              style={[styles.chip, { backgroundColor: colors.warning.light }]}
            >
              <Text
                style={[styles.chipText, { color: colors.warning.DEFAULT }]}
              >
                {c.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Thuốc đang dùng */}
      <View style={styles.section}>
        <Text style={[SECTION_TITLE_BASE, { color: colors.brand.DEFAULT }]}>
          Thuốc đang dùng
        </Text>
        {activeMeds.map((m) => (
          <Text key={m.id} style={styles.medText}>
            {"• "}
            {m.name} {m.dosage}
            {m.unit} — {m.frequency}
          </Text>
        ))}
      </View>
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
  section: {
    gap: 4,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  chipText: {
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  medText: {
    fontSize: 11,
    color: colors.text.DEFAULT,
    fontFamily: fonts.regular,
    marginBottom: 2,
  },
});
