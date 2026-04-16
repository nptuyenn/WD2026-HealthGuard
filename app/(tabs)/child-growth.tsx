import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { colors, spacing } from "@/theme";
import ChildSelector from "@/components/child-growth/ChildSelector";
import ChildProfileCard from "@/components/child-growth/ChildProfileCard";
import VaccinationTracker from "@/components/child-growth/VaccinationTracker";
import HealthJournal from "@/components/child-growth/HealthJournal";
import GrowthChart from "@/components/child-growth/GrowthChart";
import SegmentedControl from "@/components/med-manager/SegmentedControl";

const SUB_TABS = ["Tiêm chủng", "Nhật ký", "Tăng trưởng"];

export default function ChildGrowthScreen() {
  const [childId, setChildId] = useState("child1");
  const [subTab, setSubTab] = useState(0);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Child selector */}
        <Animated.View entering={FadeInUp.duration(300).delay(0)}>
          <ChildSelector selectedId={childId} onSelect={setChildId} />
        </Animated.View>

        {/* Profile card — re-mounts on child change to trigger entering */}
        <Animated.View key={childId} style={s.section} entering={FadeInUp.duration(250)}>
          <ChildProfileCard childId={childId} />
        </Animated.View>

        {/* Sub-tabs */}
        <Animated.View style={s.segmentWrap} entering={FadeInUp.duration(300).delay(100)}>
          <SegmentedControl
            segments={SUB_TABS}
            selected={subTab}
            onSelect={setSubTab}
          />
        </Animated.View>

        {subTab === 0 && (
          <Animated.View entering={FadeIn.duration(150)}>
            <VaccinationTracker childId={childId} />
          </Animated.View>
        )}
        {subTab === 1 && (
          <Animated.View entering={FadeIn.duration(150)}>
            <HealthJournal childId={childId} />
          </Animated.View>
        )}
        {subTab === 2 && (
          <Animated.View entering={FadeIn.duration(150)}>
            <GrowthChart childId={childId} />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.DEFAULT },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing["4xl"] },
  section: { marginVertical: spacing.md },
  segmentWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
});
