import { LinearGradient } from 'expo-linear-gradient';
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
  imagePlaceholder: '#FDE2D0',
  tagBg: '#FFF1DE',
  tagText: '#C95A0E',
};

type EventItem = {
  tagKey: TranslationKey;
  titleKey: TranslationKey;
  date: string;
  time: string;
  speakerKey: TranslationKey;
};

const EVENTS: EventItem[] = [
  {
    tagKey: 'webinar',
    titleKey: 'bhagavadGitaTeachings',
    date: 'May 5, 2026',
    time: '6:00 PM',
    speakerKey: 'speakerSwamiRamdev',
  },
  {
    tagKey: 'chanting',
    titleKey: 'omNamahShivayaChanting',
    date: 'May 7, 2026',
    time: '5:30 PM',
    speakerKey: 'speakerPanditSureshKumar',
  },
];

export default function EventsScreen() {
  const t = useT();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <ThemedText style={styles.headerTitle}>{t('eventsTitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {EVENTS.map(ev => (
          <View key={ev.titleKey} style={styles.card}>
            <View style={styles.imageBox}>
              <SymbolView
                name={{ ios: 'photo', android: 'image', web: 'image' }}
                tintColor="#D5BBA0"
                size={40}
              />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.tag}>
                <ThemedText style={styles.tagText}>{t(ev.tagKey)}</ThemedText>
              </View>
              <ThemedText style={styles.cardTitle}>{t(ev.titleKey)}</ThemedText>
              <View style={styles.metaRow}>
                <SymbolView
                  name={{ ios: 'calendar', android: 'event', web: 'event' }}
                  tintColor={BRAND.primary}
                  size={13}
                />
                <ThemedText style={styles.metaText}>
                  {ev.date} at {ev.time}
                </ThemedText>
              </View>
              <ThemedText style={styles.speakerText}>{t(ev.speakerKey)}</ThemedText>
              <Pressable style={({ pressed }) => [styles.joinBtn, pressed && styles.pressed]}>
                <ThemedText style={styles.joinBtnText}>{t('joinEvent')}</ThemedText>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.three },
  headerInner: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.two },
  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  imageBox: {
    height: 140,
    backgroundColor: BRAND.imagePlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 14, gap: 6 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: BRAND.tagBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  tagText: { color: BRAND.tagText, fontSize: 11, fontWeight: '700' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: BRAND.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaText: { fontSize: 12, color: BRAND.textSecondary },
  speakerText: { fontSize: 12, color: BRAND.textSecondary },
  joinBtn: {
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  joinBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
