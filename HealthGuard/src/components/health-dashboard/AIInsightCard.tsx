import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";
import { mockAIInsight } from "@/lib/mock-data";

interface Props {
  onAddMetric: () => void;
}

export default function AIInsightCard({ onAddMetric }: Props) {
  const iconOpacity = useSharedValue(1);

  useEffect(() => {
    iconOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({ opacity: iconOpacity.value }));

  return (
    <View style={s.wrapper}>
      <LinearGradient
        colors={[colors.brand[50], "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.gradient}
      >
        {/* Header */}
        <View style={s.header}>
          <Animated.View style={iconStyle}>
            <Sparkles size={20} color={colors.brand.DEFAULT} strokeWidth={1.8} />
          </Animated.View>
          <Text style={s.headerTitle}>Phân tích AI</Text>
          <View style={{ flex: 1 }} />
          <Text style={s.headerDate}>12/04/2026</Text>
        </View>

        {/* Summary */}
        <Text style={s.summary}>{mockAIInsight.summary}</Text>

        {/* Warnings */}
        {mockAIInsight.warnings.length > 0 && (
          <View style={s.warningsBlock}>
            {mockAIInsight.warnings.map((w, i) => (
              <View key={i} style={s.warningRow}>
                <AlertTriangle size={16} color={colors.warning.DEFAULT} strokeWidth={1.8} />
                <Text style={s.warningText}>{w}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        <View style={s.recsBlock}>
          {mockAIInsight.recommendations.map((rec, i) => (
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

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.disclaimer}>{mockAIInsight.disclaimer}</Text>
          <Pressable onPress={() => Alert.alert("Chi tiết phân tích")}>
            <Text style={s.detailLink}>Xem chi tiết →</Text>
          </Pressable>
        </View>

        {/* Add metric CTA */}
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
  gradient: { padding: 20, gap: 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    color: colors.brand.DEFAULT,
    fontSize: fontSizes.base,
  },
  headerDate: { fontSize: 11, color: colors.text.muted, fontFamily: fonts.regular },
  summary: {
    fontSize: 14,
    color: colors.text.DEFAULT,
    lineHeight: 22,
    fontFamily: fonts.regular,
  },
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
  detailLink: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.brand.DEFAULT,
  },
  addBtn: {
    backgroundColor: colors.brand.DEFAULT,
    borderRadius: radius.md,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
});
