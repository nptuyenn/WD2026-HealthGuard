import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

const modules = [
  {
    title: 'Emergency Card',
    subtitle: 'Ho so y te ca nhan va QR offline',
    icon: 'shield-checkmark-outline' as const,
    color: '#1F7A8C',
  },
  {
    title: 'Med Manager',
    subtitle: 'Lich thuoc, nhac nho, quan ly tu thuoc',
    icon: 'medkit-outline' as const,
    color: '#2E8B57',
  },
  {
    title: 'Child Growth',
    subtitle: 'Lich tiem TCMR va nhat ky suc khoe tre',
    icon: 'happy-outline' as const,
    color: '#C27B2E',
  },
  {
    title: 'Health Dashboard',
    subtitle: 'Bieu do chi so, AI va bao cao PDF',
    icon: 'pulse-outline' as const,
    color: '#B24C63',
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const palette = {
    background: isDark ? '#0B1215' : '#F4F8FA',
    card: isDark ? '#152329' : '#FFFFFF',
    cardSoft: isDark ? '#1B2D35' : '#EAF3F6',
    text: isDark ? '#E8F0F2' : '#0D1F24',
    textMuted: isDark ? '#A9BDC4' : '#4A6168',
    border: isDark ? '#22414B' : '#D7E7EC',
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}> 
      <View style={[styles.bgBubbleTop, { backgroundColor: isDark ? '#143640' : '#D0EBF3' }]} />
      <View style={[styles.bgBubbleBottom, { backgroundColor: isDark ? '#2D2736' : '#FFE6D5' }]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: palette.card, borderColor: palette.border }]}> 
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>HealthGuard 2026</Text>
          </View>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Ung dung y te thong minh</Text>
          <Text style={[styles.heroSubtitle, { color: palette.textMuted }]}> 
            Giao dien tong quan cho cuoc thi: tap trung vao an toan, theo doi suc khoe va nhac nho
            chu dong.
          </Text>
          <View style={styles.heroFooter}>
            <View style={[styles.statPill, { backgroundColor: palette.cardSoft }]}> 
              <Text style={[styles.statNumber, { color: palette.text }]}>4</Text>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>Module</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: palette.cardSoft }]}> 
              <Text style={[styles.statNumber, { color: palette.text }]}>Offline</Text>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>San sang</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: palette.cardSoft }]}> 
              <Text style={[styles.statNumber, { color: palette.text }]}>iOS</Text>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>Expo</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Cac module chinh</Text>
          <Text style={[styles.sectionCaption, { color: palette.textMuted }]}>UI tong quan</Text>
        </View>

        {modules.map((module) => (
          <View
            key={module.title}
            style={[styles.moduleCard, { backgroundColor: palette.card, borderColor: palette.border }]}> 
            <View style={[styles.iconWrap, { backgroundColor: module.color }]}>
              <Ionicons name={module.icon} size={20} color="#fff" />
            </View>
            <View style={styles.moduleTextWrap}>
              <Text style={[styles.moduleTitle, { color: palette.text }]}>{module.title}</Text>
              <Text style={[styles.moduleSubtitle, { color: palette.textMuted }]}>{module.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
          </View>
        ))}

        <View style={[styles.previewCard, { backgroundColor: palette.card, borderColor: palette.border }]}> 
          <Text style={[styles.previewTitle, { color: palette.text }]}>San cho buoc tiep theo</Text>
          <Text style={[styles.previewText, { color: palette.textMuted }]}> 
            Ban da co bo khung giao dien tong quan. Tiep theo co the bo sung man hinh chi tiet cho
            tung module va ket noi du lieu sau.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 14,
  },
  bgBubbleTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 999,
    top: -120,
    right: -90,
    opacity: 0.55,
  },
  bgBubbleBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
    bottom: -120,
    left: -90,
    opacity: 0.35,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F7A8C',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  heroFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statPill: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionCaption: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  moduleCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTextWrap: {
    flex: 1,
    gap: 2,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  moduleSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  previewCard: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  previewText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
