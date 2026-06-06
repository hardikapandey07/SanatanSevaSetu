import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
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

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  noteBg: '#FFF1DE',
  noteBorder: '#F5D9A8',
  required: '#DC2626',
  inputBorder: '#E5DCC8',
  chipBg: '#FFF1DE',
  chipText: '#C95A0E',
};

const LANGUAGE_OPTIONS = ['Hindi', 'Sanskrit', 'English', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Bengali'];
const EXPERIENCE_OPTIONS = ['0-5 Years', '5-10 Years', '10-15 Years', '15-20 Years', '20+ Years'];
const SPECIALITY_OPTIONS = ['Vedic Rituals', 'Wedding Ceremonies', 'Puja & Havan', 'Astrology', 'Katha & Pravachan', 'Yagya Specialist'];
const REFERENCE_CODES = ['REF-1001', 'REF-1002', 'REF-1003', 'REF-2050', 'REF-3000'];

export default function MandirRegisterScreen() {
  const t = useT();
  const [languages, setLanguages] = useState<string[]>([]);
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [pin, setPin] = useState('');
  const [experience, setExperience] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [association, setAssociation] = useState('');
  const [refCode, setRefCode] = useState('');

  const canSubmit =
    languages.length > 0 &&
    fullName.trim().length > 1 &&
    contact.length === 10 &&
    pin.length === 6 &&
    experience.length > 0 &&
    speciality.length > 0;

  const onSubmit = () => {
    if (!canSubmit) return;
    router.back();
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
            onPress={() => router.back()}
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              tintColor="#FFFFFF"
              size={18}
            />
          </Pressable>
          <View style={styles.brandLogo}>
            <Image
              source={require('@/assets/images/logo.jpg')}
              style={styles.brandLogoImg}
              contentFit="contain"
            />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.headerTitle}>{t('mandirRegTitle')}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{t('mandirRegSubtitle')}</ThemedText>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <ThemedText style={styles.desc}>{t('mandirRegDesc')}</ThemedText>

          <Field label={t('poojaLanguages')} required>
            <MultiSelect
              values={languages}
              placeholder={t('selectLanguages')}
              options={LANGUAGE_OPTIONS}
              onChange={setLanguages}
            />
          </Field>

          <Field label={t('fullName')} required>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('fullNamePlaceholder')}
              placeholderTextColor={BRAND.textSecondary}
              style={styles.input}
            />
          </Field>

          <Field label={t('contactNumber')} required>
            <TextInput
              value={contact}
              onChangeText={v => setContact(v.replace(/\D/g, '').slice(0, 10))}
              placeholder={t('contactNumberPlaceholder')}
              placeholderTextColor={BRAND.textSecondary}
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={10}
              style={styles.input}
            />
          </Field>

          <Field label={t('pinCode')} required>
            <TextInput
              value={pin}
              onChangeText={v => setPin(v.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('pinCodePlaceholder')}
              placeholderTextColor={BRAND.textSecondary}
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
            />
          </Field>

          <Field label={t('experienceYears')} required>
            <SelectField
              value={experience}
              placeholder={t('selectExperience')}
              options={EXPERIENCE_OPTIONS}
              onChange={setExperience}
            />
          </Field>

          <Field label={t('speciality')} required>
            <SelectField
              value={speciality}
              placeholder={t('selectSpeciality')}
              options={SPECIALITY_OPTIONS}
              onChange={setSpeciality}
            />
          </Field>

          <Field label={t('mandirAssociation')}>
            <TextInput
              value={association}
              onChangeText={setAssociation}
              placeholder={t('mandirAssociationPlaceholder')}
              placeholderTextColor={BRAND.textSecondary}
              style={styles.input}
            />
          </Field>

          <Field label={t('referenceCodeOptional')}>
            <SearchSelect
              value={refCode}
              placeholder={t('searchReferenceCode')}
              options={REFERENCE_CODES}
              onChange={setRefCode}
            />
          </Field>

          <View style={styles.noteBox}>
            <ThemedText style={styles.noteLabel}>{t('panditRegNoteLabel')}</ThemedText>
            <ThemedText style={styles.noteText}>{t('panditRegNote')}</ThemedText>
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              !canSubmit && styles.submitBtnDisabled,
              pressed && canSubmit && styles.pressed,
            ]}>
            <ThemedText style={styles.submitText}>{t('submitRegistration')}</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>
        {label}
        {required ? <ThemedText style={styles.required}> *</ThemedText> : null}
      </ThemedText>
      {children}
    </View>
  );
}

function SelectField({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={({ pressed }) => [styles.input, styles.selectRow, pressed && styles.pressed]}>
        <ThemedText style={[styles.selectText, !value && styles.placeholderText]}>
          {value || placeholder}
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
              <ThemedText style={styles.dropdownItemText}>{opt}</ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function MultiSelect({
  values,
  placeholder,
  options,
  onChange,
}: {
  values: string[];
  placeholder: string;
  options: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (opt: string) => {
    onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]);
  };
  return (
    <View>
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={({ pressed }) => [styles.input, styles.selectRow, pressed && styles.pressed]}>
        {values.length === 0 ? (
          <ThemedText style={[styles.selectText, styles.placeholderText]}>{placeholder}</ThemedText>
        ) : (
          <View style={styles.chipsRow}>
            {values.map(v => (
              <View key={v} style={styles.chip}>
                <ThemedText style={styles.chipText}>{v}</ThemedText>
              </View>
            ))}
          </View>
        )}
        <SymbolView
          name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          tintColor={BRAND.textSecondary}
          size={16}
        />
      </Pressable>
      {open ? (
        <View style={styles.dropdown}>
          {options.map(opt => {
            const selected = values.includes(opt);
            return (
              <Pressable
                key={opt}
                onPress={() => toggle(opt)}
                style={({ pressed }) => [styles.dropdownItem, pressed && styles.pressed]}>
                <ThemedText style={styles.dropdownItemText}>{opt}</ThemedText>
                {selected ? (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    tintColor={BRAND.primary}
                    size={16}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function SearchSelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => options.filter(o => o.toLowerCase().includes(query.toLowerCase())),
    [query, options]
  );
  return (
    <View>
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={({ pressed }) => [styles.input, styles.selectRow, pressed && styles.pressed]}>
        <ThemedText style={[styles.selectText, !value && styles.placeholderText]}>
          {value || placeholder}
        </ThemedText>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          tintColor={BRAND.textSecondary}
          size={16}
        />
      </Pressable>
      {open ? (
        <View style={styles.dropdown}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor={BRAND.textSecondary}
            style={[styles.input, styles.searchInput]}
          />
          {filtered.map(opt => (
            <Pressable
              key={opt}
              onPress={() => {
                onChange(opt);
                setOpen(false);
                setQuery('');
              }}
              style={({ pressed }) => [styles.dropdownItem, pressed && styles.pressed]}>
              <ThemedText style={styles.dropdownItemText}>{opt}</ThemedText>
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
    gap: 10,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogoImg: { width: '94%', height: '94%' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#FFE7CF', marginTop: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five },
  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  desc: { fontSize: 13, color: BRAND.textSecondary, marginBottom: Spacing.one },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: BRAND.text },
  required: { color: BRAND.required, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND.text,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null),
  },
  searchInput: { margin: 6 },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  selectText: { fontSize: 14, color: BRAND.text, flexShrink: 1 },
  placeholderText: { color: BRAND.textSecondary },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flexShrink: 1 },
  chip: {
    backgroundColor: BRAND.chipBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: { color: BRAND.chipText, fontSize: 12, fontWeight: '700' },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  dropdownItemText: { fontSize: 14, color: BRAND.text },
  noteBox: {
    backgroundColor: BRAND.noteBg,
    borderWidth: 1,
    borderColor: BRAND.noteBorder,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  noteLabel: { fontSize: 12, fontWeight: '800', color: BRAND.primaryDark },
  noteText: { fontSize: 12, color: BRAND.text, lineHeight: 18 },
  submitBtn: {
    backgroundColor: BRAND.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.85 },
});
