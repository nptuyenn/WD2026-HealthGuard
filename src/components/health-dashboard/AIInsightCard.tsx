import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Sparkles, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";
import type { AIInsight } from "@/lib/health-metrics-api";

interface Props {
  insight: AIInsight | null;
  loading: boolean;
  error: string | null;
  onAnalyze: () => void;
  onAddMetric: () => void;
}

export default function AIInsightCard({
  insight,
  loading,
  error,
  onAnalyze,
  onAddMetric,
}: Props) {
  const iconOpacity = useSharedValue(1);

  useEffect(() => {
    iconOpacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({ opacity: iconOpacity.value }));

  const updatedDate = insight
    ? new Date(insight.updatedAt).toLocaleDateString("vi-VN")
    : null;

  return (
    <View style={s.wrapper}>
      <LinearGradient
        colors={[colors.brand[50], "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.gradient}
      >
        <View style={s.header}>
          <Animated.View style={iconStyle}>
            <Sparkles size={20} color={colors.brand.DEFAULT} strokeWidth={1.8} />
          </Animated.View>
          <Text style={s.headerTitle}>Phân tích AI (Gemini)</Text>
          <View style={{ flex: 1 }} />
          {updatedDate && <Text style={s.headerDate}>{updatedDate}</Text>}
        </View>

        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator color={colors.brand.DEFAULT} />
            <Text style={s.loadingText}>Đang phân tích dữ liệu của bạn...</Text>
          </View>
        ) : error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
            <Pressable style={s.retryBtn} onPress={onAnalyze}>
              <RefreshCw size={14} color={colors.brand.DEFAULT} />
              <Text style={s.retryText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : !insight ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>
              Ghi ít nhất một chỉ số rồi nhấn bên dưới để nhận phân tích bằng Gemini.
            </Text>
            <Pressable style={s.analyzeBtn} onPress={onAnalyze}>
              <Sparkles size={14} color="#fff" />
              <Text style={s.analyzeText}>Chạy phân tích</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={s.summary}>{insight.summary}</Text>

            {insight.warnings.length > 0 && (
              <View style={s.warningsBlock}>
                {insight.warnings.map((w, i) => (
                  <View key={i} style={s.warningRow}>
                    <AlertTriangle size={16} color={colors.warning.DEFAULT} strokeWidth={1.8} />
                    <Text style={s.warningText}>{w}</Text>
                  </View>
                ))}
              </View>
            )}

            {insight.recommendations.length > 0 && (
              <View style={s.recsBlock}>
                {insight.recommendations.map((rec, i) => (
                  <View key={i} style={s.recRow}>
                    <CheckCircle2
                      size={16}
                      color={colors.success.DEFAULT}
                      strokeWidth={1.8}
                      style={{ marginTop: 2 }}
                    />
                    <Text style={s.recText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={s.footer}>
              <Text style={s.disclaimer}>{insight.disclaimer}</Text>
              <Pressable onPress={onAnalyze} style={s.refreshChip}>
                <RefreshCw size={12} color={colors.brand.DEFAULT} />
                <Text style={s.detailLink}>Làm mới</Text>
              </Pressable>
            </View>
          </>
        )}

        <Pressable style={s.addBtn} onPress={onAddMetric}>
          <Text style={s.addBtnText}>+ Ghi chỉ số mới</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.DEFAULT,
  },
  gradient: { padding: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  headerTitle: { fontFamily: fonts.semibold, color: colors.brand.DEFAULT, fontSize: fontSizes.base },
  headerDate: { fontSize: 11, color: colors.text.muted, fontFamily: fonts.regular },

  loadingBox: { paddingVertical: 24, alignItems: "center", gap: 8 },
  loadingText: { color: colors.text.secondary, fontFamily: fonts.regular, fontSize: 13 },

  errorBox: { paddingVertical: 16, alignItems: "center", gap: 8 },
  errorText: { color: colors.danger.DEFAULT, fontFamily: fonts.regular, fontSize: 13, textAlign: "center" },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.brand.DEFAULT,
  },
  retryText: { color: colors.brand.DEFAULT, fontFamily: fonts.medium, fontSize: 12 },

  emptyBox: { paddingVertical: 16, alignItems: "center", gap: 12 },
  emptyText: {
    textAlign: "center",
    color: colors.text.secondary,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brand.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  analyzeText: { color: "#fff", fontFamily: fonts.semibold, fontSize: 13 },

  summary: { fontSize: 14, color: colors.text.DEFAULT, lineHeight: 22, fontFamily: fonts.regular },
  warningsBlock: { marginTop: 12, gap: 6 },
  warningRow: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(245,158,11,0.1)",
    padding: 10,
    borderRadius: radius.sm,
    alignItems: "flex-start",
  },
  warningText: { fontSize: 13, color: colors.warning.DEFAULT, fontFamily: fonts.regular, flex: 1 },
  recsBlock: { marginTop: 12, gap: 6 },
  recRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  recText: { fontSize: 13, color: colors.text.secondary, fontFamily: fonts.regular, flex: 1 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  disclaimer: {
    fontSize: 10,
    color: colors.text.muted,
    fontStyle: "italic",
    flex: 1,
    marginRight: 8,
    fontFamily: fonts.regular,
  },
  refreshChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailLink: { fontSize: 12, fontFamily: fonts.medium, color: colors.brand.DEFAULT },
  addBtn: {
    backgroundColor: colors.brand.DEFAULT,
    borderRadius: radius.md,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  addBtnText: { color: "#FFFFFF", fontFamily: fonts.semibold, fontSize: 15 },
});
