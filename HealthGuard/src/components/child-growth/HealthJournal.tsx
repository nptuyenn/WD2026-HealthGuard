import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Plus } from "lucide-react-native";
import { colors, fonts, radius, shadows } from "@/theme";
import JournalEntry, { type HealthLog } from "./JournalEntry";
import { mockChildHealthLogs } from "@/lib/mock-data";

const ALL_TAGS = ["Tất cả", "sốt", "khám-định-kỳ", "khám-bệnh", "theo-dõi"];

export default function HealthJournal({ childId }: { childId: string }) {
  const [activeTag, setActiveTag] = useState("Tất cả");

  const logs = (mockChildHealthLogs as HealthLog[])
    .filter((l) => l.childId === childId)
    .filter((l) => activeTag === "Tất cả" || l.tags.includes(activeTag))
    .sort((a, b) => b.logDate.localeCompare(a.logDate));

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Nhật ký sức khỏe</Text>
        <Pressable
          style={s.addBtn}
          onPress={() => Alert.alert("Thêm ghi chú")}
        >
          <Plus size={14} color={colors.brand.DEFAULT} strokeWidth={2} />
          <Text style={s.addBtnText}>Thêm ghi chú</Text>
        </Pressable>
      </View>

      {/* Filter tags */}
      <View style={s.filters}>
        {ALL_TAGS.map((tag) => (
          <Pressable
            key={tag}
            style={[s.filterChip, tag === activeTag && s.filterChipActive]}
            onPress={() => setActiveTag(tag)}
          >
            <Text
              style={[s.filterText, tag === activeTag && s.filterTextActive]}
            >
              {tag}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Timeline */}
      <View style={s.timeline}>
        <View style={s.verticalLine} />
        {logs.map((log, idx) => (
          <View key={log.id} style={s.entry}>
            <View style={s.node} />
            <View style={s.entryContent}>
              <JournalEntry log={log} index={idx} />
            </View>
          </View>
        ))}
        {logs.length === 0 && (
          <Text style={s.empty}>Không có ghi chú nào.</Text>
        )}
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.brand.DEFAULT,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: { fontSize: 13, color: colors.brand.DEFAULT, fontFamily: fonts.medium },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  filterChip: {
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: { backgroundColor: colors.brand.DEFAULT },
  filterText: { fontSize: 13, color: colors.text.secondary, fontFamily: fonts.medium },
  filterTextActive: { color: "#FFFFFF" },
  timeline: { position: "relative", paddingLeft: 20 },
  verticalLine: {
    position: "absolute",
    left: 7,
    top: 6,
    bottom: 0,
    width: 2,
    backgroundColor: colors.border.DEFAULT,
  },
  entry: { flexDirection: "row", marginBottom: 12, alignItems: "flex-start" },
  node: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.DEFAULT,
    marginTop: 6,
    marginRight: 12,
    flexShrink: 0,
  },
  entryContent: { flex: 1 },
  empty: {
    textAlign: "center",
    color: colors.text.muted,
    fontFamily: fonts.regular,
    padding: 20,
  },
});
