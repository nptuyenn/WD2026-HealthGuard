import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Text, View, Pressable } from "react-native";

export default function Scan() {
  const [data, setData] = useState<any>(null);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <Text>Loading...</Text>;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Chưa cấp quyền camera</Text>
        <Pressable
          onPress={requestPermission}
          style={{ marginTop: 10, padding: 10, backgroundColor: "blue" }}
        >
          <Text style={{ color: "#fff" }}>Cấp quyền</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* CAMERA */}
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : (e) => {
                setScanned(true);

                try {
                  const parsed = JSON.parse(e.data);
                  setData(parsed);
                } catch {
                  // nếu không phải JSON
                  setData({ raw: e.data });
                }
              }
        }
      />

      {/* RESULT */}
      <View
        style={{
          position: "absolute",
          bottom: 50,
          left: 20,
          right: 20,
          backgroundColor: "white",
          padding: 16,
          borderRadius: 10,
        }}
      >
        {data ? (
          <>
            <Text style={{ fontWeight: "bold" }}>
              {data.name
                ? `${data.name} - ${data.blood}`
                : `Raw: ${data.raw}`}
            </Text>

            {/* nút scan lại */}
            <Pressable
              onPress={() => {
                setScanned(false);
                setData(null);
              }}
              style={{
                marginTop: 10,
                backgroundColor: "blue",
                padding: 10,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#fff" }}>Scan lại</Text>
            </Pressable>
          </>
        ) : (
          <Text>Đưa QR vào camera</Text>
        )}
      </View>
    </View>
  );
}