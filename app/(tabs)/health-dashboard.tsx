import { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import BottomSheet from "@gorhom/bottom-sheet";
import { colors, fonts, fontSizes, spacing } from "@/theme";
import MetricCardRow from "@/components/health-dashboard/MetricCardRow";
import MainChart from "@/components/health-dashboard/MainChart";
import AIInsightCard from "@/components/health-dashboard/AIInsightCard";
import MetricForm from "@/components/health-dashboard/MetricForm";
import { useActiveProfile } from "@/store/auth";
import {
  getMetricSummary,
  createMetric,
  analyzeMetrics,
  type MetricSummary,
  type AIInsight,
  type MetricInput,
} from "@/lib/health-metrics-api";

export default function HealthDashboardScreen() {
  const profile = useActiveProfile();
  const metricFormRef = useRef<BottomSheet>(null);

  const [summary, setSummary] = useState<MetricSummary | null>(null);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!profile) return;
    setLoadingSummary(true);
    try {
      const s = await getMetricSummary(profile.id);
      setSummary(s);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không tải được dữ liệu.");
    } finally {
      setLoadingSummary(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [loadSummary])
  );

  const handleSaveMetric = useCallback(
    async (input: MetricInput) => {
      if (!profile) return;
      await createMetric(profile.id, input);
      await loadSummary();
    },
    [profile?.id, loadSummary]
  );

  const handleAnalyze = useCallback(async () => {
    if (!profile) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const r = await analyzeMetrics(profile.id);
      setInsight(r);
    } catch (err: any) {
      setAnalyzeError(err?.message ?? "Không phân tích được.");
    } finally {
      setAnalyzing(false);
    }
  }, [profile?.id]);

  if (!profile) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.center}>
          <Text style={s.muted}>Chưa có hồ sơ sức khỏe.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {loadingSummary ? (
          <View style={s.center}>
            <ActivityIndicator color={colors.brand.DEFAULT} />
          </View>
        ) : (
          <>
            <Animated.View style={s.section} entering={FadeInUp.duration(300).delay(0)}>
              <MetricCardRow summary={summary} />
            </Animated.View>

            <Animated.View style={s.section} entering={FadeInUp.duration(300).delay(150)}>
              <MainChart summary={summary} />
            </Animated.View>

            <Animated.View style={s.section} entering={FadeInUp.duration(300).delay(300)}>
              <AIInsightCard
                insight={insight}
                loading={analyzing}
                error={analyzeError}
                onAnalyze={handleAnalyze}
                onAddMetric={() => metricFormRef.current?.expand()}
              />
            </Animated.View>
          </>
        )}
      </ScrollView>

      <MetricForm ref={metricFormRef} onSave={handleSaveMetric} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.DEFAULT },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing["4xl"] },
  section: { marginVertical: spacing.sm },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  muted: { fontFamily: fonts.regular, fontSize: fontSizes.base, color: colors.text.secondary },
});
