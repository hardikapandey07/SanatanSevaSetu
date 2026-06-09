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
  iconBg: '#FFF1DE',
  progressTrack: '#EFE2CB',
};

type IconName = { ios: string; android: string; web: string };

type Module = {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  icon: IconName;
  lessons: number;
  duration: string;
};

const MODULES: Module[] = [
  {
    titleKey: 'beginnerLessons',
    descKey: 'beginnerLessonsDesc',
    icon: { ios: 'graduationcap.fill', android: 'school', web: 'school' },
    lessons: 12,
    duration: '4',
  },
  {
    titleKey: 'audioChanting',
    descKey: 'audioChantingDesc',
    icon: { ios: 'speaker.wave.2.fill', android: 'volume_up', web: 'volume_up' },
    lessons: 20,
    duration: '6',
  },
  {
    titleKey: 'practiceModules',
    descKey: 'practiceModulesDesc',
    icon: { ios: 'book.fill', android: 'book', web: 'book' },
    lessons: 15,
    duration: 'ongoing',
  },
];

type Progress = { labelKey: TranslationKey; value: number };
const PROGRESS: Progress[] = [
  { labelKey: 'sanskritVowels', value: 100 },
  { labelKey: 'sanskritConsonants', value: 75 },
  { labelKey: 'basicMantras', value: 50 },
  { labelKey: 'shlokasGita', value: 0 },
];

export default function SanskritLearningScreen() {
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
          <ThemedText style={styles.headerTitle}>{t('sanskritLearningTitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.sectionTitle}>{t('learningModules')}</ThemedText>
        <View style={{ gap: Spacing.three }}>
          {MODULES.map(m => (
            <View key={m.titleKey} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.iconBox}>
                  <SymbolView name={m.icon} tintColor={BRAND.primary} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.cardTitle}>{t(m.titleKey)}</ThemedText>
                  <ThemedText style={styles.cardDesc}>{t(m.descKey)}</ThemedText>
                  <ThemedText style={styles.cardMeta}>
                    {m.lessons} {t('lessons')}     {m.duration === 'ongoing' ? t('ongoing') : `${m.duration} ${t('weeks')}`}
                  </ThemedText>
                </View>
              </View>
              <Pressable style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
                <ThemedText style={styles.ctaText}>{t('startLearning')}</ThemedText>
              </Pressable>
            </View>
          ))}
        </View>

        <ThemedText style={styles.sectionTitle}>{t('myProgress')}</ThemedText>
        <View style={styles.progressCard}>
          {PROGRESS.map((p, i) => (
            <View key={p.labelKey} style={[styles.progressRow, i === PROGRESS.length - 1 && { marginBottom: 0 }]}>
              <View style={styles.progressLabelRow}>
                <ThemedText style={styles.progressLabel}>{t(p.labelKey)}</ThemedText>
                <ThemedText style={styles.progressValue}>{p.value}%</ThemedText>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${p.value}%` }]} />
              </View>
            </View>
          ))}
        </View>
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
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: BRAND.text, marginTop: Spacing.one },
  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: Spacing.three,
    gap: 12,
  },
  cardHead: { flexDirection: 'row', gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: BRAND.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: BRAND.text },
  cardDesc: { fontSize: 12, color: BRAND.textSecondary, marginTop: 2 },
  cardMeta: { fontSize: 12, color: BRAND.textSecondary, marginTop: 6 },
  cta: {
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  progressCard: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: Spacing.three,
  },
  progressRow: { marginBottom: 14 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 13, color: BRAND.text, fontWeight: '600' },
  progressValue: { fontSize: 13, fontWeight: '700', color: BRAND.primary },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND.progressTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: BRAND.primary,
    borderRadius: 3,
  },
  pressed: { opacity: 0.85 },
});
