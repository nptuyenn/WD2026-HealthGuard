import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  FlaskConical,
  Pill,
  FileText,
  Calendar,
  Trash2,
  Inbox,
} from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import { useAuth } from "@/store/auth";
import {
  listClinicVisits,
  deleteClinicVisit,
  type ClinicVisit,
} from "@/lib/clinic-visits-api";
import { METRIC_META } from "@/lib/health-metrics-api";

function metricLabel(type: string): string {
  return (METRIC_META as any)[type]?.label ?? type;
}

function formatMetricValue(m: ClinicVisit["metrics"][number]): string {
  if (m.metricType === "blood_pressure") return `${m.valueNum}/${m.valueNum2 ?? "?"} ${m.unit}`;
  return `${m.valueNum} ${m.unit}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });
}

function VisitCard({ visit, expanded, onToggle, onDelete }: {
  visit: ClinicVisit;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const hasMetrics = visit.metrics.length > 0;
  const hasLabs = visit.labResults.length > 0;
  const hasRx = visit.prescription.length > 0;
  const hasDiag = !!visit.diagnosis;

  const pills: string[] = [];
  if (hasMetrics) pills.push(`${visit.metrics.length} chỉ số`);
  if (hasLabs) pills.push(`${visit.labResults.length} XN`);
  if (hasRx) pills.push(`${visit.prescription.length} thuốc`);

  return (
    <View style={s.card}>
      <Pressable style={s.cardHead} onPress={onToggle}>
        <View style={s.cardIcon}>
          <Stethoscope size={18} color={colors.brand.DEFAULT} strokeWidth={1.8} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardDate}>{formatDate(visit.visitDate)}</Text>
          <Text style={s.cardTitle}>
            {visit.clinicName || visit.doctorName || "Phiếu khám"}
          </Text>
          {visit.doctorName && visit.clinicName && (
            <Text style={s.cardSub}>{visit.doctorName}</Text>
          )}
          {pills.length > 0 && (
            <View style={s.pillRow}>
              {pills.map((p, i) => (
                <View key={i} style={s.pill}><Text style={s.pillText}>{p}</Text></View>
              ))}
            </View>
          )}
        </View>
        {expanded
          ? <ChevronUp size={20} color={colors.text.muted} strokeWidth={1.8} />
          : <ChevronDown size={20} color={colors.text.muted} strokeWidth={1.8} />}
      </Pressable>

      {expanded && (
        <View style={s.cardBody}>
          {hasDiag && (
            <View style={s.block}>
              <View style={s.blockHead}>
                <FileText size={13} color={colors.text.muted} strokeWidth={1.8} />
                <Text style={s.blockTitle}>Chẩn đoán</Text>
              </View>
              <View style={s.diagBox}>
                <Text style={s.diagText}>{visit.diagnosis}</Text>
              </View>
            </View>
          )}

          {hasMetrics && (
            <View style={s.block}>
              <View style={s.blockHead}>
                <Calendar size={13} color={colors.text.muted} strokeWidth={1.8} />
                <Text style={s.blockTitle}>Chỉ số sinh tồn</Text>
              </View>
              {visit.metrics.map((m, i) => (
                <View key={i} style={s.row}>
                  <Text style={s.rowLabel}>{metricLabel(m.metricType)}</Text>
                  <Text style={s.rowValue}>{formatMetricValue(m)}</Text>
                </View>
              ))}
            </View>
          )}

          {hasLabs && (
            <View style={s.block}>
              <View style={s.blockHead}>
                <FlaskConical size={13} color={colors.text.muted} strokeWidth={1.8} />
                <Text style={s.blockTitle}>Kết quả xét nghiệm</Text>
              </View>
              {visit.labResults.map((lab, i) => (
                <View key={i} style={s.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowLabel}>{lab.name}</Text>
                    {lab.referenceRange && (
                      <Text style={s.rowHint}>Tham chiếu: {lab.referenceRange}</Text>
                    )}
                  </View>
                  <Text style={s.rowValue}>{lab.value} {lab.unit}</Text>
                </View>
              ))}
            </View>
          )}

          {hasRx && (
            <View style={s.block}>
              <View style={s.blockHead}>
                <Pill size={13} color={colors.text.muted} strokeWidth={1.8} />
                <Text style={s.blockTitle}>Đơn thuốc</Text>
              </View>
              {visit.prescription.map((rx, i) => (
                <View key={i} style={s.rxRow}>
                  <Text style={s.rxName}>{rx.name}</Text>
                  {rx.dosage && <Text style={s.rxSub}>Liều: {rx.dosage}</Text>}
                  {rx.instructions && <Text style={s.rxSub}>{rx.instructions}</Text>}
                </View>
              ))}
            </View>
          )}

          <Pressable style={s.deleteBtn} onPress={onDelete}>
            <Trash2 size={14} color={colors.danger.DEFAULT} strokeWidth={1.8} />
            <Text style={s.deleteText}>Xoá phiếu này</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function ClinicVisitsScreen() {
  const router = useRouter();
  const user = useAuth((u) => u.user);
  const profile = user?.profiles?.[0] ?? null;
  const [visits, setVisits] = useState<ClinicVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) { setLoading(false); return; }
    try {
      const items = await listClinicVisits(profile.id);
      setVisits(items);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không tải được lịch sử khám.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const handleDelete = useCallback((visit: ClinicVisit) => {
    Alert.alert(
      "Xoá phiếu khám?",
      `Phiếu ngày ${formatDate(visit.visitDate)} sẽ bị xoá khỏi lịch sử.`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            if (!profile) return;
            try {
              await deleteClinicVisit(profile.id, visit.id);
              setVisits((prev) => prev.filter((v) => v.id !== visit.id));
            } catch (err: any) {
              Alert.alert("Lỗi", err?.message ?? "Không xoá được.");
            }
          },
        },
      ]
    );
  }, [profile?.id]);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.topBar}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.text.DEFAULT} strokeWidth={2} />
        </Pressable>
        <Text style={s.topTitle}>Lịch sử khám</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.brand.DEFAULT} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {visits.length === 0 ? (
            <View style={s.emptyBox}>
              <Inbox size={48} color={colors.text.muted} strokeWidth={1.5} />
              <Text style={s.emptyTitle}>Chưa có phiếu khám nào</Text>
              <Text style={s.emptySub}>
                Quét mã QR từ phiếu khám bác sĩ cấp để lưu vào hồ sơ.
              </Text>
              <Pressable style={s.scanBtn} onPress={() => router.push("/scan")}>
                <Text style={s.scanText}>Quét QR ngay</Text>
              </Pressable>
            </View>
          ) : (
            visits.map((v) => (
              <VisitCard
                key={v.id}
                visit={v}
                expanded={expandedId === v.id}
                onToggle={() => setExpandedId(expandedId === v.id ? null : v.id)}
                onDelete={() => handleDelete(v)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.DEFAULT },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
  },
  topTitle: { fontFamily: fonts.semibold, fontSize: fontSizes.lg, color: colors.text.DEFAULT },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },

  emptyBox: { alignItems: "center", gap: 10, paddingVertical: 60 },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.text.DEFAULT, marginTop: 8 },
  emptySub: { fontFamily: fonts.regular, fontSize: 13, color: colors.text.secondary, textAlign: "center", paddingHorizontal: 32 },
  scanBtn: {
    marginTop: 14,
    backgroundColor: colors.brand.DEFAULT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  scanText: { color: "#fff", fontFamily: fonts.semibold, fontSize: 14 },

  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    ...shadows.card,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardHead: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16 },
  cardIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.brand.light,
    justifyContent: "center", alignItems: "center",
  },
  cardDate: { fontFamily: fonts.mono, fontSize: 11, color: colors.text.muted },
  cardTitle: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.text.DEFAULT, marginTop: 2 },
  cardSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.text.secondary, marginTop: 1 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  pill: {
    backgroundColor: colors.brand.light,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10,
  },
  pillText: { fontSize: 11, color: colors.brand.DEFAULT, fontFamily: fonts.medium },

  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.DEFAULT,
    paddingTop: 12,
  },
  block: { marginBottom: 14 },
  blockHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  blockTitle: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.DEFAULT,
  },
  rowLabel: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.text.DEFAULT },
  rowValue: { fontFamily: fonts.mono, fontSize: 13, color: colors.brand.DEFAULT },
  rowHint: { fontFamily: fonts.regular, fontSize: 11, color: colors.text.muted, marginTop: 2 },

  diagBox: { backgroundColor: colors.brand.light, borderRadius: radius.sm, padding: 10 },
  diagText: { fontFamily: fonts.regular, fontSize: 13, color: colors.text.DEFAULT, lineHeight: 19 },

  rxRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.DEFAULT,
  },
  rxName: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text.DEFAULT },
  rxSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.text.secondary, marginTop: 2 },

  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  deleteText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger.DEFAULT },
});
