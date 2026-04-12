import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { colors } from "@/theme";
import GreetingHeader from "@/components/dashboard/GreetingHeader";
import EmergencyQuickCard from "@/components/dashboard/EmergencyQuickCard";
import TodayReminders from "@/components/dashboard/TodayReminders";
import HealthSummaryChart from "@/components/dashboard/HealthSummaryChart";
import QuickActions from "@/components/dashboard/QuickActions";

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(300).delay(0)}>
          <GreetingHeader />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(300).delay(100)}>
          <EmergencyQuickCard />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(300).delay(200)}
          style={styles.section}
        >
          <TodayReminders />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(300).delay(300)}
          style={styles.section}
        >
          <HealthSummaryChart />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(300).delay(400)}
          style={styles.section}
        >
          <QuickActions />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.DEFAULT,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.surface.DEFAULT,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
  },
});
