import { forwardRef, useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import {
  Stethoscope,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FlaskConical,
  Pill,
  FileText,
} from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";
import { useActiveProfile } from "@/store/auth";
import { METRIC_META } from "@/lib/health-metrics-api";
import { importVisitFromExam } from "@/lib/clinic-visits-api";
import type { ExamResult } from "@/lib/exam-api";

interface Props {
  exam: ExamResult | null;
  onDone: () => void;
}

function metricLabel(type: string): string {
  return (METRIC_META as any)[type]?.label ?? type;
}

function formatMetricValue(m: { metricType: string; valueNum: number; valueNum2?: number | null; unit: string }): string {
  if (m.metricType === "blood_pressure") return `${m.valueNum}/${m.valueNum2 ?? "?"} ${m.unit}`;
  return `${m.valueNum} ${m.unit}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });
}

const ExamImportSheet = forwardRef<BottomSheet, Props>(({ exam, onDone }, ref) => {
  const profile = useActiveProfile();
  const [saving, setSaving] = useState(false);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const handleImport = useCallback(async () => {
    if (!profile || !exam) return;
    setSaving(true);
    try {
      const result = await importVisitFromExam(profile.id, exam.token);
      (ref as React.RefObject<BottomSheet>).current?.close();
      onDone();
      const parts: string[] = [];
      if (result.imported.metrics) parts.push(`${result.imported.metrics} chỉ số`);
      if (result.imported.labResults) parts.push(`${result.imported.labResults} kết quả XN`);
      if (result.imported.prescription) parts.push(`${result.imported.prescription} thuốc kê`);
      if (result.imported.appointment) parts.push(`1 lịch tái khám`);
      Alert.alert("Nhập thành công", `Đã lưu vào hồ sơ: ${parts.join(", ") || "phiếu khám"}.`);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không nhập được dữ liệu.");
    } finally {
      setSaving(false);
    }
  }, [profile, exam, onDone]);

  const hasAnything = !!exam && (
    exam.metrics.length > 0 ||
    exam.labResults.length > 0 ||
    exam.prescription.length > 0 ||
    !!exam.appointment ||
    !!exam.diagnosis
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["85%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={s.sheetBg}
      handleIndicatorStyle={s.handle}
    >
      <BottomSheetScrollView contentContainerStyle={s.content}>
        {!exam ? (
          <View style={s.center}>
            <ActivityIndicator color={colors.brand.DEFAULT} />
          </View>
        ) : (
          <>
            <View style={s.header}>
              <View style={s.iconWrap}>
                <Stethoscope size={22} color={colors.brand.DEFAULT} strokeWidth={1.8} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>Kết quả khám</Text>
                <Text style={s.subtitle}>
                  {[exam.doctorName, exam.clinicName].filter(Boolean).join(" · ") || "Phiếu khám"}
                </Text>
                <Text style={s.dateText}>{formatDate(exam.examDate)}</Text>
              </View>
            </View>

            {exam.diagnosis && (
              <View style={s.section}>
                <View style={s.sectionHead}>
                  <FileText size={14} color={colors.text.muted} strokeWidth={1.8} />
                  <Text style={s.sectionTitle}>Chẩn đoán</Text>
                </View>
                <View style={s.diagBox}>
                  <Text style={s.diagText}>{exam.diagnosis}</Text>
                </View>
              </View>
            )}

            {exam.metrics.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHead}>
                  <CheckCircle2 size={14} color={colors.text.muted} strokeWidth={1.8} />
                  <Text style={s.sectionTitle}>Chỉ số sinh tồn ({exam.metrics.length})</Text>
                </View>
                {exam.metrics.map((m, i) => (
                  <View key={i} style={s.row}>
                    <Text style={s.rowLabel}>{metricLabel(m.metricType)}</Text>
                    <Text style={s.rowValue}>{formatMetricValue(m)}</Text>
                  </View>
                ))}
              </View>
            )}

            {exam.labResults.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHead}>
                  <FlaskConical size={14} color={colors.text.muted} strokeWidth={1.8} />
                  <Text style={s.sectionTitle}>Kết quả xét nghiệm ({exam.labResults.length})</Text>
                </View>
                {exam.labResults.map((lab, i) => (
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

            {exam.prescription.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHead}>
                  <Pill size={14} color={colors.text.muted} strokeWidth={1.8} />
                  <Text style={s.sectionTitle}>Đơn thuốc ({exam.prescription.length})</Text>
                </View>
                {exam.prescription.map((rx, i) => (
                  <View key={i} style={s.rxRow}>
                    <Text style={s.rxName}>{rx.name}</Text>
                    {rx.dosage && <Text style={s.rxSub}>Liều: {rx.dosage}</Text>}
                    {rx.instructions && <Text style={s.rxSub}>{rx.instructions}</Text>}
                  </View>
                ))}
              </View>
            )}

            {exam.appointment && (
              <View style={s.section}>
                <View style={s.sectionHead}>
                  <Calendar size={14} color={colors.text.muted} strokeWidth={1.8} />
                  <Text style={s.sectionTitle}>Lịch tái khám</Text>
                </View>
                <View style={s.apptCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.apptTitle}>{exam.appointment.title}</Text>
                    <Text style={s.apptSub}>{formatDate(exam.appointment.scheduledAt)}</Text>
                    {exam.appointment.location && (
                      <Text style={s.apptSub}>{exam.appointment.location}</Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {!hasAnything && (
              <View style={s.emptyWrap}>
                <AlertTriangle size={20} color={colors.warning.DEFAULT} />
                <Text style={s.emptyText}>Phiếu này không có dữ liệu để nhập.</Text>
              </View>
            )}

            <View style={s.btnRow}>
              <Pressable
                style={s.cancelBtn}
                onPress={() => (ref as React.RefObject<BottomSheet>).current?.close()}
                disabled={saving}
              >
                <Text style={s.cancelText}>Đóng</Text>
              </Pressable>
              {hasAnything && (
                <Pressable
                  style={[s.importBtn, saving && { opacity: 0.6 }]}
                  onPress={handleImport}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.importText}>Lưu vào hồ sơ</Text>
                  )}
                </Pressable>
              )}
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

ExamImportSheet.displayName = "ExamImportSheet";
export default ExamImportSheet;

const s = StyleSheet.create({
  sheetBg: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: { backgroundColor: colors.border.DEFAULT, width: 40 },
  content: { padding: 24, paddingBottom: 40 },
  center: { padding: 48, alignItems: "center" },

  header: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 20 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontFamily: fonts.semibold, fontSize: fontSizes.lg, color: colors.text.DEFAULT },
  subtitle: { fontSize: 13, color: colors.text.secondary, fontFamily: fonts.regular, marginTop: 2 },
  dateText: { fontSize: 11, color: colors.text.muted, fontFamily: fonts.regular, marginTop: 2 },

  section: { marginBottom: 18 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.DEFAULT,
  },
  rowLabel: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text.DEFAULT },
  rowValue: { fontFamily: fonts.mono, fontSize: 14, color: colors.brand.DEFAULT },
  rowHint: { fontFamily: fonts.regular, fontSize: 11, color: colors.text.muted, marginTop: 2 },

  diagBox: {
    backgroundColor: colors.brand.light,
    borderRadius: radius.md,
    padding: 12,
  },
  diagText: { fontFamily: fonts.regular, fontSize: 13, color: colors.text.DEFAULT, lineHeight: 19 },

  rxRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.DEFAULT,
  },
  rxName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text.DEFAULT },
  rxSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.text.secondary, marginTop: 2 },

  apptCard: {
    padding: 14,
    backgroundColor: colors.purple.light,
    borderRadius: radius.md,
  },
  apptTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text.DEFAULT },
  apptSub: { fontSize: 12, color: colors.text.secondary, fontFamily: fonts.regular, marginTop: 2 },

  emptyWrap: { alignItems: "center", gap: 8, paddingVertical: 24 },
  emptyText: { color: colors.text.muted, fontFamily: fonts.regular, fontSize: 13 },

  btnRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
  },
  cancelText: { fontFamily: fonts.medium, color: colors.text.secondary, fontSize: fontSizes.base },
  importBtn: {
    flex: 2,
    backgroundColor: colors.brand.DEFAULT,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
  },
  importText: { fontFamily: fonts.semibold, color: "#fff", fontSize: fontSizes.base },
});
