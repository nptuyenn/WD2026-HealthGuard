import { forwardRef, useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Pill, Calendar, AlertTriangle } from "lucide-react-native";
import { colors, fonts, fontSizes } from "@/theme";
import { useAuth } from "@/store/auth";
import { getToday, type TimelineEvent } from "@/lib/medications-api";
import { listAppointments, type Appointment } from "@/lib/appointments-api";

type NotifItem =
  | { kind: "med_pending"; event: TimelineEvent }
  | { kind: "med_missed"; event: TimelineEvent }
  | { kind: "appointment"; appt: Appointment };

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function timeUntil(iso: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút nữa`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ nữa`;
  return `${Math.floor(diff / 86400)} ngày nữa`;
}

const NotificationPanel = forwardRef<BottomSheet, object>((_props, ref) => {
  const user = useAuth((s) => s.user);
  const profile = user?.profiles?.[0] ?? null;
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [todayEvents, appointments] = await Promise.all([
        getToday(profile.id),
        listAppointments(profile.id),
      ]);

      const notifs: NotifItem[] = [];

      for (const e of todayEvents) {
        if (e.status === "missed") notifs.push({ kind: "med_missed", event: e });
        else if (e.status === "pending") notifs.push({ kind: "med_pending", event: e });
      }

      const now = new Date();
      const in7 = new Date(now.getTime() + 7 * 86400_000);
      for (const a of appointments) {
        const d = new Date(a.scheduledAt);
        if (a.status === "upcoming" && d >= now && d <= in7) {
          notifs.push({ kind: "appointment", appt: a });
        }
      }

      setItems(notifs);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["70%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={s.sheetBg}
      handleIndicatorStyle={s.handle}
      onChange={(idx) => { if (idx >= 0) load(); }}
    >
      <View style={s.header}>
        <Text style={s.headerTitle}>Thông báo</Text>
        {items.length > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{items.length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.brand.DEFAULT} />
        </View>
      ) : (
        <BottomSheetFlatList
          data={items}
          keyExtractor={(n, i) => i.toString()}
          renderItem={({ item }) => {
            if (item.kind === "med_missed") {
              return (
                <View style={[s.item, s.unread]}>
                  <View style={[s.iconCircle, { backgroundColor: colors.danger.light }]}>
                    <AlertTriangle size={18} color={colors.danger.DEFAULT} strokeWidth={1.8} />
                  </View>
                  <View style={s.itemContent}>
                    <Text style={s.itemTitle}>Bỏ lỡ: {item.event.medicationName}</Text>
                    <Text style={s.itemBody}>
                      {item.event.dosage}{item.event.unit} — {item.event.scheduledTime.slice(0, 5)}
                    </Text>
                    <Text style={s.itemTime}>{timeAgo(item.event.scheduledAt)}</Text>
                  </View>
                  <View style={s.unreadDot} />
                </View>
              );
            }

            if (item.kind === "med_pending") {
              return (
                <View style={[s.item, s.unread]}>
                  <View style={[s.iconCircle, { backgroundColor: colors.brand.light }]}>
                    <Pill size={18} color={colors.brand.DEFAULT} strokeWidth={1.8} />
                  </View>
                  <View style={s.itemContent}>
                    <Text style={s.itemTitle}>Nhắc uống thuốc: {item.event.medicationName}</Text>
                    <Text style={s.itemBody}>
                      {item.event.dosage}{item.event.unit} lúc {item.event.scheduledTime.slice(0, 5)}
                    </Text>
                    <Text style={s.itemTime}>Hôm nay</Text>
                  </View>
                  <View style={s.unreadDot} />
                </View>
              );
            }

            return (
              <View style={[s.item, s.unread]}>
                <View style={[s.iconCircle, { backgroundColor: colors.purple.light }]}>
                  <Calendar size={18} color={colors.purple.DEFAULT} strokeWidth={1.8} />
                </View>
                <View style={s.itemContent}>
                  <Text style={s.itemTitle}>{item.appt.title}</Text>
                  <Text style={s.itemBody}>
                    {item.appt.doctorName ?? ""}{item.appt.location ? ` — ${item.appt.location}` : ""}
                  </Text>
                  <Text style={s.itemTime}>{timeUntil(item.appt.scheduledAt)}</Text>
                </View>
                <View style={s.unreadDot} />
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyText}>Không có thông báo mới.</Text>
            </View>
          }
          ItemSeparatorComponent={() => null}
        />
      )}
    </BottomSheet>
  );
});

NotificationPanel.displayName = "NotificationPanel";
export default NotificationPanel;

const s = StyleSheet.create({
  sheetBg: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: { backgroundColor: colors.border.DEFAULT, width: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.DEFAULT,
  },
  headerTitle: { fontFamily: fonts.semibold, fontSize: fontSizes.lg, color: colors.text.DEFAULT },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontFamily: fonts.bold, color: "#fff" },
  center: { padding: 40, alignItems: "center" },
  emptyText: { color: colors.text.muted, fontFamily: fonts.regular, fontSize: 13 },
  item: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.DEFAULT,
    alignItems: "center",
  },
  unread: { backgroundColor: "rgba(14,165,233,0.05)" },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  itemContent: { flex: 1 },
  itemTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.text.DEFAULT },
  itemBody: { fontSize: 12, color: colors.text.secondary, fontFamily: fonts.regular },
  itemTime: { fontSize: 11, color: colors.text.muted, marginTop: 2, fontFamily: fonts.regular },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand.DEFAULT },
});
