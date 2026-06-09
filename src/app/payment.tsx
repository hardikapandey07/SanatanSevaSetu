import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
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
  disabledBg: '#CFC4B0',
};

type IconName = { ios: string; android: string; web: string };
const PAYMENT_METHODS: { key: 'upi' | 'creditDebitCard'; icon: IconName }[] = [
  { key: 'upi', icon: { ios: 'iphone', android: 'smartphone', web: 'smartphone' } },
  {
    key: 'creditDebitCard',
    icon: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' },
  },
];

export default function PaymentScreen() {
  const t = useT();
  const params = useLocalSearchParams<{
    service?: string;
    provider?: string;
    date?: string;
    time?: string;
  }>();
  const [method, setMethod] = useState<'upi' | 'creditDebitCard' | ''>('');

  const serviceLabel = params.service ? t(params.service as TranslationKey) : '';
  const providerLabel = params.provider ? t(params.provider as TranslationKey) : '';
  const dateTime =
    params.date && params.time ? `${formatDate(params.date)} at ${params.time}` : '';

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <ThemedText style={styles.headerTitle}>{t('paymentTitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t('bookingSummary')}</ThemedText>
          <SummaryRow label={t('service')} value={serviceLabel} />
          <SummaryRow label={t('provider')} value={providerLabel} />
          <SummaryRow label={t('dateAndTime')} value={dateTime} />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>{t('totalAmount')}</ThemedText>
            <ThemedText style={styles.totalValue}>₹2100</ThemedText>
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
            </Pressable>
          ))}
        </View>

        <Pressable
          disabled={!method}
          onPress={() => router.replace('/(tabs)/home')}
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
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
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
  methodRowSelected: { borderColor: BRAND.primary, backgroundColor: '#FFF1DE' },
  methodIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BRAND.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: { fontSize: 14, fontWeight: '700', color: BRAND.text },

  cta: {
    backgroundColor: BRAND.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: BRAND.disabledBg },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  ctaTextDisabled: { color: '#F5F0E5' },
  pressed: { opacity: 0.85 },
});
