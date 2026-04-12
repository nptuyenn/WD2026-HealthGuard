import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

const moduleDetail = [
  {
    title: 'Emergency Card',
    color: '#1F7A8C',
    items: ['Ho so y te ca nhan', 'Tao va quan ly ma QR', 'Trang xem cong khai', 'Hoat dong offline'],
  },
  {
    title: 'Med Manager',
    color: '#2E8B57',
    items: ['Lich uong thuoc CRUD', 'Nhac nho push va email', 'Quan ly tu thuoc', 'Lich tai kham'],
  },
  {
    title: 'Child Growth',
    color: '#C27B2E',
    items: ['Lich tiem TCMR day du', 'Nhac nho tiem chung', 'Nhat ky suc khoe tre'],
  },
  {
    title: 'Health Dashboard',
    color: '#B24C63',
    items: ['Nhap va bieu do chi so', 'Phan tich AI', 'Canh bao nguong', 'Xuat PDF bao cao'],
  },
];

export default function FeatureOverviewScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const palette = {
    background: isDark ? '#0B1215' : '#F4F8FA',
    card: isDark ? '#152329' : '#FFFFFF',
    text: isDark ? '#E8F0F2' : '#0D1F24',
    textMuted: isDark ? '#A9BDC4' : '#4A6168',
    border: isDark ? '#22414B' : '#D7E7EC',
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.headerWrap}>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Ban do tinh nang</Text>
        <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}> 
          Tong hop pham vi giao dien cho 4 module chinh cua HealthGuard.
        </Text>
      </View>

      {moduleDetail.map((module) => (
        <View
          key={module.title}
          style={[styles.featureCard, { backgroundColor: palette.card, borderColor: palette.border }]}> 
          <View style={styles.cardHeader}>
            <View style={[styles.colorLine, { backgroundColor: module.color }]} />
            <Text style={[styles.cardTitle, { color: palette.text }]}>{module.title}</Text>
          </View>

          {module.items.map((item) => (
            <View key={item} style={styles.itemRow}>
              <Ionicons name="checkmark-circle" size={16} color={module.color} />
              <Text style={[styles.itemText, { color: palette.textMuted }]}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 44,
    gap: 12,
  },
  headerWrap: {
    marginBottom: 4,
    gap: 8,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  featureCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  colorLine: {
    width: 8,
    height: 24,
    borderRadius: 99,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
});
