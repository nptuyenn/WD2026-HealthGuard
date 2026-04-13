import { useRef } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import BottomSheet from "@gorhom/bottom-sheet";
import { colors, spacing } from "@/theme";
import MetricCardRow from "@/components/health-dashboard/MetricCardRow";
import MainChart from "@/components/health-dashboard/MainChart";
import AIInsightCard from "@/components/health-dashboard/AIInsightCard";
import MetricForm from "@/components/health-dashboard/MetricForm";

export default function HealthDashboardScreen() {
  const metricFormRef = useRef<BottomSheet>(null);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={s.section} entering={FadeInUp.duration(300).delay(0)}>
          <MetricCardRow />
        </Animated.View>

        <Animated.View style={s.section} entering={FadeInUp.duration(300).delay(150)}>
          <MainChart />
        </Animated.View>

        <Animated.View style={s.section} entering={FadeInUp.duration(300).delay(300)}>
          <AIInsightCard onAddMetric={() => metricFormRef.current?.expand()} />
        </Animated.View>
      </ScrollView>

      <MetricForm ref={metricFormRef} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.DEFAULT },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing["4xl"] },
  section: { marginVertical: spacing.sm },
});
