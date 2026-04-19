import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { X, Plus, QrCode, Save } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows, spacing } from "@/theme";
import type { EmergencyContact } from "@/lib/emergency-api";

type Props = {
  bloodType: string | null;
  allergies: string[];
  conditions: string[];
  contacts: EmergencyContact[];
  notes: string | null;
  saving: boolean;
  hasToken: boolean;
  onSave: (data: {
    bloodType: string | null;
    allergies: string[];
    conditions: string[];
    contacts: EmergencyContact[];
    notes: string | null;
  }) => void;
  onShareQR: () => void;
};

export default function EmergencyForm(props: Props) {
  const [bloodType, setBloodType] = useState(props.bloodType ?? "");
  const [allergies, setAllergies] = useState(props.allergies);
  const [conditions, setConditions] = useState(props.conditions);
  const [contacts, setContacts] = useState<EmergencyContact[]>(props.contacts);
  const [notes, setNotes] = useState(props.notes ?? "");
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");

  const addAllergy = () => {
    const v = allergyInput.trim();
    if (!v) return;
    if (allergies.includes(v)) return;
    setAllergies([...allergies, v]);
    setAllergyInput("");
  };
  const removeAllergy = (v: string) => setAllergies(allergies.filter((a) => a !== v));

  const addCondition = () => {
    const v = conditionInput.trim();
    if (!v) return;
    if (conditions.includes(v)) return;
    setConditions([...conditions, v]);
    setConditionInput("");
  };
  const removeCondition = (v: string) => setConditions(conditions.filter((c) => c !== v));

  const addContact = () => {
    if (contacts.length >= 3) return;
    setContacts([
      ...contacts,
      { name: "", phone: "", relationship: "", isPrimary: contacts.length === 0 },
    ]);
  };
  const updateContact = (i: number, patch: Partial<EmergencyContact>) => {
    setContacts(contacts.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };
  const removeContact = (i: number) =>
    setContacts(contacts.filter((_, idx) => idx !== i));
  const setPrimary = (i: number) =>
    setContacts(contacts.map((c, idx) => ({ ...c, isPrimary: idx === i })));

  const handleSave = () => {
    for (const c of contacts) {
      if (!c.name.trim() || !c.phone.trim()) {
        Alert.alert("Thiếu thông tin", "Tên và số điện thoại liên hệ không được để trống.");
        return;
      }
    }
    props.onSave({
      bloodType: bloodType.trim() || null,
      allergies,
      conditions,
      contacts,
      notes: notes.trim() || null,
    });
  };

  return (
    <View style={s.container}>
      <Section title="Nhóm máu">
        <TextInput
          style={s.input}
          value={bloodType}
          onChangeText={setBloodType}
          placeholder="VD: A+, B-, O+"
          placeholderTextColor={colors.text.muted}
          autoCapitalize="characters"
          maxLength={5}
        />
      </Section>

      <Section title="Dị ứng" count={allergies.length}>
        <View style={s.chipRow}>
          {allergies.map((a) => (
            <View key={a} style={[s.chip, { backgroundColor: colors.danger.light }]}>
              <Text style={[s.chipText, { color: colors.danger.DEFAULT }]}>{a}</Text>
              <Pressable onPress={() => removeAllergy(a)} hitSlop={8}>
                <X size={14} color={colors.danger.DEFAULT} />
              </Pressable>
            </View>
          ))}
        </View>
        <View style={s.addRow}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            value={allergyInput}
            onChangeText={setAllergyInput}
            placeholder="VD: Penicillin"
            placeholderTextColor={colors.text.muted}
            onSubmitEditing={addAllergy}
            returnKeyType="done"
          />
          <Pressable style={s.addBtn} onPress={addAllergy}>
            <Plus size={18} color="#fff" />
          </Pressable>
        </View>
      </Section>

      <Section title="Bệnh nền" count={conditions.length}>
        <View style={s.chipRow}>
          {conditions.map((c) => (
            <View key={c} style={[s.chip, { backgroundColor: colors.warning.light }]}>
              <Text style={[s.chipText, { color: colors.warning.DEFAULT }]}>{c}</Text>
              <Pressable onPress={() => removeCondition(c)} hitSlop={8}>
                <X size={14} color={colors.warning.DEFAULT} />
              </Pressable>
            </View>
          ))}
        </View>
        <View style={s.addRow}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            value={conditionInput}
            onChangeText={setConditionInput}
            placeholder="VD: Hen suyễn"
            placeholderTextColor={colors.text.muted}
            onSubmitEditing={addCondition}
            returnKeyType="done"
          />
          <Pressable style={s.addBtn} onPress={addCondition}>
            <Plus size={18} color="#fff" />
          </Pressable>
        </View>
      </Section>

      <Section title={`Liên hệ khẩn cấp (tối đa 3)`} count={contacts.length}>
        {contacts.map((c, i) => (
          <View key={i} style={s.contactCard}>
            <View style={s.contactHeader}>
              <Pressable
                style={[s.primaryTag, c.isPrimary && s.primaryTagActive]}
                onPress={() => setPrimary(i)}
              >
                <Text
                  style={[
                    s.primaryTagText,
                    c.isPrimary && s.primaryTagTextActive,
                  ]}
                >
                  {c.isPrimary ? "★ Chính" : "Đặt làm chính"}
                </Text>
              </Pressable>
              <Pressable onPress={() => removeContact(i)} hitSlop={8}>
                <X size={16} color={colors.danger.DEFAULT} />
              </Pressable>
            </View>
            <TextInput
              style={s.input}
              value={c.name}
              onChangeText={(v) => updateContact(i, { name: v })}
              placeholder="Họ và tên"
              placeholderTextColor={colors.text.muted}
            />
            <TextInput
              style={s.input}
              value={c.phone}
              onChangeText={(v) => updateContact(i, { phone: v })}
              placeholder="Số điện thoại"
              placeholderTextColor={colors.text.muted}
              keyboardType="phone-pad"
            />
            <TextInput
              style={s.input}
              value={c.relationship ?? ""}
              onChangeText={(v) => updateContact(i, { relationship: v })}
              placeholder="Quan hệ (VD: Chồng, Vợ, Con)"
              placeholderTextColor={colors.text.muted}
            />
          </View>
        ))}
        {contacts.length < 3 && (
          <Pressable style={s.dashedBtn} onPress={addContact}>
            <Plus size={16} color={colors.text.muted} />
            <Text style={s.dashedBtnText}>Thêm liên hệ</Text>
          </Pressable>
        )}
      </Section>

      <Section title="Ghi chú">
        <TextInput
          style={[s.input, { minHeight: 80, textAlignVertical: "top" }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="VD: Dùng inhaler màu xanh khi lên cơn hen"
          placeholderTextColor={colors.text.muted}
          multiline
          maxLength={500}
        />
      </Section>

      <View style={s.actions}>
        <Pressable
          style={[s.btnPrimary, props.saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={props.saving}
        >
          {props.saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save size={18} color="#fff" />
              <Text style={s.btnPrimaryText}>Lưu thẻ khẩn cấp</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[s.btnOutline, !props.hasToken && { opacity: 0.5 }]}
          onPress={props.onShareQR}
          disabled={!props.hasToken}
        >
          <QrCode size={18} color={colors.brand.DEFAULT} />
          <Text style={s.btnOutlineText}>Chia sẻ QR</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{title}</Text>
        {count != null && (
          <View style={s.sectionBadge}>
            <Text style={s.sectionBadgeText}>{count}</Text>
          </View>
        )}
      </View>
      <View style={s.sectionBody}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingBottom: spacing["4xl"], gap: 12 },

  section: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
    flex: 1,
  },
  sectionBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionBadgeText: {
    fontSize: 11,
    color: colors.brand.DEFAULT,
    fontFamily: fonts.medium,
  },
  sectionBody: { padding: 16, paddingTop: 4, gap: 12 },

  input: {
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
    backgroundColor: "#fff",
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  chipText: { fontSize: 13, fontFamily: fonts.medium },

  addRow: { flexDirection: "row", gap: 8 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.brand.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
  },

  contactCard: {
    gap: 8,
    padding: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.surface.secondary,
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  primaryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: "#fff",
  },
  primaryTagActive: {
    backgroundColor: colors.brand.light,
    borderColor: colors.brand.DEFAULT,
  },
  primaryTagText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
  },
  primaryTagTextActive: { color: colors.brand.DEFAULT },

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

  actions: { gap: 12, marginTop: 12, paddingHorizontal: spacing.lg },
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
