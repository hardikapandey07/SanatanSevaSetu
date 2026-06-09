import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
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
  avatarBg: '#FFE7CF',
};

const EXPERIENCE_OPTIONS: TranslationKey[] = ['exp0_5', 'exp5_10', 'exp10_15', 'exp15_20', 'exp20Plus'];
const SPECIALITY_OPTIONS: TranslationKey[] = [
  'specVedicRituals',
  'specWeddingCeremonies',
  'specPujaHavan',
  'specAstrology',
  'specKathaPrivachan',
];

type Pandit = { nameKey: TranslationKey; experience: number; specialityKey: TranslationKey };
const PANDITS: Pandit[] = [
  { nameKey: 'panditRameshSharma', experience: 15, specialityKey: 'specVedicRituals' },
  { nameKey: 'panditSureshKumar', experience: 10, specialityKey: 'specWeddingCeremonies' },
  { nameKey: 'panditMaheshTiwari', experience: 20, specialityKey: 'specPujaHavan' },
];

export default function PanditSearchScreen() {
  const t = useT();
  const [pin, setPin] = useState('');
  const [experience, setExperience] = useState('');
  const [speciality, setSpeciality] = useState('');

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
          <ThemedText style={styles.headerTitle}>{t('panditSearchTitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.filterHeader}>
            <SymbolView
              name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }}
              tintColor={BRAND.text}
              size={16}
            />
            <ThemedText style={styles.filterTitle}>{t('filters')}</ThemedText>
          </View>

          <TextInput
            value={pin}
            onChangeText={v => setPin(v.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('locationPinCode')}
            placeholderTextColor={BRAND.textSecondary}
            inputMode="numeric"
            keyboardType="number-pad"
            style={styles.input}
          />

          <SelectField
            value={experience}
            placeholder={t('experience')}
            options={EXPERIENCE_OPTIONS}
            onChange={setExperience}
            t={t}
          />

          <SelectField
            value={speciality}
            placeholder={t('specialityLabel')}
            options={SPECIALITY_OPTIONS}
            onChange={setSpeciality}
            t={t}
          />
        </View>

        {PANDITS.map(p => (
          <PanditCard key={p.name} pandit={p} t={t} />
        ))}
      </ScrollView>
    </View>
  );
}

function PanditCard({ pandit, t }: { pandit: Pandit; t: (k: TranslationKey) => string }) {
  return (
    <View style={styles.card}>
      <View style={styles.panditRow}>
        <View style={styles.avatar}>
          <SymbolView
            name={{ ios: 'person.fill', android: 'person', web: 'person' }}
            tintColor={BRAND.primary}
            size={22}
          />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.panditName}>{t(pandit.nameKey)}</ThemedText>
          <ThemedText style={styles.panditMeta}>
            {t('experienceLabel')}: {pandit.experience} {t('years')}
          </ThemedText>
          <ThemedText style={styles.panditMeta}>
            {t('specialityLabel')}: {t(pandit.specialityKey)}
          </ThemedText>
        </View>
      </View>
      <View style={styles.actionRow}>
        <Pressable style={({ pressed }) => [styles.contactBtn, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'phone.fill', android: 'call', web: 'call' }}
            tintColor="#FFFFFF"
            size={14}
          />
          <ThemedText style={styles.contactText}>{t('contact')}</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => router.push('/pandit-profile')}
          style={({ pressed }) => [styles.viewBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.viewText}>{t('viewProfile')}</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function SelectField({
  value,
  placeholder,
  options,
  onChange,
  t,
}: {
  value: string;
  placeholder: string;
  options: TranslationKey[];
  onChange: (v: string) => void;
  t: (k: TranslationKey) => string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={({ pressed }) => [styles.input, styles.selectRow, pressed && styles.pressed]}>
        <ThemedText style={[styles.selectText, !value && styles.placeholderText]}>
          {value ? t(value as TranslationKey) : placeholder}
        </ThemedText>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          tintColor={BRAND.textSecondary}
          size={16}
        />
      </Pressable>
      {open ? (
        <View style={styles.dropdown}>
          {options.map(opt => (
            <Pressable
              key={opt}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={({ pressed }) => [styles.dropdownItem, pressed && styles.pressed]}>
              <ThemedText style={styles.dropdownItemText}>{t(opt)}</ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}
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
    gap: 10,
  },
  filterHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  filterTitle: { fontSize: 15, fontWeight: '700', color: BRAND.text },
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
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 14, color: BRAND.text },
  placeholderText: { color: BRAND.textSecondary },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10 },
  dropdownItemText: { fontSize: 14, color: BRAND.text },
  panditRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panditName: { fontSize: 15, fontWeight: '800', color: BRAND.text },
  panditMeta: { fontSize: 12, color: BRAND.textSecondary, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    height: 40,
  },
  contactText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  viewBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 40,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    backgroundColor: '#FFFFFF',
  },
  viewText: { color: BRAND.primary, fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
