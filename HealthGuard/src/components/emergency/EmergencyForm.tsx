import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import {
  User,
  AlertTriangle,
  HeartPulse,
  Pill,
  Phone,
  ChevronDown,
  Camera,
  QrCode,
  Download,
  Trash2,
  Plus,
} from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows, spacing } from "@/theme";
import {
  mockProfile,
  mockAllergies,
  mockConditions,
  mockMedications,
  mockEmergencyContacts,
} from "@/lib/mock-data";

// ─── CollapsibleSection ──────────────────────────────────────────────────────

interface CollapsibleProps {
  title: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  badge?: number;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon: Icon, badge, children }: CollapsibleProps) {
  const [open, setOpen] = useState(false);
  const heightRef = useRef(0);
  const animH = useSharedValue(0);
  const chevRot = useSharedValue(0);

  const bodyStyle = useAnimatedStyle(() => ({
    height: animH.value,
    overflow: "hidden" as const,
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevRot.value}deg` }],
  }));

  const toggle = () => {
    const next = !open;
    setOpen(next);
    animH.value = withTiming(next ? heightRef.current : 0, { duration: 250 });
    chevRot.value = withTiming(next ? 180 : 0, { duration: 250 });
  };

  const onGhostLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) heightRef.current = h;
  };

  return (
    <View style={s.section}>
      {/* Header */}
      <Pressable style={s.sectionHeader} onPress={toggle}>
        <View style={s.sectionLeft}>
          <Icon size={20} color={colors.text.secondary} strokeWidth={1.8} />
          <Text style={s.sectionTitle}>{title}</Text>
          {badge != null && (
            <View style={s.sectionBadge}>
              <Text style={s.sectionBadgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Animated.View style={arrowStyle}>
          <ChevronDown size={18} color={colors.text.secondary} strokeWidth={1.8} />
        </Animated.View>
      </Pressable>

      {/* Ghost — off-screen measurement */}
      <View
        style={s.ghost}
        pointerEvents="none"
        onLayout={onGhostLayout}
      >
        <View style={s.sectionContent}>{children}</View>
      </View>

      {/* Animated body */}
      <Animated.View style={bodyStyle}>
        <View style={s.sectionContent}>{children}</View>
      </Animated.View>
    </View>
  );
}

// ─── Reusable input styles ────────────────────────────────────────────────────

function InputField({
  label,
  value,
  placeholder,
  keyboardType,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad";
}) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={s.input}
        defaultValue={value}
        placeholder={placeholder ?? ""}
        placeholderTextColor={colors.text.muted}
        keyboardType={keyboardType ?? "default"}
        fontFamily={fonts.regular}
      />
    </View>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Pressable style={s.selectBox}>
        <Text style={s.selectText}>{value}</Text>
        <ChevronDown size={16} color={colors.text.muted} strokeWidth={1.8} />
      </Pressable>
    </View>
  );
}

// ─── Chip lists (allergies / conditions) ─────────────────────────────────────

function ChipList({
  items,
  bg,
  textColor,
}: {
  items: string[];
  bg: string;
  textColor: string;
}) {
  return (
    <View style={s.chipRow}>
      {items.map((item) => (
        <View key={item} style={[s.chip, { backgroundColor: bg }]}>
          <Text style={[s.chipText, { color: textColor }]}>{item}</Text>
        </View>
      ))}
      <Pressable style={[s.chip, s.chipAdd]}>
        <Plus size={12} color={colors.text.muted} strokeWidth={2} />
        <Text style={s.chipAddText}>Thêm</Text>
      </Pressable>
    </View>
  );
}

// ─── EmergencyForm ────────────────────────────────────────────────────────────

interface Props {
  onShareQR: () => void;
}

export default function EmergencyForm({ onShareQR }: Props) {
  return (
    <View style={s.container}>
      {/* 1. Thông tin cá nhân */}
      <CollapsibleSection title="Thông tin cá nhân" icon={User}>
        <InputField label="Họ và tên" value={mockProfile.fullName} />
        <SelectField label="Ngày sinh" value="15/03/1990" />
        <SelectField
          label="Giới tính"
          value={mockProfile.gender === "male" ? "Nam" : "Nữ"}
        />
        <SelectField label="Nhóm máu" value={mockProfile.bloodType} />
        <InputField
          label="Số BHYT"
          value={mockProfile.insuranceNumber}
          keyboardType="numeric"
        />
        <Pressable style={s.photoBtn}>
          <Camera size={18} color={colors.text.secondary} strokeWidth={1.8} />
          <Text style={s.photoBtnText}>Chọn ảnh đại diện</Text>
        </Pressable>
      </CollapsibleSection>

      {/* 2. Dị ứng */}
      <CollapsibleSection
        title="Dị ứng"
        icon={AlertTriangle}
        badge={mockAllergies.length}
      >
        <ChipList
          items={mockAllergies.map((a) => a.name)}
          bg={colors.danger.light}
          textColor={colors.danger.DEFAULT}
        />
      </CollapsibleSection>

      {/* 3. Bệnh nền */}
      <CollapsibleSection
        title="Bệnh nền"
        icon={HeartPulse}
        badge={mockConditions.length}
      >
        <ChipList
          items={mockConditions.map((c) => c.name)}
          bg={colors.warning.light}
          textColor={colors.warning.DEFAULT}
        />
      </CollapsibleSection>

      {/* 4. Thuốc đang dùng */}
      <CollapsibleSection title="Thuốc đang dùng" icon={Pill}>
        <View style={s.medList}>
          {mockMedications
            .filter((m) => m.isActive)
            .map((med) => (
              <View key={med.id} style={s.medItem}>
                <View style={{ flex: 1 }}>
                  <Text style={s.medName}>
                    {med.name} {med.dosage}
                    {med.unit}
                  </Text>
                  <Text style={s.medDetail}>{med.frequency}</Text>
                </View>
                <Pressable
                  onPress={() => Alert.alert("Xóa", `Xóa ${med.name}?`)}
                >
                  <Trash2
                    size={18}
                    color={colors.danger.DEFAULT}
                    strokeWidth={1.8}
                  />
                </Pressable>
              </View>
            ))}
        </View>
        <Pressable style={s.dashedBtn}>
          <Plus size={16} color={colors.text.muted} strokeWidth={1.8} />
          <Text style={s.dashedBtnText}>Thêm thuốc</Text>
        </Pressable>
      </CollapsibleSection>

      {/* 5. Người liên hệ khẩn cấp */}
      <CollapsibleSection
        title="Người liên hệ khẩn cấp"
        icon={Phone}
        badge={mockEmergencyContacts.length}
      >
        <View style={s.contactList}>
          {mockEmergencyContacts.map((c) => (
            <View key={c.id} style={s.contactItem}>
              <View style={{ flex: 1 }}>
                <View style={s.contactNameRow}>
                  <Text style={s.contactName}>{c.name}</Text>
                  {c.isPrimary && (
                    <View style={s.primaryBadge}>
                      <Text style={s.primaryBadgeText}>Chính</Text>
                    </View>
                  )}
                </View>
                <Text style={s.contactMeta}>
                  {c.relationship} · {c.phone}
                </Text>
              </View>
              <Pressable>
                <Trash2
                  size={18}
                  color={colors.danger.DEFAULT}
                  strokeWidth={1.8}
                />
              </Pressable>
            </View>
          ))}
        </View>
        {mockEmergencyContacts.length < 3 ? (
          <Pressable style={s.dashedBtn}>
            <Plus size={16} color={colors.text.muted} strokeWidth={1.8} />
            <Text style={s.dashedBtnText}>Thêm liên hệ</Text>
          </Pressable>
        ) : (
          <Text style={s.warningText}>Tối đa 3 liên hệ khẩn cấp.</Text>
        )}
      </CollapsibleSection>

      {/* Bottom actions */}
      <View style={s.actions}>
        <Pressable style={s.btnPrimary} onPress={onShareQR}>
          <QrCode size={18} color="#FFFFFF" strokeWidth={1.8} />
          <Text style={s.btnPrimaryText}>Chia sẻ QR</Text>
        </Pressable>
        <Pressable
          style={s.btnOutline}
          onPress={() => Alert.alert("Tính năng sắp ra mắt")}
        >
          <Download size={18} color={colors.brand.DEFAULT} strokeWidth={1.8} />
          <Text style={s.btnOutlineText}>Tải thẻ PDF</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["4xl"],
    gap: 12,
  },

  // CollapsibleSection
  section: {},
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    ...shadows.card,
  },
  sectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },
  sectionBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  sectionBadgeText: {
    fontSize: 11,
    color: colors.brand.DEFAULT,
    fontFamily: fonts.medium,
  },
  sectionContent: {
    backgroundColor: colors.surface.card,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    padding: 16,
    gap: 12,
  },
  ghost: {
    position: "absolute",
    opacity: 0,
    zIndex: -999,
    width: "100%",
  },

  // Form fields
  fieldWrap: { gap: 4 },
  fieldLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
    fontFamily: fonts.regular,
  },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  photoBtnText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontFamily: fonts.medium,
  },

  // Chips
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  chipAdd: {
    backgroundColor: colors.surface.secondary,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chipAddText: {
    fontSize: 13,
    color: colors.text.muted,
    fontFamily: fonts.regular,
  },

  // Med list
  medList: { gap: 8 },
  medItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  medName: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.text.DEFAULT,
  },
  medDetail: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontFamily: fonts.regular,
  },

  // Contacts
  contactList: { gap: 12 },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contactNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  contactName: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.text.DEFAULT,
  },
  primaryBadge: {
    backgroundColor: colors.brand.light,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: colors.brand.DEFAULT,
    fontFamily: fonts.medium,
  },
  contactMeta: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontFamily: fonts.regular,
  },

  // Dashed add button
  dashedBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dashedBtnText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    fontFamily: fonts.medium,
  },
  warningText: {
    fontSize: fontSizes.sm,
    color: colors.warning.DEFAULT,
    fontFamily: fonts.regular,
    textAlign: "center",
  },

  // Actions
  actions: {
    gap: 12,
    marginTop: 24,
  },
  btnPrimary: {
    backgroundColor: colors.brand.DEFAULT,
    borderRadius: radius.md,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: fontSizes.base,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.brand.DEFAULT,
    borderRadius: radius.md,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  btnOutlineText: {
    color: colors.brand.DEFAULT,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.base,
  },
});
