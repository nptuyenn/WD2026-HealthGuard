import { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import BottomSheet from "@gorhom/bottom-sheet";
import { Plus } from "lucide-react-native";
import { colors, fonts, fontSizes, spacing, radius } from "@/theme";
import ChildSelector from "@/components/child-growth/ChildSelector";
import ChildProfileCard from "@/components/child-growth/ChildProfileCard";
import VaccinationTracker from "@/components/child-growth/VaccinationTracker";
import GrowthChart from "@/components/child-growth/GrowthChart";
import ChildForm from "@/components/child-growth/ChildForm";
import GrowthRecordForm from "@/components/child-growth/GrowthRecordForm";
import SegmentedControl from "@/components/med-manager/SegmentedControl";
import { useAuth } from "@/store/auth";
import {
  createProfile,
  listVaccinations,
  seedTcmr,
  updateVaccination,
  listGrowthRecords,
  createGrowthRecord,
  type Vaccination,
  type GrowthRecord,
  type ProfileInput,
} from "@/lib/child-growth-api";

const SUB_TABS = ["Tiêm chủng", "Tăng trưởng"];

export default function ChildGrowthScreen() {
  const user = useAuth((s) => s.user);
  const refreshUser = useAuth((s) => s.refreshUser);

  const children = (user?.profiles ?? []).filter((p) => p.relationship !== "self");
  const [childId, setChildId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState(0);

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [growth, setGrowth] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const childFormRef = useRef<BottomSheet>(null);
  const growthFormRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (!childId && children.length > 0) setChildId(children[0].id);
  }, [children, childId]);

  const currentChild = children.find((c) => c.id === childId) ?? null;

  const loadData = useCallback(async () => {
    if (!childId) {
      setVaccinations([]);
      setGrowth([]);
      return;
    }
    setLoading(true);
    try {
      const [v, g] = await Promise.all([
        listVaccinations(childId),
        listGrowthRecords(childId),
      ]);
      setVaccinations(v);
      setGrowth(g);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddChild = useCallback(
    async (input: ProfileInput) => {
      const profile = await createProfile(input);
      await refreshUser();
      setChildId(profile.id);
      try {
        await seedTcmr(profile.id);
      } catch {}
      await loadData();
    },
    [refreshUser, loadData]
  );

  const handleSeedTcmr = useCallback(async () => {
    if (!childId) return;
    setSeeding(true);
    try {
      await seedTcmr(childId);
      await loadData();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không tạo được lịch TCMR.");
    } finally {
      setSeeding(false);
    }
  }, [childId, loadData]);

  const handleMarkVax = useCallback(
    async (v: Vaccination) => {
      if (!childId) return;
      try {
        await updateVaccination(childId, v.id, {
          status: "completed",
          administeredAt: new Date().toISOString(),
        });
        await loadData();
      } catch (err: any) {
        Alert.alert("Lỗi", err?.message ?? "Không đánh dấu được.");
      }
    },
    [childId, loadData]
  );

  const handleAddGrowth = useCallback(
    async (input: Parameters<typeof createGrowthRecord>[1]) => {
      if (!childId) return;
      await createGrowthRecord(childId, input);
      await loadData();
    },
    [childId, loadData]
  );

  const latestGrowth = growth.length > 0 ? growth[growth.length - 1] : null;

  if (children.length === 0) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.center}>
          <Text style={s.emptyTitle}>Chưa có bé nào</Text>
          <Text style={s.emptySubtitle}>Thêm bé đầu tiên để theo dõi tiêm chủng và tăng trưởng.</Text>
          <Pressable style={s.addBtn} onPress={() => childFormRef.current?.expand()}>
            <Plus size={18} color="#fff" />
            <Text style={s.addBtnText}>Thêm bé</Text>
          </Pressable>
        </View>
        <ChildForm ref={childFormRef} onSave={handleAddChild} />
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
        <Animated.View entering={FadeInUp.duration(300).delay(0)}>
          <ChildSelector
            profiles={children}
            selectedId={childId}
            onSelect={setChildId}
            onAddPress={() => childFormRef.current?.expand()}
          />
        </Animated.View>

        {currentChild && (
          <Animated.View key={currentChild.id} style={s.section} entering={FadeInUp.duration(250)}>
            <ChildProfileCard profile={currentChild} latestGrowth={latestGrowth} />
          </Animated.View>
        )}

        <Animated.View style={s.segmentWrap} entering={FadeInUp.duration(300).delay(100)}>
          <SegmentedControl segments={SUB_TABS} selected={subTab} onSelect={setSubTab} />
        </Animated.View>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color={colors.brand.DEFAULT} />
          </View>
        ) : (
          <>
            {subTab === 0 && currentChild && (
              <Animated.View entering={FadeIn.duration(150)}>
                <VaccinationTracker
                  vaccinations={vaccinations}
                  seeding={seeding}
                  onSeedTcmr={handleSeedTcmr}
                  onMarkCompleted={handleMarkVax}
                />
              </Animated.View>
            )}
            {subTab === 1 && currentChild && (
              <Animated.View entering={FadeIn.duration(150)}>
                <GrowthChart
                  childName={currentChild.fullName}
                  dob={currentChild.dob}
                  records={growth}
                  onAddPress={() => growthFormRef.current?.expand()}
                />
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>

      <ChildForm ref={childFormRef} onSave={handleAddChild} />
      <GrowthRecordForm ref={growthFormRef} onSave={handleAddGrowth} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.DEFAULT },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing["4xl"] },
  section: { marginVertical: spacing.md },
  segmentWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 8 },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: fontSizes.lg, color: colors.text.DEFAULT },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    textAlign: "center",
    maxWidth: 280,
  },
  addBtn: {
    marginTop: 12,
    backgroundColor: colors.brand.DEFAULT,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addBtnText: { color: "#fff", fontFamily: fonts.semibold, fontSize: fontSizes.base },
});
