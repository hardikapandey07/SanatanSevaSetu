import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
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
  disabledBg: '#CFC4B0',
  successBg: '#F0FFF4',
  successText: '#16A34A',
};

type IconName = { ios: string; android: string; web: string };
const PAYMENT_METHODS: { key: 'upi' | 'creditDebitCard'; icon: IconName }[] = [
  { key: 'upi', icon: { ios: 'iphone', android: 'smartphone', web: 'smartphone' } },
  { key: 'creditDebitCard', icon: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' } },
];

const RATINGS = [1, 2, 3, 4, 5];

export default function PaymentScreen() {
  const t = useT();
  const params = useLocalSearchParams<{ service?: string; provider?: string; date?: string; time?: string }>();
  const [method, setMethod] = useState<'upi' | 'creditDebitCard' | ''>('');
  const [paid, setPaid] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const serviceLabel = params.service ? t(params.service as TranslationKey) : '';
  const providerLabel = params.provider ? t(params.provider as TranslationKey) : '';
  const dateTime = params.date && params.time ? `${formatDate(params.date)} at ${params.time}` : '';

  if (submitted) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center', padding: Spacing.five }]}>
        <View style={styles.successIcon}>
          <SymbolView
            name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }}
            tintColor={BRAND.successText}
            size={48}
          />
        </View>
        <ThemedText style={styles.successTitle}>{t('feedbackThanksTitle')}</ThemedText>
        <ThemedText style={styles.successMsg}>{t('feedbackThanksMsg')}</ThemedText>
        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          style={({ pressed }) => [styles.cta, { marginTop: Spacing.four }, pressed && styles.pressed]}>
          <ThemedText style={styles.ctaText}>{t('backToHome')}</ThemedText>
        </Pressable>
      </View>
    );
  }

  if (paid) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[BRAND.primary, BRAND.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}>
          <SafeAreaView edges={['top']} style={styles.headerInner}>
            <ThemedText style={styles.headerTitle}>{t('feedbackTitle')}</ThemedText>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { alignItems: 'center', gap: 16 }]}>
            <View style={styles.successIcon}>
              <SymbolView
                name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                tintColor={BRAND.successText}
                size={40}
              />
            </View>
            <ThemedText style={styles.paymentSuccessText}>{t('paymentSuccessful')}</ThemedText>
            <ThemedText style={styles.paymentSuccessSubtitle}>{serviceLabel} {t('bookingConfirmedMsg')}</ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>{t('rateExperience')}</ThemedText>
            <ThemedText style={styles.feedbackSubtitle}>{t('rateExperienceSubtitle')}</ThemedText>
            <View style={styles.starsRow}>
              {RATINGS.map(r => (
                <Pressable key={r} onPress={() => setRating(r)} style={({ pressed }) => [pressed && styles.pressed]}>
                  <SymbolView
                    name={{ ios: rating >= r ? 'star.fill' : 'star', android: rating >= r ? 'star' : 'star_border', web: rating >= r ? 'star' : 'star_border' }}
                    tintColor={rating >= r ? '#F59E0B' : BRAND.textSecondary}
                    size={36}
                  />
                </Pressable>
              ))}
            </View>
            <ThemedText style={styles.feedbackSubtitle}>{t('feedbackComment')}</ThemedText>
            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              placeholder={t('feedbackPlaceholder')}
              placeholderTextColor={BRAND.textSecondary}
              multiline
              numberOfLines={4}
              style={styles.feedbackInput}
            />
          </View>

          <Pressable
            onPress={() => setSubmitted(true)}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
            <ThemedText style={styles.ctaText}>{t('submitFeedback')}</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => router.replace('/(tabs)/home')}
            style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}>
            <ThemedText style={styles.skipText}>{t('skipFeedback')}</ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

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
          <ThemedText style={styles.headerTitle}>{t('paymentTitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t('bookingSummary')}</ThemedText>
          <SummaryRow label={t('service')} value={serviceLabel} />
          <SummaryRow label={t('provider')} value={providerLabel} />
          <SummaryRow label={t('dateAndTime')} value={dateTime} />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>{t('totalAmount')}</ThemedText>
            <ThemedText style={styles.totalValue}>₹2,100</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t('paymentMethod')}</ThemedText>
          {PAYMENT_METHODS.map(m => (
            <Pressable
              key={m.key}
              onPress={() => setMethod(m.key)}
              style={({ pressed }) => [
                styles.methodRow,
                method === m.key && styles.methodRowSelected,
                pressed && styles.pressed,
              ]}>
              <View style={styles.methodIcon}>
                <SymbolView name={m.icon} tintColor={BRAND.primary} size={18} />
              </View>
              <ThemedText style={styles.methodText}>{t(m.key)}</ThemedText>
              {method === m.key && (
                <SymbolView
                  name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                  tintColor={BRAND.primary}
                  size={18}
                />
              )}
            </Pressable>
          ))}
        </View>

        <Pressable
          disabled={!method}
          onPress={() => setPaid(true)}
          style={({ pressed }) => [
            styles.cta,
            !method && styles.ctaDisabled,
            pressed && method && styles.pressed,
          ]}>
          <ThemedText style={[styles.ctaText, !method && styles.ctaTextDisabled]}>
            {t('confirmPayment')}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <ThemedText style={styles.summaryLabel}>{label}</ThemedText>
      <ThemedText style={styles.summaryValue}>{value}</ThemedText>
    </View>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },

  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: Spacing.three,
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: BRAND.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '700', color: BRAND.text, flexShrink: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: BRAND.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: '800', color: BRAND.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: BRAND.primary },

  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  methodRowSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.iconBg },
  methodIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BRAND.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: { flex: 1, fontSize: 14, fontWeight: '700', color: BRAND.text },

  cta: {
    backgroundColor: BRAND.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  ctaDisabled: { backgroundColor: BRAND.disabledBg },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  ctaTextDisabled: { color: '#F5F0E5' },

  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { color: BRAND.textSecondary, fontSize: 14, fontWeight: '600' },

  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BRAND.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  successTitle: { fontSize: 20, fontWeight: '800', color: BRAND.text, textAlign: 'center' },
  successMsg: { fontSize: 14, color: BRAND.textSecondary, textAlign: 'center', marginTop: 4 },
  paymentSuccessText: { fontSize: 18, fontWeight: '800', color: BRAND.successText },
  paymentSuccessSubtitle: { fontSize: 13, color: BRAND.textSecondary, textAlign: 'center' },

  feedbackSubtitle: { fontSize: 13, color: BRAND.textSecondary },
  starsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  feedbackInput: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: BRAND.text,
    backgroundColor: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null),
  },
  pressed: { opacity: 0.85 },
});
