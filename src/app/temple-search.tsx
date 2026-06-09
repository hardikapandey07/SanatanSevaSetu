import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
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
  avatarBg: '#FFE7CF',
};

type Temple = { name: string; deity: string; location: string; timings: string };
const TEMPLES: Temple[] = [
  { name: 'Shri Ram Mandir', deity: 'Lord Rama', location: 'Ayodhya, UP', timings: '5:00 AM - 9:00 PM' },
  { name: 'Kashi Vishwanath', deity: 'Lord Shiva', location: 'Varanasi, UP', timings: '3:00 AM - 11:00 PM' },
  { name: 'Tirupati Balaji', deity: 'Lord Venkateswara', location: 'Tirupati, AP', timings: '2:30 AM - 1:00 AM' },
  { name: 'Siddhivinayak Temple', deity: 'Lord Ganesha', location: 'Mumbai, MH', timings: '5:30 AM - 9:50 PM' },
];

export default function TempleSearchScreen() {
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
          <ThemedText style={styles.headerTitle}>{t('templeSearchTitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {TEMPLES.map(temple => (
          <TempleCard key={temple.name} temple={temple} t={t} />
        ))}
      </ScrollView>
    </View>
  );
}

function TempleCard({ temple, t }: { temple: Temple; t: (k: any) => string }) {
  return (
    <View style={styles.card}>
      <View style={styles.templeRow}>
        <View style={styles.avatar}>
          <SymbolView
            name={{ ios: 'building.columns.fill', android: 'temple_hindu', web: 'temple_hindu' }}
            tintColor={BRAND.primary}
            size={22}
          />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.templeName}>{temple.name}</ThemedText>
          <ThemedText style={styles.templeMeta}>
            {t('deity')}: {temple.deity}
          </ThemedText>
          <View style={styles.metaRow}>
            <SymbolView
              name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'place' }}
              tintColor={BRAND.textSecondary}
              size={12}
            />
            <ThemedText style={styles.templeMeta}>{temple.location}</ThemedText>
          </View>
          <View style={styles.metaRow}>
            <SymbolView
              name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
              tintColor={BRAND.textSecondary}
              size={12}
            />
            <ThemedText style={styles.templeMeta}>{temple.timings}</ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.actionRow}>
        <Pressable style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.outlineText}>{t('getDirections')}</ThemedText>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.filledBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.filledText}>{t('viewDetailsBtn')}</ThemedText>
        </Pressable>
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
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: Spacing.three,
    gap: 12,
  },
  templeRow: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: BRAND.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templeName: { fontSize: 15, fontWeight: '800', color: BRAND.text },
  templeMeta: { fontSize: 12, color: BRAND.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  actionRow: { flexDirection: 'row', gap: 10 },
  outlineBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 40,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    backgroundColor: '#FFFFFF',
  },
  outlineText: { color: BRAND.primary, fontSize: 13, fontWeight: '700' },
  filledBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 40,
    backgroundColor: BRAND.primary,
  },
  filledText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
