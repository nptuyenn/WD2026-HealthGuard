import { forwardRef, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Pill, Calendar, Syringe, AlertTriangle } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";
import { mockNotifications } from "@/lib/mock-data";

type NotifType = "medication" | "appointment" | "vaccination" | "metric_alert";

const ICON_MAP: Record<NotifType, { icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>; bg: string; color: string }> = {
  medication:    { icon: Pill,          bg: colors.brand.light,   color: colors.brand.DEFAULT },
  appointment:   { icon: Calendar,      bg: colors.purple.light,  color: colors.purple.DEFAULT },
  vaccination:   { icon: Syringe,       bg: colors.warning.light, color: colors.warning.DEFAULT },
  metric_alert:  { icon: AlertTriangle, bg: colors.danger.light,  color: colors.danger.DEFAULT },
};

function timeAgo(iso: string): string {
  const diff = (new Date("2026-04-12T12:00").getTime() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

const NotificationPanel = forwardRef<BottomSheet, object>((_props, ref) => {
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
    >
      <View style={s.header}>
        <Text style={s.headerTitle}>Thông báo</Text>
      </View>

      <BottomSheetFlatList
        data={mockNotifications}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => {
          const cfg = ICON_MAP[item.type as NotifType];
          const Icon = cfg?.icon ?? AlertTriangle;
          const bg = cfg?.bg ?? colors.surface.secondary;
          const iconColor = cfg?.color ?? colors.text.secondary;

          return (
            <View style={[s.item, !item.isRead && s.unread]}>
              <View style={[s.iconCircle, { backgroundColor: bg }]}>
                <Icon size={18} color={iconColor} strokeWidth={1.8} />
              </View>
              <View style={s.itemContent}>
                <Text style={s.itemTitle}>{item.title}</Text>
                <Text style={s.itemBody}>{item.body}</Text>
                <Text style={s.itemTime}>{timeAgo(item.scheduledAt)}</Text>
              </View>
              {!item.isRead && <View style={s.unreadDot} />}
            </View>
          );
        }}
        ItemSeparatorComponent={() => null}
        ListFooterComponent={
          <Pressable
            style={s.footer}
            onPress={() => Alert.alert("Đã đánh dấu tất cả đã đọc")}
          >
            <Text style={s.footerText}>Đánh dấu tất cả đã đọc</Text>
          </Pressable>
        }
      />
    </BottomSheet>
  );
});

NotificationPanel.displayName = "NotificationPanel";
export default NotificationPanel;

const s = StyleSheet.create({
  sheetBg: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: { backgroundColor: colors.border.DEFAULT, width: 40 },
  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border.DEFAULT },
  headerTitle: { fontFamily: fonts.semibold, fontSize: fontSizes.lg, color: colors.text.DEFAULT },
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
  footer: { padding: 16, alignItems: "center" },
  footerText: { fontSize: 14, color: colors.brand.DEFAULT, fontFamily: fonts.medium },
});
