import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Pill, Stethoscope, CheckCircle } from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { colors, fonts, fontSizes, radius, shadows } from "@/theme";
import { useActiveProfile } from "@/store/auth";
import { getToday, logDose, type TimelineEvent } from "@/lib/medications-api";
import { listAppointments, type Appointment } from "@/lib/appointments-api";

const MAX_ITEMS = 5;

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

function formatApptTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function MedItem({
  event,
  onToggle,
}: {
  event: TimelineEvent;
  onToggle: (event: TimelineEvent) => void;
}) {
  const isDone = event.status === "taken";
  return (
    <View style={[styles.itemCard, isDone && styles.itemDone]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.brand.light }]}>
        <Pill size={20} color={colors.brand.DEFAULT} strokeWidth={1.8} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, isDone && styles.itemNameDone]} numberOfLines={1}>
          {event.medicationName}
        </Text>
        <Text style={styles.itemDetail} numberOfLines={1}>
          {[event.dosage, event.unit].filter(Boolean).join("")}
          {event.instructions ? ` — ${event.instructions}` : ""}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemTime}>{formatTime(event.scheduledTime)}</Text>
        <Pressable onPress={() => !isDone && onToggle(event)}>
          <CheckCircle
            size={24}
            color={isDone ? colors.success.DEFAULT : colors.text.muted}
            strokeWidth={1.8}
          />
        </Pressable>
      </View>
    </View>
  );
}

function ApptItem({ appt }: { appt: Appointment }) {
  return (
    <View style={styles.itemCard}>
      <View style={[styles.iconCircle, { backgroundColor: colors.purple.light }]}>
        <Stethoscope size={20} color={colors.purple.DEFAULT} strokeWidth={1.8} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{appt.title}</Text>
        <Text style={styles.itemDetail} numberOfLines={1}>
          {[appt.doctorName, appt.location].filter(Boolean).join(" — ")}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemTime}>{formatApptTime(appt.scheduledAt)}</Text>
        <Text style={styles.detailLink}>Sắp tới</Text>
      </View>
    </View>
  );
}

export default function TodayReminders() {
  const profile = useActiveProfile();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) { setLoading(false); return; }
    setLoading(true);
    try {
      const [todayEvents, appointments] = await Promise.all([
        getToday(profile.id),
        listAppointments(profile.id),
      ]);
      setEvents(todayEvents);
      const now = new Date();
      const upcoming = appointments
        .filter((a) => a.status === "upcoming" && new Date(a.scheduledAt) >= now)
        .slice(0, 1);
      setAppts(upcoming);
    } catch {
      setEvents([]);
      setAppts([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleToggle = useCallback(async (event: TimelineEvent) => {
    try {
      await logDose({ scheduleId: event.scheduleId, scheduledAt: event.scheduledAt, status: "taken" });
      setEvents((prev) =>
        prev.map((e) =>
          e.eventKey === event.eventKey ? { ...e, status: "taken" } : e
        )
      );
    } catch {}
  }, []);

  if (loading) {
    return (
      <View>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>NHẮC NHỞ HÔM NAY</Text>
        </View>
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator color={colors.brand.DEFAULT} />
        </View>
      </View>
    );
  }

  const allItems = [...events, ...appts];
  const visible = allItems.slice(0, MAX_ITEMS);
  const hasMore = allItems.length > MAX_ITEMS;

  if (visible.length === 0) {
    return (
      <View>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>NHẮC NHỞ HÔM NAY</Text>
        </View>
        <Text style={styles.emptyText}>Không có nhắc nhở nào hôm nay.</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>NHẮC NHỞ HÔM NAY</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{allItems.length}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {visible.map((item) =>
          "eventKey" in item ? (
            <MedItem key={(item as TimelineEvent).eventKey} event={item as TimelineEvent} onToggle={handleToggle} />
          ) : (
            <ApptItem key={(item as Appointment).id} appt={item as Appointment} />
          )
        )}
      </View>

      {hasMore && <Text style={styles.seeAll}>Xem tất cả →</Text>}
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
  list: { gap: 8 },
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
  itemDone: { opacity: 0.5 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    color: colors.text.DEFAULT,
  },
  itemNameDone: { textDecorationLine: "line-through" },
  itemDetail: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontFamily: fonts.regular,
    marginTop: 1,
  },
  itemRight: { alignItems: "flex-end", gap: 4 },
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
  emptyText: {
    textAlign: "center",
    color: colors.text.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    paddingVertical: 16,
  },
});
