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
  inactive: '#D9CFBC',
  selectedBg: '#FFF1DE',
  disabledBg: '#CFC4B0',
};

const SERVICES: TranslationKey[] = [
  'satyanarayanPuja',
  'grihaPravesh',
  'weddingCeremony',
  'abhishek',
  'havan',
];

const PROVIDERS: TranslationKey[] = ['panditRameshSharma', 'panditSureshKumar', 'shriRamMandir', 'kashiVishwanath'];

const TIMES = ['6:00 AM', '8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];

export default function BookPoojaScreen() {
  const t = useT();
  const [step, setStep] = useState(1);
  const [service, setService] = useState<TranslationKey>('satyanarayanPuja');
  const [provider, setProvider] = useState<TranslationKey | ''>('');
  const [date, setDate] = useState('2026-06-09');
  const [time, setTime] = useState('');

  const canProceed =
    (step === 1 && date) ||
    (step === 2 && provider) ||
    (step === 3 && time);

  const onNext = () => {
    if (!canProceed) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    router.push({
      pathname: '/payment',
      params: {
        service: service as string,
        provider,
        date,
        time,
      },
    });
  };

  const onBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
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
        <Stepper current={step} />

        <View style={styles.card}>
          {step === 1 ? (
            <>
              <ThemedText style={styles.sectionTitle}>{t('chooseDate')}</ThemedText>
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
            </>
          ) : null}

          {step === 2 ? (
            <>
              <ThemedText style={styles.sectionTitle}>{t('selectPanditTemple')}</ThemedText>
              <View style={{ gap: 10 }}>
                {PROVIDERS.map(p => (
                  <SelectableRow
                    key={p}
                    label={t(p)}
                    selected={provider === p}
                    onPress={() => setProvider(p)}
                  />
                ))}
              </View>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <ThemedText style={styles.sectionTitle}>{t('chooseTime')}</ThemedText>
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
                    <ThemedText
                      style={[styles.timeChipText, time === tm && styles.timeChipTextSelected]}>
                      {tm}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
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

function Stepper({ current }: { current: number }) {
  const steps = [1, 2, 3];
  return (
    <View style={styles.stepperRow}>
      {steps.map((n, i) => (
        <View key={n} style={styles.stepperItem}>
          <View
            style={[
              styles.stepCircle,
              n <= current ? styles.stepCircleActive : styles.stepCircleInactive,
            ]}>
            <ThemedText
              style={[
                styles.stepNum,
                n <= current ? styles.stepNumActive : styles.stepNumInactive,
              ]}>
              {n}
            </ThemedText>
          </View>
          {i < steps.length - 1 ? (
            <View
              style={[
                styles.stepLine,
                n < current ? styles.stepLineActive : styles.stepLineInactive,
              ]}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

function SelectableRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectRow,
        selected && styles.selectRowSelected,
        pressed && styles.pressed,
      ]}>
      <ThemedText style={[styles.selectRowText, selected && styles.selectRowTextSelected]}>
        {label}
      </ThemedText>
    </Pressable>
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

  stepperRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  stepperItem: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
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
  stepLine: { width: 50, height: 2, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: BRAND.primary },
  stepLineInactive: { backgroundColor: '#E0D6C2' },

  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: Spacing.three,
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },

  selectRow: {
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  selectRowSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.selectedBg },
  selectRowText: { fontSize: 14, fontWeight: '600', color: BRAND.text },
  selectRowTextSelected: { color: BRAND.primary },

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
