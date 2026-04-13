import { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import BottomSheet from "@gorhom/bottom-sheet";
import { colors, spacing } from "@/theme";
import SegmentedControl from "@/components/med-manager/SegmentedControl";
import MedTimeline from "@/components/med-manager/MedTimeline";
import MedForm from "@/components/med-manager/MedForm";
import CabinetGrid from "@/components/med-manager/CabinetGrid";
import AppointmentCalendar from "@/components/med-manager/AppointmentCalendar";

const SEGMENTS = ["Lịch thuốc", "Tủ thuốc", "Tái khám"];

export default function MedManagerScreen() {
  const [tab, setTab] = useState(0);
  const medFormRef = useRef<BottomSheet>(null);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.segmentWrap}>
          <SegmentedControl
            segments={SEGMENTS}
            selected={tab}
            onSelect={setTab}
          />
        </View>

        {tab === 0 && (
          <Animated.View entering={FadeIn.duration(150)}>
            <MedTimeline onAddPress={() => medFormRef.current?.expand()} />
          </Animated.View>
        )}
        {tab === 1 && (
          <Animated.View entering={FadeIn.duration(150)}>
            <CabinetGrid />
          </Animated.View>
        )}
        {tab === 2 && (
          <Animated.View entering={FadeIn.duration(150)}>
            <AppointmentCalendar />
          </Animated.View>
        )}
      </ScrollView>

      <MedForm ref={medFormRef} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.DEFAULT },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing["4xl"] },
  segmentWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
});
