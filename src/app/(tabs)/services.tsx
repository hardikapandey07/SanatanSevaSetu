import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  planBg: '#2D1F0E',
  planBorder: '#4A3520',
  freeBadge: '#DC2626',
  popularBadge: '#E8731C',
};

type ServiceItem = {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  badge?: 'free' | 'popular' | 'new';
  emoji: string;
  emojiColor: string;
};

const SERVICES: ServiceItem[] = [
  {
    titleKey: 'liveAarti',
    descKey: 'liveAartiDesc',
    badge: 'free',
    emoji: '🪔',
    emojiColor: '#FDE2D0',
  },
  {
    titleKey: 'liveKatha',
    descKey: 'liveKathaDesc',
    badge: 'popular',
    emoji: '📖',
    emojiColor: '#DBEAFE',
  },
  {
    titleKey: 'abhishek',
    descKey: 'abhishekDesc',
    emoji: '🫧',
    emojiColor: '#D1FAE5',
  },
  {
    titleKey: 'monthlyPackages',
    descKey: 'monthlyPackagesDesc',
    badge: 'popular',
    emoji: '📦',
    emojiColor: '#EDE9FE',
  },
  {
    titleKey: 'yearlyPackages',
    descKey: 'yearlyPackagesDesc',
    badge: 'new',
    emoji: '🎁',
    emojiColor: '#FEF3C7',
  },
];

const BADGE_COLORS: Record<string, string> = {
  free: BRAND.freeBadge,
  popular: BRAND.popularBadge,
  new: '#059669',
};

const BADGE_LABELS: Record<string, string> = {
  free: 'FREE',
  popular: 'POPULAR',
  new: 'NEW',
};

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export default function ServicesScreen() {
  const t = useT();

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <ThemedText style={styles.headerTitle}>{t('servicesTitle')}</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Divine services at your fingertips</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Active Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planTopRow}>
            <View style={styles.planBadgeRow}>
              <ThemedText style={styles.planCrownEmoji}>👑</ThemedText>
              <ThemedText style={styles.planBadgeText}>ACTIVE PLAN</ThemedText>
            </View>
            <View style={styles.planCountBox}>
              <ThemedText style={styles.planCount}>12</ThemedText>
              <ThemedText style={styles.planCountLabel}>Poojas left</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.planName}>Monthly Devotee Plan</ThemedText>
          <ThemedText style={styles.planValidity}>Valid till Oct 31, 2025</ThemedText>
          <View style={styles.planActions}>
            <Pressable style={({ pressed }) => [styles.upgradBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.upgradeBtnText}>Upgrade Plan</ThemedText>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.detailsBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.detailsBtnText}>View Details</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* All Services */}
        <ThemedText style={styles.sectionTitle}>All Services</ThemedText>
        <View style={styles.grid}>
          {chunk(SERVICES, 2).map((row, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {row.map(item => (
                <ServiceCard key={item.titleKey} item={item} t={t} />
              ))}
              {/* Fill empty slot if odd item in last row */}
              {row.length === 1 && <View style={styles.gridPlaceholder} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ServiceCard({
  item,
  t,
}: {
  item: ServiceItem;
  t: (k: TranslationKey) => string;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.serviceCard, pressed && styles.pressed]}>
      {/* Image area with emoji placeholder */}
      <View style={[styles.serviceImg, { backgroundColor: item.emojiColor }]}>
        <ThemedText style={styles.serviceEmoji}>{item.emoji}</ThemedText>
        {item.badge && (
          <View style={[styles.badgePill, { backgroundColor: BADGE_COLORS[item.badge] }]}>
            <ThemedText style={styles.badgeText}>{BADGE_LABELS[item.badge]}</ThemedText>
          </View>
        )}
      </View>

      {/* Card body */}
      <View style={styles.serviceBody}>
        <ThemedText style={styles.serviceTitle}>{t(item.titleKey)}</ThemedText>
        <ThemedText style={styles.serviceDesc} numberOfLines={2}>{t(item.descKey)}</ThemedText>
        <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
          <ThemedText style={styles.bookNow}>Book Now ›</ThemedText>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  header: { paddingBottom: Spacing.three },
  headerInner: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },

  // Plan card
  planCard: {
    backgroundColor: BRAND.planBg,
    borderRadius: 16,
    padding: Spacing.three,
    gap: 6,
    borderWidth: 1,
    borderColor: BRAND.planBorder,
  },
  planTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planCrownEmoji: { fontSize: 14 },
  planBadgeText: { fontSize: 11, fontWeight: '800', color: BRAND.primary, letterSpacing: 0.5 },
  planCountBox: { alignItems: 'flex-end' },
  planCount: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', lineHeight: 30 },
  planCountLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  planName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  planValidity: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6 },
  planActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  upgradBtn: {
    flex: 1,
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  upgradeBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  detailsBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  detailsBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: BRAND.text },

  // 2-column grid
  grid: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridPlaceholder: { flex: 1 },
  serviceCard: {
    flex: 1,
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    overflow: 'hidden',
  },
  serviceImg: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  serviceEmoji: { fontSize: 44 },
  badgePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  serviceBody: { padding: 10, gap: 4 },
  serviceTitle: { fontSize: 14, fontWeight: '800', color: BRAND.text },
  serviceDesc: { fontSize: 11, color: BRAND.textSecondary, lineHeight: 15 },
  bookNow: { fontSize: 12, fontWeight: '700', color: BRAND.primary, marginTop: 4 },

  pressed: { opacity: 0.85 },
});
