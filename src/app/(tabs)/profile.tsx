import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
  upcomingBg: '#DCEBFB',
  upcomingText: '#2563EB',
  completedBg: '#D5F1DE',
  completedText: '#15803D',
  logoutColor: '#DC2626',
};

type IconName = { ios: string; android: string; web: string };

type Booking = {
  titleKey: TranslationKey;
  date: string;
  statusKey: TranslationKey;
  status: 'upcoming' | 'completed';
};

const BOOKINGS: Booking[] = [
  { titleKey: 'satyanarayanPuja', date: 'May 5, 2026', statusKey: 'upcoming', status: 'upcoming' },
  { titleKey: 'grihaPravesh', date: 'April 15, 2026', statusKey: 'completed', status: 'completed' },
];

type MenuRow = {
  labelKey: TranslationKey;
  icon: IconName;
  value?: string;
  route?: string;
};

const MENU: MenuRow[] = [
  {
    labelKey: 'myBookings',
    icon: { ios: 'calendar', android: 'event', web: 'event' },
    route: '/my-bookings',
  },
  {
    labelKey: 'rewardPoints',
    icon: { ios: 'rosette', android: 'workspace_premium', web: 'workspace_premium' },
    value: '450',
  },
  {
    labelKey: 'referralCode',
    icon: { ios: 'gift.fill', android: 'card_giftcard', web: 'card_giftcard' },
    value: 'SETU2026',
  },
  {
    labelKey: 'languageSettings',
    icon: { ios: 'character.bubble', android: 'translate', web: 'translate' },
  },
  {
    labelKey: 'suggestions',
    icon: { ios: 'bubble.left.fill', android: 'chat', web: 'chat' },
    route: '/suggestion',
  },
];

export default function ProfileScreen() {
  const t = useT();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <View style={styles.avatar}>
            <SymbolView
              name={{ ios: 'person.fill', android: 'person', web: 'person' }}
              tintColor="#FFFFFF"
              size={32}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.profileName}>{t('profileName')}</ThemedText>
            <ThemedText style={styles.profileMeta}>{t('profilePhone')}</ThemedText>
            <ThemedText style={styles.profileMeta}>{t('memberSince')}</ThemedText>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('recentBookings')}</ThemedText>
          {BOOKINGS.map((b, i) => (
            <View
              key={b.titleKey}
              style={[styles.bookingRow, i < BOOKINGS.length - 1 && styles.bookingDivider]}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.bookingTitle}>{t(b.titleKey)}</ThemedText>
                <ThemedText style={styles.bookingDate}>{b.date}</ThemedText>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  b.status === 'upcoming' ? styles.statusUpcoming : styles.statusCompleted,
                ]}>
                <ThemedText
                  style={[
                    styles.statusText,
                    b.status === 'upcoming' ? styles.statusUpcomingText : styles.statusCompletedText,
                  ]}>
                  {t(b.statusKey)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.menuCard}>
          {MENU.map((row, i) => (
            <Pressable
              key={row.labelKey}
              onPress={() => {
                if (row.labelKey === 'languageSettings') {
                  router.push('/language-settings');
                } else if (row.route) {
                  router.push(row.route as never);
                }
              }}
              style={({ pressed }) => [
                styles.menuRow,
                i < MENU.length - 1 && styles.menuDivider,
                pressed && styles.pressed,
              ]}>
              <SymbolView name={row.icon} tintColor={BRAND.primary} size={18} />
              <ThemedText style={styles.menuLabel}>{t(row.labelKey)}</ThemedText>
              {row.value ? <ThemedText style={styles.menuValue}>{row.value}</ThemedText> : null}
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                tintColor={BRAND.textSecondary}
                size={14}
              />
            </Pressable>
          ))}
        </View>

        <Pressable style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
            tintColor={BRAND.logoutColor}
            size={16}
          />
          <ThemedText style={styles.logoutText}>{t('logout')}</ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.four },
  headerInner: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  profileMeta: { fontSize: 12, color: '#FFE7CF', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.two },
  section: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: BRAND.text, marginBottom: 10 },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  bookingDivider: { borderBottomWidth: 1, borderBottomColor: BRAND.border },
  bookingTitle: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  bookingDate: { fontSize: 12, color: BRAND.textSecondary, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusUpcoming: { backgroundColor: BRAND.upcomingBg },
  statusCompleted: { backgroundColor: BRAND.completedBg },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusUpcomingText: { color: BRAND.upcomingText },
  statusCompletedText: { color: BRAND.completedText },
  menuCard: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: BRAND.border },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: BRAND.text },
  menuValue: { fontSize: 13, color: BRAND.textSecondary, marginRight: 6 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: BRAND.logoutColor,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: BRAND.card,
    marginTop: Spacing.one,
  },
  logoutText: { color: BRAND.logoutColor, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
