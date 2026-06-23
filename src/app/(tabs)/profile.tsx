import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { TokenManager } from '@/constants/api';
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
  upcomingBg: '#FFF1DE',
  upcomingText: '#C95A0E',
  completedBg: '#D5F1DE',
  completedText: '#15803D',
  logoutColor: '#DC2626',
};

type Booking = {
  title: string;
  pandit: string;
  date: string;
  status: 'upcoming' | 'completed';
};

const BOOKINGS: Booking[] = [
  { title: 'Satyanarayan Puja',  pandit: 'Pt. Ramesh Sharma', date: 'Aug 28, 2025', status: 'completed' },
  { title: 'Grihapravesh',       pandit: 'Pt. Suresh Joshi',  date: 'Sep 15, 2025', status: 'upcoming' },
  { title: 'Vastu Shastra Puja', pandit: 'Pt. Hari Prasad',   date: 'Oct 3, 2025',  status: 'upcoming' },
];

type SavedTemple = { name: string; location: string };
const SAVED_TEMPLES: SavedTemple[] = [
  { name: 'Siddhivinayak Temple', location: 'Mumbai, Maharashtra' },
  { name: 'Kashi Vishwanath',     location: 'Varanasi, UP' },
];

type MenuRow = { labelKey: TranslationKey; icon: { ios: string; android: string; web: string }; value?: string; route?: string };
const MENU: MenuRow[] = [
  { labelKey: 'rewardAndReferral',  icon: { ios: 'gift.fill',            android: 'card_giftcard', web: 'card_giftcard' }, route: '/reward-referral' },
  { labelKey: 'languageSettings',  icon: { ios: 'character.bubble',     android: 'translate',     web: 'translate' } },
  { labelKey: 'suggestions',       icon: { ios: 'bubble.left.fill',     android: 'chat',          web: 'chat' }, route: '/suggestion' },
  { labelKey: 'notifications',     icon: { ios: 'bell.fill',            android: 'notifications', web: 'notifications' }, route: '/notifications' },
];

export default function ProfileScreen() {
  const t = useT();
  const [userName, setUserName] = useState('');
  const [userMobile, setUserMobile] = useState('');

  useEffect(() => {
    TokenManager.getUserProfile().then(profile => {
      if (profile.name) setUserName(profile.name);
      if (profile.mobile) setUserMobile(profile.mobile);
    });
  }, []);

  const displayName = userName || t('profileName');
  const displayMobile = userMobile ? `+91 ${userMobile.slice(0, 5)} ${userMobile.slice(5)}` : t('profilePhone');
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          {/* Edit button */}
          <Pressable style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
              tintColor="#FFFFFF"
              size={16}
            />
          </Pressable>

          {/* Avatar + info */}
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{avatarLetter}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.profileName}>{displayName}</ThemedText>
              <ThemedText style={styles.profileMeta}>{displayMobile}</ThemedText>
              <View style={styles.ratingRow}>
                <ThemedText style={styles.starEmoji}>⭐</ThemedText>
                <ThemedText style={styles.ratingText}>4.9 · {t('devoteeSince')}</ThemedText>
              </View>
            </View>
          </View>

          {/* Reward Points pill */}
          <Pressable style={({ pressed }) => [styles.rewardPill, pressed && styles.pressed]}>
            <ThemedText style={styles.rewardEmoji}>🎁</ThemedText>
            <ThemedText style={styles.rewardText}>1,240 {t('rewardPoints')}</ThemedText>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              tintColor="rgba(255,255,255,0.8)"
              size={12}
            />
          </Pressable>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* My Bookings */}
        <ThemedText style={styles.sectionTitle}>{t('myBookings')}</ThemedText>
        <View style={styles.card}>
          {BOOKINGS.map((b, i) => (
            <View key={b.title} style={[styles.bookingRow, i < BOOKINGS.length - 1 && styles.bookingDivider]}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.bookingTitle}>{b.title}</ThemedText>
                <ThemedText style={styles.bookingMeta}>{b.pandit} · {b.date}</ThemedText>
              </View>
              <View style={[styles.statusBadge, b.status === 'completed' ? styles.statusCompleted : styles.statusUpcoming]}>
                <ThemedText style={[styles.statusText, b.status === 'completed' ? styles.statusCompletedText : styles.statusUpcomingText]}>
                  {b.status === 'completed' ? t('completed') : t('upcoming')}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Saved Temples */}
        <ThemedText style={styles.sectionTitle}>{t('savedTemples')}</ThemedText>
        <View style={styles.card}>
          {SAVED_TEMPLES.map((temple, i) => (
            <View key={temple.name} style={[styles.templeRow, i < SAVED_TEMPLES.length - 1 && styles.bookingDivider]}>
              <View style={styles.templeIcon}>
                <ThemedText style={{ fontSize: 20 }}>🛕</ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.bookingTitle}>{temple.name}</ThemedText>
                <ThemedText style={styles.bookingMeta}>{temple.location}</ThemedText>
              </View>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                tintColor={BRAND.textSecondary}
                size={14}
              />
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.card}>
          {MENU.map((row, i) => (
            <Pressable
              key={row.labelKey}
              onPress={() => {
                if (row.labelKey === 'languageSettings') router.push('/language-settings');
                else if (row.labelKey === 'rewardAndReferral') router.push('/reward-referral');
                else if (row.route) router.push(row.route as never);
              }}
              style={({ pressed }) => [
                styles.menuRow,
                i < MENU.length - 1 && styles.bookingDivider,
                pressed && styles.pressed,
              ]}>
              <View style={styles.menuIconBg}>
                <SymbolView name={row.icon} tintColor={BRAND.primary} size={16} />
              </View>
              <ThemedText style={styles.menuLabel}>{t(row.labelKey)}</ThemedText>
              {row.value && <ThemedText style={styles.menuValue}>{row.value}</ThemedText>}
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                tintColor={BRAND.textSecondary}
                size={14}
              />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={async () => {
            await TokenManager.clearToken();
            router.replace('/');
          }}
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}>
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
  headerInner: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: 14 },
  editBtn: {
    alignSelf: 'flex-end',
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  profileName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  profileMeta: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  starEmoji: { fontSize: 12 },
  ratingText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  rewardPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  rewardEmoji: { fontSize: 16 },
  rewardText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: BRAND.text },

  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1, borderColor: BRAND.border,
    borderRadius: 14, overflow: 'hidden',
  },

  bookingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14, gap: 10,
  },
  bookingDivider: { borderBottomWidth: 1, borderBottomColor: BRAND.border },
  bookingTitle: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  bookingMeta: { fontSize: 12, color: BRAND.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  statusUpcoming: { backgroundColor: BRAND.upcomingBg },
  statusCompleted: { backgroundColor: BRAND.completedBg },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusUpcomingText: { color: BRAND.upcomingText },
  statusCompletedText: { color: BRAND.completedText },

  templeRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 12,
  },
  templeIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#FFF1DE',
    alignItems: 'center', justifyContent: 'center',
  },

  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  menuIconBg: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FFF1DE',
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: BRAND.text },
  menuValue: { fontSize: 13, color: BRAND.textSecondary, marginRight: 4 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: BRAND.logoutColor,
    borderRadius: 12, paddingVertical: 13,
    backgroundColor: BRAND.card,
  },
  logoutText: { color: BRAND.logoutColor, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
