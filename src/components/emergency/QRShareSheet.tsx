import { forwardRef, useCallback, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Copy, Download, Share2 } from "lucide-react-native";
import { colors, fonts, fontSizes, radius } from "@/theme";
import { API_URL } from "@/lib/api";

type Props = { publicToken: string | null };

const QRShareSheet = forwardRef<BottomSheet, Props>(({ publicToken }, ref) => {
  const qrUrl = publicToken ? `${API_URL}/emergency/${publicToken}` : "";
  const qrRef = useRef<any>(null);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(qrUrl);
    Alert.alert("Đã sao chép", "Link thẻ y tế đã được sao chép vào clipboard.");
  };

  const getQrPngUri = () =>
    new Promise<string>((resolve, reject) => {
      if (!qrRef.current) return reject(new Error("QR chưa sẵn sàng"));
      qrRef.current.toDataURL(async (base64: string) => {
        try {
          const uri = `${FileSystem.cacheDirectory}healthguard-qr-${Date.now()}.png`;
          await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          resolve(uri);
        } catch (e) {
          reject(e);
        }
      });
    });

  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(false, ["photo"]);
      if (status !== "granted") {
        Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền lưu ảnh vào thư viện.");
        return;
      }
      const uri = await getQrPngUri();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Đã lưu", "QR đã được lưu vào thư viện ảnh.");
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không lưu được QR.");
    }
  };

  const handleShare = async () => {
    try {
      const uri = await getQrPngUri();
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Không hỗ trợ", "Thiết bị không hỗ trợ chia sẻ.");
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Chia sẻ QR thẻ y tế" });
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không chia sẻ được.");
    }
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["60%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Mã QR thẻ y tế</Text>

        {qrUrl ? (
          <>
            <View style={styles.qrWrapper}>
              <QRCode value={qrUrl} size={200} getRef={(r) => (qrRef.current = r)} />
            </View>
            <Text style={styles.urlText} numberOfLines={2}>
              {qrUrl}
            </Text>

            <View style={styles.btnRow}>
              <Pressable style={styles.actionBtn} onPress={handleCopyLink}>
                <Copy size={18} color={colors.brand.DEFAULT} strokeWidth={1.8} />
                <Text style={styles.actionBtnText}>Sao chép</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={handleDownload}>
                <Download size={18} color={colors.brand.DEFAULT} strokeWidth={1.8} />
                <Text style={styles.actionBtnText}>Tải QR</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={handleShare}>
                <Share2 size={18} color={colors.brand.DEFAULT} strokeWidth={1.8} />
                <Text style={styles.actionBtnText}>Chia sẻ</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>
            Vui lòng lưu thẻ khẩn cấp trước khi tạo mã QR.
          </Text>
        )}

        <Text style={styles.note}>
          Ai quét mã này đều có thể xem thông tin y tế công khai của bạn.
        </Text>
      </BottomSheetView>
    </BottomSheet>
  );
});

QRShareSheet.displayName = "QRShareSheet";
export default QRShareSheet;

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: { backgroundColor: colors.border.DEFAULT, width: 40 },
  content: { padding: 24, alignItems: "center" },
  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg,
    color: colors.text.DEFAULT,
    marginBottom: 20,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  urlText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    marginTop: 12,
    maxWidth: 300,
    textAlign: "center",
    fontFamily: fonts.mono,
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    textAlign: "center",
    marginVertical: 40,
    maxWidth: 240,
  },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 20, width: "100%" },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.brand.light,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  actionBtnText: {
    color: colors.brand.DEFAULT,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
  },
  note: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: "center",
    marginTop: 16,
    fontFamily: fonts.regular,
    maxWidth: 260,
  },
});
