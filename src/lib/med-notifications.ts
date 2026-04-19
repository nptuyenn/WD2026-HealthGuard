import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEY = "hg.medNotifications";

type StoredMap = Record<string, string[]>;

export async function ensurePermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

async function loadMap(): Promise<StoredMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}
async function saveMap(map: StoredMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function scheduleMedicationReminders(
  medicationId: string,
  medicationName: string,
  dosage: string | null,
  unit: string | null,
  timesOfDay: string[]
) {
  try {
    const ok = await ensurePermissions();
    if (!ok) return;

    await cancelMedicationReminders(medicationId);

    const ids: string[] = [];
    for (const t of timesOfDay) {
      const [hh, mm] = t.split(":").map(Number);
      if (Number.isNaN(hh) || Number.isNaN(mm)) continue;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Đến giờ uống thuốc",
          body: `${medicationName}${dosage ? ` ${dosage}${unit ?? ""}` : ""} · ${t}`,
          sound: Platform.OS === "ios" ? "default" : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hh,
          minute: mm,
        },
      });
      ids.push(id);
    }

    const map = await loadMap();
    map[medicationId] = ids;
    await saveMap(map);
  } catch (err) {
    console.warn("[med-notifications] skipped (likely Expo Go):", err);
  }
}

export async function cancelMedicationReminders(medicationId: string) {
  try {
    const map = await loadMap();
    const ids = map[medicationId] ?? [];
    for (const id of ids) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {}
    }
    delete map[medicationId];
    await saveMap(map);
  } catch {}
}
