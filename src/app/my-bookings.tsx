import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ApiService, type UserBooking } from '@/constants/api';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/LanguageContext';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  pendingBg: '#FFF1DE',
  pendingText: '#C95A0E',
  completedBg: '#D5F1DE',
  completedText: '#15803D',
  failedBg: '#FEE2E2',
  failedText: '#DC2626',
  amount: '#E8731C',
};

function statusStyle(status: string) {
  const s = status.toUpperCase();
  if (s === 'COMPLETED' || s === 'SUCCESS') return { bg: BRAND.completedBg, text: BRAND.completedText };
  if (s === 'FAILED' || s === 'CANCELLED') return { bg: BRAND.failedBg, text: BRAND.failedText };
  return { bg: BRAND.pendingBg, text: BRAND.pendingText };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

export default function MyBookingsScreen() {
  const t = useT();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getMyBookings().then(data => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

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

      {loading ? (
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 48 }} />
      ) : bookings.length === 0 ? (
        <View style={styles.emptyWrap}>
          <ThemedText style={styles.emptyEmoji}>🙏</ThemedText>
          <ThemedText style={styles.emptyText}>No bookings yet</ThemedText>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {bookings.map(b => {
            const st = statusStyle(b.status);
            return (
              <View key={b.id} style={styles.card}>
                {/* Title + status */}
                <View style={styles.cardHeader}>
                  <ThemedText style={styles.bookingTitle} numberOfLines={2}>{b.title}</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <ThemedText style={[styles.statusText, { color: st.text }]}>{b.status}</ThemedText>
                  </View>
                </View>

                {/* Subtitle / type */}
                {!!b.subtitle && (
                  <ThemedText style={styles.subtitle}>{b.subtitle}</ThemedText>
                )}
                <ThemedText style={styles.bookingType}>{b.booking_type}</ThemedText>

                {/* Meta */}
                <View style={styles.metaRow}>
                  <SymbolView
                    name={{ ios: 'person.fill', android: 'person', web: 'person' }}
                    tintColor={BRAND.primary}
                    size={13}
                  />
                  <ThemedText style={styles.metaText}>{b.booking_name} · {b.mobile_number}</ThemedText>
                </View>

                <View style={styles.metaRow}>
                  <SymbolView
                    name={{ ios: 'calendar', android: 'event', web: 'event' }}
                    tintColor={BRAND.primary}
                    size={13}
                  />
                  <ThemedText style={styles.metaText}>
                    Booked on {formatDate(b.create_date)} · Puja on {formatDate(b.booking_date)}
                  </ThemedText>
                </View>

                <View style={styles.divider} />

                <View style={styles.amountRow}>
                  <ThemedText style={styles.amountLabel}>{t('amountPaid')}</ThemedText>
                  <ThemedText style={styles.amountValue}>₹{b.amount.toLocaleString('en-IN')}</ThemedText>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#FFE7CF', marginTop: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: BRAND.textSecondary, fontWeight: '600' },

  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1, borderColor: BRAND.border,
    borderRadius: 14, padding: 14, gap: 8,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 10,
  },
  bookingTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: BRAND.text, lineHeight: 20 },
  subtitle: { fontSize: 12, color: BRAND.primary, fontWeight: '600', marginTop: -4 },
  bookingType: { fontSize: 11, color: BRAND.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, flexShrink: 0 },
  statusText: { fontSize: 11, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 12, color: BRAND.textSecondary, flex: 1 },
  divider: { height: 1, backgroundColor: BRAND.border, marginVertical: 2 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountLabel: { fontSize: 13, color: BRAND.textSecondary },
  amountValue: { fontSize: 16, fontWeight: '800', color: BRAND.amount },
  pressed: { opacity: 0.85 },
});
