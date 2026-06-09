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
  avatarBg: '#FFE7CF',
};

type IconName = { ios: string; android: string; web: string };
const ICON_SPARK: IconName = { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' };

type Healing = { titleKey: TranslationKey; descKey: TranslationKey };
const HEALING_TYPES: Healing[] = [
  { titleKey: 'reikiHealing', descKey: 'reikiHealingDesc' },
  { titleKey: 'pranicHealing', descKey: 'pranicHealingDesc' },
  { titleKey: 'crystalHealing', descKey: 'crystalHealingDesc' },
  { titleKey: 'soundHealing', descKey: 'soundHealingDesc' },
];

type Agent = { name: string; specialityKey: TranslationKey; experience: number };
const AGENTS: Agent[] = [
  { name: 'Dr. Anjali Verma', specialityKey: 'reikiMaster', experience: 12 },
  { name: 'Guru Prakash Sharma', specialityKey: 'pranicHealing', experience: 15 },
];

export default function HealingScreen() {
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
          <ThemedText style={styles.headerTitle}>{t('healingServicesTitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.sectionTitle}>{t('typesOfHealing')}</ThemedText>
        <View style={styles.grid}>
          {HEALING_TYPES.map(h => (
            <View key={h.titleKey} style={styles.typeCard}>
              <View style={styles.typeIcon}>
                <SymbolView name={ICON_SPARK} tintColor={BRAND.primary} size={18} />
              </View>
              <ThemedText style={styles.typeTitle}>{t(h.titleKey)}</ThemedText>
              <ThemedText style={styles.typeDesc}>{t(h.descKey)}</ThemedText>
            </View>
          ))}
        </View>

        <ThemedText style={styles.sectionTitle}>{t('healingAgents')}</ThemedText>
        <View style={{ gap: Spacing.three }}>
          {AGENTS.map(a => (
            <View key={a.name} style={styles.agentCard}>
              <View style={styles.agentRow}>
                <View style={styles.avatar}>
                  <SymbolView
                    name={{ ios: 'person.fill', android: 'person', web: 'person' }}
                    tintColor={BRAND.primary}
                    size={22}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.agentName}>{a.name}</ThemedText>
                  <ThemedText style={styles.agentMeta}>{t(a.specialityKey)}</ThemedText>
                  <ThemedText style={styles.agentMeta}>
                    {t('experienceLabel')}: {a.experience} {t('years')}
                  </ThemedText>
                </View>
              </View>
              <Pressable style={({ pressed }) => [styles.bookBtn, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'heart', android: 'favorite_border', web: 'favorite_border' }}
                  tintColor="#FFFFFF"
                  size={14}
                />
                <ThemedText style={styles.bookText}>{t('bookSession')}</ThemedText>
              </Pressable>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  typeCard: {
    width: '48.5%',
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: BRAND.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTitle: { fontSize: 14, fontWeight: '800', color: BRAND.primary },
  typeDesc: { fontSize: 12, color: BRAND.textSecondary, lineHeight: 16 },
  agentCard: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: Spacing.three,
    gap: 12,
  },
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentName: { fontSize: 15, fontWeight: '800', color: BRAND.text },
  agentMeta: { fontSize: 12, color: BRAND.textSecondary, marginTop: 2 },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    height: 42,
  },
  bookText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
