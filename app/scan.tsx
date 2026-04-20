import { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { X, ScanLine } from "lucide-react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors, fonts, fontSizes, radius } from "@/theme";
import ExamImportSheet from "@/components/dashboard/ExamImportSheet";
import { fetchExamResult, type ExamResult } from "@/lib/exam-api";

export default function ScanScreen() {
  const router = useRouter();
  const sheetRef = useRef<BottomSheet>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [exam, setExam] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBarcode = async (data: string) => {
    if (scanned || processing) return;

    if (!data.startsWith("HG_EXAM:")) {
      setError("QR không hợp lệ. Hãy quét mã từ phiếu khám HealthGuard.");
      setScanned(true);
      return;
    }

    const token = data.replace("HG_EXAM:", "").trim();
    setScanned(true);
    setProcessing(true);
    setError(null);
    try {
      const result = await fetchExamResult(token);
      setExam(result);
      sheetRef.current?.expand();
    } catch (err: any) {
      setError(err?.message ?? "Không tải được dữ liệu phiếu khám.");
    } finally {
      setProcessing(false);
    }
  };

  const resetScan = () => {
    setScanned(false);
    setProcessing(false);
    setError(null);
    setExam(null);
    sheetRef.current?.close();
  };

  if (!permission) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.brand.DEFAULT} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={s.permissionScreen} edges={["top", "bottom"]}>
        <ScanLine size={48} color={colors.text.muted} strokeWidth={1.5} />
        <Text style={s.permTitle}>Cần quyền camera</Text>
        <Text style={s.permSub}>Cho phép camera để quét mã QR phiếu khám.</Text>
        <Pressable style={s.grantBtn} onPress={requestPermission}>
          <Text style={s.grantText}>Cấp quyền</Text>
        </Pressable>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : (e) => handleBarcode(e.data)}
        />

        {/* top bar */}
        <SafeAreaView edges={["top"]} style={s.topBar}>
          <Pressable style={s.closeBtn} onPress={() => router.back()}>
            <X size={22} color="#fff" strokeWidth={2} />
          </Pressable>
          <Text style={s.topTitle}>Quét phiếu khám</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>

        {/* viewfinder */}
        <View style={s.viewfinderWrap} pointerEvents="none">
          <View style={s.viewfinder}>
            <View style={[s.corner, s.tl]} />
            <View style={[s.corner, s.tr]} />
            <View style={[s.corner, s.bl]} />
            <View style={[s.corner, s.br]} />
          </View>
        </View>

        {/* bottom hint / status */}
        <View style={s.bottomHint}>
          {processing ? (
            <View style={s.statusBox}>
              <ActivityIndicator color="#fff" />
              <Text style={s.statusText}>Đang tải phiếu khám...</Text>
            </View>
          ) : error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
              <Pressable style={s.retryBtn} onPress={resetScan}>
                <Text style={s.retryText}>Quét lại</Text>
              </Pressable>
            </View>
          ) : scanned && exam ? (
            <View style={s.statusBox}>
              <Text style={s.statusText}>Đã tìm thấy phiếu khám ✓</Text>
            </View>
          ) : (
            <View style={s.hintBox}>
              <ScanLine size={18} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
              <Text style={s.hintText}>Đưa mã QR phiếu khám vào khung</Text>
            </View>
          )}
        </View>

        <ExamImportSheet
          ref={sheetRef}
          exam={exam}
          onDone={() => router.back()}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const CORNER = 24;
const BORDER = 3;

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },

  permissionScreen: {
    flex: 1,
    backgroundColor: colors.surface.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  permTitle: { fontFamily: fonts.semibold, fontSize: fontSizes.lg, color: colors.text.DEFAULT, marginTop: 8 },
  permSub: { fontFamily: fonts.regular, fontSize: 14, color: colors.text.secondary, textAlign: "center" },
  grantBtn: {
    marginTop: 8,
    backgroundColor: colors.brand.DEFAULT,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  grantText: { color: "#fff", fontFamily: fonts.semibold, fontSize: fontSizes.base },
  backBtn: { marginTop: 4 },
  backText: { color: colors.text.muted, fontFamily: fonts.regular, fontSize: 13 },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: "#fff" },

  viewfinderWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  viewfinder: {
    width: 240,
    height: 240,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#fff",
  },
  tl: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER, borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER, borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER, borderBottomRightRadius: 4 },

  bottomHint: {
    position: "absolute",
    bottom: 60,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintText: { color: "rgba(255,255,255,0.85)", fontFamily: fonts.regular, fontSize: 13 },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(14,165,233,0.85)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  statusText: { color: "#fff", fontFamily: fonts.medium, fontSize: 13 },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.9)",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  errorText: { color: "#fff", fontFamily: fonts.regular, fontSize: 13, textAlign: "center" },
  retryBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  retryText: { color: "#fff", fontFamily: fonts.semibold, fontSize: 13 },
});
