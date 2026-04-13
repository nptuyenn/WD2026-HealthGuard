import { useRef } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import { colors } from "@/theme";
import CardPreview3D from "@/components/emergency/CardPreview3D";
import EmergencyForm from "@/components/emergency/EmergencyForm";
import QRShareSheet from "@/components/emergency/QRShareSheet";

export default function EmergencyCardScreen() {
  const qrSheetRef = useRef<BottomSheet>(null);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CardPreview3D />
        <EmergencyForm onShareQR={() => qrSheetRef.current?.expand()} />
      </ScrollView>

      <QRShareSheet ref={qrSheetRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.DEFAULT,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
});
