import { View, Text, Pressable, StyleSheet } from "react-native";
import { Pill, Syringe, Stethoscope, CheckCircle } from "lucide-react-native";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import {
  mockMedLogs,
  mockMedications,
  mockAppointments,
} from "@/lib/mock-data";

const TODAY = "2026-04-12";
const MAX_ITEMS = 5;

type ReminderType = "medication" | "vaccination" | "appointment";

interface Reminder {
  id: string;
  type: ReminderType;
  name: string;
  detail: string;
  time: string;
  status: "taken" | "pending" | "upcoming";
}

function buildReminders(): Reminder[] {
  const medReminders: Reminder[] = mockMedLogs
    .filter((log) => log.scheduledTime.startsWith(TODAY))
    .map((log) => {
      const med = mockMedications.find((m) => m.id === log.medicationId);
      return {
        id: log.id,
        type: "medication",
        name: med?.name ?? "Thuốc",
        detail: `${med?.dosage}${med?.unit} — ${med?.instructions}`,
        time: log.scheduledTime.split("T")[1],
        status: log.status as "taken" | "pending",
      };
    });

  const apptReminders: Reminder[] = mockAppointments
    .filter((a) => a.status === "upcoming")
    .slice(0, 1)
    .map((a) => ({
      id: a.id,
      type: "appointment",
      name: a.title,
      detail: `${a.doctorName} — ${a.hospital}`,
      time: a.appointmentDate.split("T")[1],
      status: "upcoming" as const,
    }));

  return [...medReminders, ...apptReminders];
}

const ICON_CONFIG: Record<
  ReminderType,
  { icon: typeof Pill; bg: string; color: string }
> = {
  medication: {
    icon: Pill,
    bg: colors.brand.light,
    color: colors.brand.DEFAULT,
  },
  vaccination: {
    icon: Syringe,
    bg: colors.warning.light,
    color: colors.warning.DEFAULT,
  },
  appointment: {
    icon: Stethoscope,
    bg: colors.purple.light,
    color: colors.purple.DEFAULT,
  },
};

function ReminderItem({ item }: { item: Reminder }) {
  const cfg = ICON_CONFIG[item.type];
  const Icon = cfg.icon;
  const isDone = item.status === "taken";

  return (
    <View style={[styles.itemCard, isDone && styles.itemDone]}>
      <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
        <Icon size={20} color={cfg.color} strokeWidth={1.8} />
      </View>

      <View style={styles.itemInfo}>
        <Text
          style={[styles.itemName, isDone && styles.itemNameDone]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={styles.itemDetail} numberOfLines={1}>
          {item.detail}
        </Text>
      </View>

      <View style={styles.itemRight}>
        <Text style={styles.itemTime}>{item.time}</Text>
        {item.type === "medication" ? (
          <Pressable onPress={() => {}}>
            <CheckCircle
              size={24}
              color={
                isDone ? colors.success.DEFAULT : colors.text.muted
              }
              strokeWidth={1.8}
            />
          </Pressable>
        ) : (
          <Text style={styles.detailLink}>Chi tiết</Text>
        )}
      </View>
    </View>
  );
}

export default function TodayReminders() {
  const reminders = buildReminders();
  const visible = reminders.slice(0, MAX_ITEMS);
  const hasMore = reminders.length > MAX_ITEMS;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>NHẮC NHỞ HÔM NAY</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{reminders.length}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {visible.map((item) => (
          <ReminderItem key={item.id} item={item} />
        ))}
      </View>

      {hasMore && (
        <Text style={styles.seeAll}>Xem tất cả →</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: "#FFFFFF",
  },
  list: {
    gap: 8,
  },
  itemCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    ...shadows.card,
  },
  itemDone: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },
  itemNameDone: {
    textDecorationLine: "line-through",
  },
  itemDetail: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontFamily: fonts.regular,
    marginTop: 1,
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  itemTime: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.text.secondary,
  },
  detailLink: {
    fontSize: 12,
    color: colors.brand.DEFAULT,
    fontFamily: fonts.medium,
  },
  seeAll: {
    fontSize: 13,
    color: colors.brand.DEFAULT,
    textAlign: "right",
    marginTop: 8,
    fontFamily: fonts.medium,
  },
});
