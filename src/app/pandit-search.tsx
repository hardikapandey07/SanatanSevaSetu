import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ApiService, type Pandit } from '@/constants/api';
import { Spacing } from '@/constants/theme';
import { useT, useTranslatedBatch } from '@/i18n/LanguageContext';
import { EmptyState } from '@/components/empty-state';

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
  verifiedBg: '#D1FAE5',
  verifiedText: '#15803D',
};

const EXPERIENCE_OPTIONS = ['0-5 Years', '5-10 Years', '10-15 Years', '15-20 Years', '20+ Years'];

export default function PanditSearchScreen() {
  const t = useT();
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [experience, setExperience] = useState('');
  const [speciality, setSpeciality] = useState('');

  useEffect(() => {
    ApiService.getPandits().then(data => {
      setPandits(data);
      setLoading(false);
    });
  }, []);

  // Collect unique speciality names for filter dropdown
  const specialityOptions = Array.from(
    new Set(pandits.flatMap(p => p.Specialities.map(s => s.ParentCategoryName)).filter(Boolean))
  );

  const filtered = pandits.filter(p => {
    if (pin && !p.PinCode.startsWith(pin)) return false;
    if (experience && p.ExpInYears !== experience) return false;
    if (speciality && !p.Specialities.some(s => s.ParentCategoryName === speciality)) return false;
    return true;
  });

  const hasFilters = pin || experience || speciality;

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
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor="#FFFFFF" size={18} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{t('panditSearchTitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Filters */}
        <View style={styles.card}>
          <View style={styles.filterHeader}>
            <SymbolView name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }} tintColor={BRAND.text} size={16} />
            <ThemedText style={styles.filterTitle}>{t('filters')}</ThemedText>
            {hasFilters && (
              <Pressable onPress={() => { setPin(''); setExperience(''); setSpeciality(''); }} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
                <ThemedText style={styles.clearBtnText}>{t('clearFilter')}</ThemedText>
              </Pressable>
            )}
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
          />

          <SelectField
            value={speciality}
            placeholder={t('specialityLabel')}
            options={specialityOptions}
            onChange={setSpeciality}
          />
        </View>

        {/* Results */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={BRAND.primary} />
            <ThemedText style={styles.loadingText}>{t('loadingPandits')}</ThemedText>
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState message={t('noPanditsFound')} subMessage={t('adjustFilters')} />
        ) : (
          filtered.map(p => (
            <PanditCard key={p.PanditId} pandit={p} t={t} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function PanditCard({ pandit, t }: { pandit: Pandit; t: (k: any) => string }) {
  const initials = pandit.Name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const rawSpeciality = pandit.Specialities[0]
    ? pandit.Specialities[0].SubSpecialityName
      ? `${pandit.Specialities[0].ParentCategoryName} · ${pandit.Specialities[0].SubSpecialityName}`
      : pandit.Specialities[0].ParentCategoryName
    : '—';
  const [panditName, specialityLabel] = useTranslatedBatch([pandit.Name, rawSpeciality]);

  return (
    <View style={styles.card}>
      <View style={styles.panditRow}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>{initials}</ThemedText>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.panditName}>{panditName}</ThemedText>
            {pandit.IsVerify && (
              <View style={styles.verifiedBadge}>
                <ThemedText style={styles.verifiedText}>{t('verified')}</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.panditMeta}>{t('experienceLabel')}: {pandit.ExpInYears}</ThemedText>
          <ThemedText style={styles.panditMeta}>{t('specialityLabel')}: {specialityLabel}</ThemedText>
          <ThemedText style={styles.panditMeta}>📍 {pandit.PinCode} · {pandit.Languages.join(', ')}</ThemedText>
        </View>
      </View>
      <View style={styles.actionRow}>
        <Pressable style={({ pressed }) => [styles.contactBtn, pressed && styles.pressed]}>
          <SymbolView name={{ ios: 'phone.fill', android: 'call', web: 'call' }} tintColor="#FFFFFF" size={14} />
          <ThemedText style={styles.contactText}>{t('contact')}</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => router.push({ pathname: '/pandit-profile', params: { data: JSON.stringify(pandit) } })}
          style={({ pressed }) => [styles.viewBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.viewText}>{t('viewProfile')}</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function SelectField({ value, placeholder, options, onChange }: {
  value: string; placeholder: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable onPress={() => setOpen(o => !o)} style={({ pressed }) => [styles.input, styles.selectRow, pressed && styles.pressed]}>
        <ThemedText style={[styles.selectText, !value && styles.placeholderText]}>{value || placeholder}</ThemedText>
        <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} tintColor={BRAND.textSecondary} size={16} />
      </Pressable>
      {open ? (
        <View style={styles.dropdown}>
          {options.map(opt => (
            <Pressable key={opt} onPress={() => { onChange(opt); setOpen(false); }} style={({ pressed }) => [styles.dropdownItem, pressed && styles.pressed]}>
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
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: 12 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },
  card: { backgroundColor: BRAND.card, borderWidth: 1, borderColor: BRAND.border, borderRadius: 14, padding: Spacing.three, gap: 10 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  filterTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: BRAND.text },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#FFF1DE' },
  clearBtnText: { fontSize: 12, fontWeight: '700', color: BRAND.primary },
  input: { borderWidth: 1, borderColor: BRAND.inputBorder, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14, color: BRAND.text, backgroundColor: '#FFFFFF', ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null) },
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 14, color: BRAND.text },
  placeholderText: { color: BRAND.textSecondary },
  dropdown: { marginTop: 4, borderWidth: 1, borderColor: BRAND.inputBorder, borderRadius: 10, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BRAND.border },
  dropdownItemText: { fontSize: 14, color: BRAND.text },
  centerBox: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  loadingText: { fontSize: 14, color: BRAND.textSecondary, marginTop: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 16, fontWeight: '700', color: BRAND.text },
  emptySubText: { fontSize: 13, color: BRAND.textSecondary },
  panditRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: BRAND.avatarBg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: BRAND.primary },
  avatarText: { fontSize: 16, fontWeight: '800', color: BRAND.primary },
  panditName: { fontSize: 15, fontWeight: '800', color: BRAND.text },
  verifiedBadge: { backgroundColor: BRAND.verifiedBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: BRAND.verifiedText },
  panditMeta: { fontSize: 12, color: BRAND.textSecondary, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: BRAND.primary, borderRadius: 10, height: 40 },
  contactText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  viewBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, height: 40, borderWidth: 1.5, borderColor: BRAND.primary, backgroundColor: '#FFFFFF' },
  viewText: { color: BRAND.primary, fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
