import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
  inputBorder: '#E5DCC8',
  selectedBg: '#FFF1DE',
  disabledBg: '#CFC4B0',
};

const SERVICES: { key: TranslationKey; price: string }[] = [
  { key: 'satyanarayanPuja', price: '₹1,100' },
  { key: 'grihaPravesh', price: '₹2,100' },
  { key: 'weddingCeremony', price: '₹5,100' },
  { key: 'abhishek', price: '₹700' },
  { key: 'havan', price: '₹3,100' },
];

const PANDITS: { key: TranslationKey; price: string; exp: string }[] = [
  { key: 'panditRameshSharma', price: '₹1,500', exp: '15 yrs' },
  { key: 'panditSureshKumar', price: '₹1,200', exp: '10 yrs' },
  { key: 'shriRamMandir', price: '₹2,000', exp: '25 yrs' },
  { key: 'kashiVishwanath', price: '₹2,500', exp: '30 yrs' },
];

const TIMES = ['6:00 AM', '8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];

const STEP_LABELS: TranslationKey[] = ['selectService', 'chooseDateTime', 'selectPanditji', 'payment'];

export default function BookPoojaScreen() {
  const t = useT();
  const [step, setStep] = useState(1);
  const [service, setService] = useState<TranslationKey>('satyanarayanPuja');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [pandit, setPandit] = useState<TranslationKey | ''>('');

  const canProceed =
    (step === 1 && !!service) ||
    (step === 2 && !!date && !!time) ||
    (step === 3 && !!pandit);

  const onNext = () => {
    if (!canProceed) return;
    if (step < 3) { setStep(step + 1); return; }
    router.push({
      pathname: '/payment',
      params: { service: service as string, provider: pandit, date, time },
    });
  };

  const onBack = () => {
    if (step === 1) { router.back(); return; }
    setStep(step - 1);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <Pressable
            onPress={onBack}
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              tintColor="#FFFFFF"
              size={18}
            />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{t('bookServiceTitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Stepper current={step} labels={STEP_LABELS.map(k => t(k))} />

        <View style={styles.card}>
          {/* Step 1 — Select Puja */}
          {step === 1 && (
            <>
              <ThemedText style={styles.sectionTitle}>{t('selectService')}</ThemedText>
              <View style={{ gap: 10 }}>
                {SERVICES.map(s => (
                  <Pressable
                    key={s.key}
                    onPress={() => setService(s.key)}
                    style={({ pressed }) => [
                      styles.serviceRow,
                      service === s.key && styles.serviceRowSelected,
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText style={[styles.serviceLabel, service === s.key && styles.serviceLabelSelected]}>
                      {t(s.key)}
                    </ThemedText>
                    <ThemedText style={[styles.servicePrice, service === s.key && styles.servicePriceSelected]}>
                      {s.price}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Step 2 — Select Date & Time */}
          {step === 2 && (
            <>
              <ThemedText style={styles.sectionTitle}>{t('chooseDateAndTime')}</ThemedText>
              <View style={styles.dateLabelRow}>
                <SymbolView
                  name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
                  tintColor={BRAND.primary}
                  size={14}
                />
                <ThemedText style={styles.dateLabel}>{t('selectDate')}</ThemedText>
              </View>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={BRAND.textSecondary}
                style={styles.input}
              />
              <ThemedText style={styles.sectionSubtitle}>{t('chooseTime')}</ThemedText>
              <View style={styles.timeGrid}>
                {TIMES.map(tm => (
                  <Pressable
                    key={tm}
                    onPress={() => setTime(tm)}
                    style={({ pressed }) => [
                      styles.timeChip,
                      time === tm && styles.timeChipSelected,
                      pressed && styles.pressed,
                    ]}>
                    <SymbolView
                      name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                      tintColor={time === tm ? BRAND.primary : BRAND.textSecondary}
                      size={13}
                    />
                    <ThemedText style={[styles.timeChipText, time === tm && styles.timeChipTextSelected]}>
                      {tm}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Step 3 — Select Panditji with Pricing */}
          {step === 3 && (
            <>
              <ThemedText style={styles.sectionTitle}>{t('selectPanditji')}</ThemedText>
              <View style={{ gap: 10 }}>
                {PANDITS.map(p => (
                  <Pressable
                    key={p.key}
                    onPress={() => setPandit(p.key)}
                    style={({ pressed }) => [
                      styles.panditRow,
                      pandit === p.key && styles.panditRowSelected,
                      pressed && styles.pressed,
                    ]}>
                    <View style={styles.panditAvatar}>
                      <SymbolView
                        name={{ ios: 'person.fill', android: 'person', web: 'person' }}
                        tintColor={pandit === p.key ? BRAND.primary : BRAND.textSecondary}
                        size={20}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.panditName, pandit === p.key && styles.panditNameSelected]}>
                        {t(p.key)}
                      </ThemedText>
                      <ThemedText style={styles.panditExp}>{t('experienceLabel')}: {p.exp}</ThemedText>
                    </View>
                    <ThemedText style={[styles.panditPrice, pandit === p.key && styles.panditPriceSelected]}>
                      {p.price}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>

        <Pressable
          onPress={onNext}
          disabled={!canProceed}
          style={({ pressed }) => [
            styles.cta,
            !canProceed && styles.ctaDisabled,
            pressed && canProceed && styles.pressed,
          ]}>
          <ThemedText style={styles.ctaText}>
            {step === 3 ? t('proceedToPayment') : t('next')}
          </ThemedText>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            tintColor="#FFFFFF"
            size={14}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stepper({ current, labels }: { current: number; labels: string[] }) {
  return (
    <View style={styles.stepperWrap}>
      <View style={styles.stepperRow}>
        {[1, 2, 3, 4].map((n, i) => (
          <View key={n} style={styles.stepperItem}>
            <View style={[styles.stepCircle, n <= current ? styles.stepCircleActive : styles.stepCircleInactive]}>
              {n < current ? (
                <SymbolView
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  tintColor="#FFFFFF"
                  size={12}
                />
              ) : (
                <ThemedText style={[styles.stepNum, n <= current ? styles.stepNumActive : styles.stepNumInactive]}>
                  {n}
                </ThemedText>
              )}
            </View>
            {i < 3 && (
              <View style={[styles.stepLine, n < current ? styles.stepLineActive : styles.stepLineInactive]} />
            )}
          </View>
        ))}
      </View>
      <View style={styles.stepLabelsRow}>
        {labels.map((label, i) => (
          <ThemedText
            key={label}
            style={[styles.stepLabel, i + 1 === current && styles.stepLabelActive]}
            numberOfLines={1}>
            {label}
          </ThemedText>
        ))}
      </View>
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
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },

  stepperWrap: { gap: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center' },
  stepperItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: BRAND.primary },
  stepCircleInactive: { backgroundColor: '#E0D6C2' },
  stepNum: { fontSize: 12, fontWeight: '800' },
  stepNumActive: { color: '#FFFFFF' },
  stepNumInactive: { color: BRAND.textSecondary },
  stepLine: { flex: 1, height: 2, marginHorizontal: 2 },
  stepLineActive: { backgroundColor: BRAND.primary },
  stepLineInactive: { backgroundColor: '#E0D6C2' },
  stepLabelsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepLabel: { fontSize: 9, color: BRAND.textSecondary, flex: 1, textAlign: 'center' },
  stepLabelActive: { color: BRAND.primary, fontWeight: '700' },

  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: Spacing.three,
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },
  sectionSubtitle: { fontSize: 14, fontWeight: '700', color: BRAND.text, marginTop: 4 },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  serviceRowSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.selectedBg },
  serviceLabel: { fontSize: 14, fontWeight: '600', color: BRAND.text },
  serviceLabelSelected: { color: BRAND.primary },
  servicePrice: { fontSize: 13, fontWeight: '700', color: BRAND.textSecondary },
  servicePriceSelected: { color: BRAND.primary },

  dateLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateLabel: { fontSize: 13, fontWeight: '600', color: BRAND.primary },
  input: {
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: BRAND.text,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null),
  },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '47%',
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  timeChipSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.selectedBg },
  timeChipText: { fontSize: 13, fontWeight: '600', color: BRAND.text },
  timeChipTextSelected: { color: BRAND.primary },

  panditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  panditRowSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.selectedBg },
  panditAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EAE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panditName: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  panditNameSelected: { color: BRAND.primary },
  panditExp: { fontSize: 11, color: BRAND.textSecondary, marginTop: 2 },
  panditPrice: { fontSize: 15, fontWeight: '800', color: BRAND.textSecondary },
  panditPriceSelected: { color: BRAND.primary },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BRAND.primary,
    borderRadius: 12,
    height: 48,
  },
  ctaDisabled: { backgroundColor: BRAND.disabledBg },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
