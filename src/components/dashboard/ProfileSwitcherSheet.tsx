import { forwardRef, useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Check, Plus, ChevronDown } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";
import { useAuth } from "@/store/auth";
import { createProfile } from "@/lib/profiles-api";
import type { Profile } from "@/store/auth";

const RELATIONSHIPS = [
  { value: "self", label: "Bản thân" },
  { value: "child", label: "Con" },
  { value: "parent", label: "Cha / Mẹ" },
  { value: "spouse", label: "Vợ / Chồng" },
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const AVATAR_COLORS: Record<string, string> = {
  self: colors.brand.DEFAULT,
  child: colors.success.DEFAULT,
  parent: "#F59E0B",
  spouse: colors.purple.DEFAULT,
};

function avatarColor(rel: string | null): string {
  return AVATAR_COLORS[rel ?? "self"] ?? colors.brand.DEFAULT;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.at(-1)?.[0] ?? "")).toUpperCase();
}

function relLabel(rel: string | null): string {
  return RELATIONSHIPS.find((r) => r.value === rel)?.label ?? "Bản thân";
}

interface Props {
  onSwitch?: () => void;
}

const ProfileSwitcherSheet = forwardRef<BottomSheet, Props>(({ onSwitch }, ref) => {
  const user = useAuth((s) => s.user);
  const activeProfileId = useAuth((s) => s.activeProfileId);
  const setActiveProfile = useAuth((s) => s.setActiveProfile);
  const refreshUser = useAuth((s) => s.refreshUser);

  const [mode, setMode] = useState<"list" | "add">("list");
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("child");
  const [bloodType, setBloodType] = useState("");
  const [saving, setSaving] = useState(false);

  const profiles = user?.profiles ?? [];

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  const handleSelect = async (profile: Profile) => {
    await setActiveProfile(profile.id);
    (ref as React.RefObject<BottomSheet>).current?.close();
    onSwitch?.();
  };

  const pickRelationship = () =>
    Alert.alert(
      "Quan hệ",
      undefined,
      RELATIONSHIPS.map((r) => ({
        text: r.label,
        onPress: () => setRelationship(r.value),
      })).concat([{ text: "Hủy", onPress: () => {} }])
    );

  const pickBloodType = () =>
    Alert.alert(
      "Nhóm máu",
      undefined,
      BLOOD_TYPES.map((bt) => ({
        text: bt,
        onPress: () => setBloodType(bt),
      })).concat([{ text: "Bỏ qua", onPress: () => setBloodType("") }])
    );

  const resetForm = () => {
    setFullName("");
    setRelationship("child");
    setBloodType("");
  };

  const handleAdd = async () => {
    if (!fullName.trim()) return Alert.alert("Thiếu tên", "Vui lòng nhập họ và tên.");
    setSaving(true);
    try {
      const profile = await createProfile({
        fullName: fullName.trim(),
        relationship,
        bloodType: bloodType || null,
      });
      await refreshUser();
      await setActiveProfile(profile.id);
      resetForm();
      setMode("list");
      (ref as React.RefObject<BottomSheet>).current?.close();
      onSwitch?.();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không tạo được hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={mode === "add" ? ["70%"] : ["50%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={s.sheetBg}
      handleIndicatorStyle={s.handle}
      onChange={(idx) => { if (idx < 0) { setMode("list"); resetForm(); } }}
    >
      <BottomSheetScrollView contentContainerStyle={s.content}>
        {mode === "list" ? (
          <>
            <Text style={s.title}>Chọn hồ sơ</Text>

            {profiles.map((p) => {
              const active = p.id === activeProfileId;
              const color = avatarColor(p.relationship);
              return (
                <Pressable
                  key={p.id}
                  style={[s.profileRow, active && s.profileRowActive]}
                  onPress={() => handleSelect(p)}
                >
                  <View style={[s.avatar, { backgroundColor: color + "22" }]}>
                    <Text style={[s.avatarText, { color }]}>{initials(p.fullName)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.profileName}>{p.fullName}</Text>
                    <View style={s.tagRow}>
                      <View style={[s.relTag, { backgroundColor: color + "22" }]}>
                        <Text style={[s.relTagText, { color }]}>{relLabel(p.relationship)}</Text>
                      </View>
                      {p.bloodType && (
                        <View style={s.bloodTag}>
                          <Text style={s.bloodTagText}>{p.bloodType}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {active && <Check size={20} color={colors.brand.DEFAULT} strokeWidth={2.5} />}
                </Pressable>
              );
            })}

            <Pressable style={s.addRow} onPress={() => setMode("add")}>
              <View style={s.addIcon}>
                <Plus size={18} color={colors.brand.DEFAULT} strokeWidth={2} />
              </View>
              <Text style={s.addText}>Thêm thành viên</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={s.formHeader}>
              <Pressable onPress={() => { setMode("list"); resetForm(); }}>
                <Text style={s.backLink}>← Quay lại</Text>
              </Pressable>
              <Text style={s.title}>Thêm thành viên</Text>
            </View>

            <View style={s.field}>
              <Text style={s.label}>Họ và tên *</Text>
              <TextInput
                style={s.input}
                placeholder="Nguyễn Văn A"
                placeholderTextColor={colors.text.muted}
                value={fullName}
                onChangeText={setFullName}
                editable={!saving}
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>Quan hệ</Text>
              <Pressable style={s.selectBox} onPress={pickRelationship}>
                <Text style={s.selectText}>
                  {RELATIONSHIPS.find((r) => r.value === relationship)?.label}
                </Text>
                <ChevronDown size={16} color={colors.text.muted} strokeWidth={1.8} />
              </Pressable>
            </View>

            <View style={s.field}>
              <Text style={s.label}>Nhóm máu <Text style={s.optional}>(tùy chọn)</Text></Text>
              <Pressable style={s.selectBox} onPress={pickBloodType}>
                <Text style={[s.selectText, !bloodType && { color: colors.text.muted }]}>
                  {bloodType || "Chọn nhóm máu"}
                </Text>
                <ChevronDown size={16} color={colors.text.muted} strokeWidth={1.8} />
              </Pressable>
            </View>

            <View style={s.btnRow}>
              <Pressable
                style={s.cancelBtn}
                onPress={() => { setMode("list"); resetForm(); }}
                disabled={saving}
              >
                <Text style={s.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[s.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleAdd}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.saveText}>Tạo hồ sơ</Text>}
              </Pressable>
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

ProfileSwitcherSheet.displayName = "ProfileSwitcherSheet";
export default ProfileSwitcherSheet;

const s = StyleSheet.create({
  sheetBg: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: { backgroundColor: colors.border.DEFAULT, width: 40 },
  content: { padding: 24, paddingBottom: 40 },

  title: { fontFamily: fonts.semibold, fontSize: fontSizes.lg, color: colors.text.DEFAULT, marginBottom: 16 },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 8,
  },
  profileRowActive: { backgroundColor: colors.brand.light },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontFamily: fonts.semibold, fontSize: 15 },
  profileName: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.text.DEFAULT },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  relTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  relTagText: { fontSize: 11, fontFamily: fonts.medium },
  bloodTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: colors.danger.light },
  bloodTagText: { fontSize: 11, fontFamily: fonts.medium, color: colors.danger.DEFAULT },

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border.DEFAULT,
    borderStyle: "dashed",
    marginTop: 4,
  },
  addIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.brand.light,
    justifyContent: "center", alignItems: "center",
  },
  addText: { fontFamily: fonts.medium, fontSize: fontSizes.base, color: colors.brand.DEFAULT },

  formHeader: { marginBottom: 16 },
  backLink: { fontFamily: fonts.medium, fontSize: 13, color: colors.text.muted, marginBottom: 8 },

  field: { marginBottom: 14 },
  label: { fontFamily: fonts.medium, fontSize: 12, color: colors.text.secondary, marginBottom: 4 },
  optional: { fontFamily: fonts.regular, color: colors.text.muted },
  input: {
    borderWidth: 1, borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm, padding: 12,
    fontSize: fontSizes.base, color: colors.text.DEFAULT,
    fontFamily: fonts.regular,
  },
  selectBox: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1, borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm, padding: 12,
  },
  selectText: { fontSize: fontSizes.base, color: colors.text.DEFAULT, fontFamily: fonts.regular },

  btnRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: colors.border.DEFAULT,
    borderRadius: radius.md, padding: 14, alignItems: "center",
  },
  cancelText: { fontFamily: fonts.medium, color: colors.text.secondary, fontSize: fontSizes.base },
  saveBtn: {
    flex: 2, backgroundColor: colors.brand.DEFAULT,
    borderRadius: radius.md, padding: 14, alignItems: "center",
  },
  saveText: { fontFamily: fonts.semibold, color: "#fff", fontSize: fontSizes.base },
});
