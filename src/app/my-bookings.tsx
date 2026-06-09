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
  amount: '#E8731C',
};

type BookingStatus = 'upcoming' | 'completed';

type Booking = {
  id: string;
  titleKey: TranslationKey;
  panditKey: TranslationKey;
  date: string;
  location: string;
  amount: string;
  status: BookingStatus;
};

const BOOKINGS: Booking[] = [
  {
    id: '1',
    titleKey: 'satyanarayanPuja',
    panditKey: 'panditRameshSharma',
    date: 'May 5, 2026 at 10:00 AM',
    location: 'Delhi, 110001',
    amount: '₹2100',
    status: 'upcoming',
  },
  {
    id: '2',
    titleKey: 'grihaPravesh',
    panditKey: 'panditSureshKumar',
    date: 'April 15, 2026 at 8:00 AM',
    location: 'Noida, 201301',
    amount: '₹3500',
    status: 'completed',
  },
  {
    id: '3',
    titleKey: 'weddingCeremony',
    panditKey: 'panditMaheshTiwari',
    date: 'March 20, 2026 at 6:00 AM',
    location: 'Gurgaon, 122001',
    amount: '₹11000',
    status: 'completed',
  },
];

export default function MyBookingsScreen() {
  const t = useT();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              tintColor="#FFFFFF"
              size={18}
            />
          </Pressable>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.headerTitle}>{t('myBookings')}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{t('myBookingsNative')}</ThemedText>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {BOOKINGS.map(b => (
          <View key={b.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.bookingTitle}>{t(b.titleKey)}</ThemedText>
              <View
                style={[
                  styles.statusBadge,
                  b.status === 'upcoming' ? styles.statusUpcoming : styles.statusCompleted,
                ]}>
                <ThemedText
                  style={[
                    styles.statusText,
                    b.status === 'upcoming'
                      ? styles.statusUpcomingText
                      : styles.statusCompletedText,
                  ]}>
                  {b.status === 'upcoming' ? t('upcoming') : t('completed')}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.panditName}>{t(b.panditKey)}</ThemedText>

            <View style={styles.metaRow}>
              <SymbolView
                name={{ ios: 'calendar', android: 'event', web: 'event' }}
                tintColor={BRAND.primary}
                size={14}
              />
              <ThemedText style={styles.metaText}>{b.date}</ThemedText>
            </View>

            <View style={styles.metaRow}>
              <SymbolView
                name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'place' }}
                tintColor={BRAND.primary}
                size={14}
              />
              <ThemedText style={styles.metaText}>{b.location}</ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.amountRow}>
              <ThemedText style={styles.amountLabel}>{t('amountPaid')}</ThemedText>
              <ThemedText style={styles.amountValue}>{b.amount}</ThemedText>
            </View>

            {b.status === 'upcoming' ? (
              <View style={styles.actionsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.btnOutline,
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={styles.btnOutlineText}>{t('reschedule')}</ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.btnPrimary,
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={styles.btnPrimaryText}>{t('viewDetails')}</ThemedText>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.btnOutlineFull,
                  pressed && styles.pressed,
                ]}>
                <ThemedText style={styles.btnOutlineFullText}>{t('viewDetails')}</ThemedText>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.three },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#FFE7CF', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },
  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  bookingTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: BRAND.text },
  panditName: { fontSize: 13, color: BRAND.textSecondary, marginTop: -2 },
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  metaText: { fontSize: 12, color: BRAND.textSecondary },
  divider: {
    height: 1,
    backgroundColor: BRAND.border,
    marginVertical: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: { fontSize: 13, color: BRAND.textSecondary },
  amountValue: { fontSize: 16, fontWeight: '800', color: BRAND.amount },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.card,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnOutlineText: { fontSize: 13, fontWeight: '700', color: BRAND.text },
  btnPrimary: {
    flex: 1,
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnPrimaryText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  btnOutlineFull: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: BRAND.primary,
    backgroundColor: BRAND.card,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnOutlineFullText: { fontSize: 13, fontWeight: '700', color: BRAND.primary },
  pressed: { opacity: 0.85 },
});
