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
  iconBg: '#FFF1DE',
  liveBg: '#FDE2D0',
  liveText: '#C95A0E',
};

type IconName = { ios: string; android: string; web: string };

type ServiceItem = {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  icon: IconName;
  badgeKey?: TranslationKey;
};

const SERVICES: ServiceItem[] = [
  {
    titleKey: 'liveAarti',
    descKey: 'liveAartiDesc',
    icon: { ios: 'dot.radiowaves.left.and.right', android: 'podcasts', web: 'podcasts' },
    badgeKey: 'liveNow',
  },
  {
    titleKey: 'liveKatha',
    descKey: 'liveKathaDesc',
    icon: { ios: 'book.closed.fill', android: 'menu_book', web: 'menu_book' },
    badgeKey: 'startingSoon',
  },
  {
    titleKey: 'abhishek',
    descKey: 'abhishekDesc',
    icon: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  },
  {
    titleKey: 'monthlyPackages',
    descKey: 'monthlyPackagesDesc',
    icon: { ios: 'shippingbox.fill', android: 'inventory_2', web: 'inventory_2' },
  },
  {
    titleKey: 'yearlyPackages',
    descKey: 'yearlyPackagesDesc',
    icon: { ios: 'shippingbox.fill', android: 'inventory_2', web: 'inventory_2' },
  },
];

export default function ServicesScreen() {
  const t = useT();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <ThemedText style={styles.headerTitle}>{t('servicesTitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {SERVICES.map(item => (
          <ServiceCard
            key={item.titleKey}
            title={t(item.titleKey)}
            desc={t(item.descKey)}
            icon={item.icon}
            badge={item.badgeKey ? t(item.badgeKey) : undefined}
            viewDetails={t('viewDetails')}
            bookNow={t('bookNow')}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function ServiceCard({
  title,
  desc,
  icon,
  badge,
  viewDetails,
  bookNow,
}: {
  title: string;
  desc: string;
  icon: IconName;
  badge?: string;
  viewDetails: string;
  bookNow: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.iconBox}>
          <SymbolView name={icon} tintColor={BRAND.primary} size={22} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.cardTitle}>{title}</ThemedText>
            {badge ? (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{badge}</ThemedText>
              </View>
            ) : null}
          </View>
          <ThemedText style={styles.cardDesc}>{desc}</ThemedText>
        </View>
      </View>
      <View style={styles.actionsRow}>
        <Pressable style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.outlineBtnText}>{viewDetails}</ThemedText>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.primaryBtnText}>{bookNow}</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.three },
  headerInner: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: BRAND.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: BRAND.text },
  cardDesc: { fontSize: 12, color: BRAND.textSecondary, marginTop: 4 },
  badge: {
    backgroundColor: BRAND.liveBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { color: BRAND.liveText, fontSize: 10, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: BRAND.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: BRAND.card,
  },
  outlineBtnText: { color: BRAND.primary, fontSize: 13, fontWeight: '700' },
  primaryBtn: {
    flex: 1,
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
