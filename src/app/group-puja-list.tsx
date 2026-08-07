import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ApiService, type ExtraField, type PujaInfo } from '@/constants/api';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useT, useTranslatedList } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';
import { EmptyState } from '@/components/empty-state';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  green: '#E8731C',
  greenDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  pink: '#E91E8C',
};

const BANNER_GRADIENTS: [string, string][] = [
  ['#8B1A1A', '#5C0E0E'],
  ['#1A3A6B', '#0D1F3C'],
  ['#4A1D96', '#2D1060'],
  ['#134E4A', '#0D3330'],
  ['#7A3B1E', '#4A2010'],
];

type PujaType = 'Individual' | 'Group' | 'Lokpriya';
type FilterType = 'Deity' | 'Tithis' | 'Dosha' | 'Benefits' | 'Location';

export default function GroupPujaListScreen() {
  const t = useT();
  const params = useLocalSearchParams<{ type?: string }>();
  const rawType = params.type ?? 'group';

  const pujaType: PujaType =
    rawType === 'individual' ? 'Individual' :
    rawType === 'lokpriya'   ? 'Lokpriya'   : 'Group';

  const title =
    pujaType === 'Individual' ? t('individualPuja') :
    pujaType === 'Lokpriya'   ? t('lokpriyaPuja')   : t('groupPuja');

  // Data
  const [allPujas, setAllPujas] = useState<PujaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deities, setDeities] = useState<ExtraField[]>([]);
  const [doshas, setDoshas] = useState<ExtraField[]>([]);
  const [benefits, setBenefits] = useState<ExtraField[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDeity, setSelectedDeity] = useState<ExtraField | null>(null);
  const [selectedDosha, setSelectedDosha] = useState<ExtraField | null>(null);
  const [selectedTithi, setSelectedTithi] = useState<string | null>(null);
  const [selectedBenefit, setSelectedBenefit] = useState<ExtraField | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Myntra-style filter panel
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterType>('Deity');
  // Draft selections (applied only on Done)
  const [draftDeities, setDraftDeities] = useState<Set<string>>(new Set());
  const [draftDoshas, setDraftDoshas] = useState<Set<string>>(new Set());
  const [draftTithis, setDraftTithis] = useState<Set<string>>(new Set());
  const [draftBenefits, setDraftBenefits] = useState<Set<string>>(new Set());
  const [draftLocations, setDraftLocations] = useState<Set<string>>(new Set());

  const openFilterPanel = () => {
    // Sync draft from current applied filters
    setDraftDeities(selectedDeity ? new Set([selectedDeity.id]) : new Set());
    setDraftDoshas(selectedDosha ? new Set([selectedDosha.id]) : new Set());
    setDraftTithis(selectedTithi ? new Set([selectedTithi]) : new Set());
    setDraftBenefits(selectedBenefit ? new Set([selectedBenefit.id]) : new Set());
    setDraftLocations(selectedLocation ? new Set([selectedLocation]) : new Set());
    setActiveCategory('Deity');
    setFilterPanelOpen(true);
  };

  const applyDraft = () => {
    setSelectedDeity(draftDeities.size > 0 ? deities.find(d => draftDeities.has(d.id)) ?? null : null);
    setSelectedDosha(draftDoshas.size > 0 ? doshas.find(d => draftDoshas.has(d.id)) ?? null : null);
    setSelectedTithi(draftTithis.size > 0 ? [...draftTithis][0] : null);
    setSelectedBenefit(draftBenefits.size > 0 ? benefits.find(b => draftBenefits.has(b.id)) ?? null : null);
    setSelectedLocation(draftLocations.size > 0 ? [...draftLocations][0] : null);
    setFilterPanelOpen(false);
  };

  const clearDraft = () => {
    setDraftDeities(new Set());
    setDraftDoshas(new Set());
    setDraftTithis(new Set());
    setDraftBenefits(new Set());
    setDraftLocations(new Set());
  };

  const totalDraftCount = draftDeities.size + draftDoshas.size + draftTithis.size + draftBenefits.size + draftLocations.size;

  const getDraftSet = (cat: FilterType) => {
    if (cat === 'Deity')    return { set: draftDeities,   setFn: setDraftDeities };
    if (cat === 'Dosha')    return { set: draftDoshas,    setFn: setDraftDoshas };
    if (cat === 'Tithis')   return { set: draftTithis,    setFn: setDraftTithis };
    if (cat === 'Benefits') return { set: draftBenefits,  setFn: setDraftBenefits };
    return { set: draftLocations, setFn: setDraftLocations };
  };

  const toggleDraft = (cat: FilterType, id: string) => {
    const { set, setFn } = getDraftSet(cat);
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFn(next);
  };

  // Unique locations derived from loaded puja mandir_address values
  const locationOptions = [...new Set(allPujas.map(p => p.mandir_address).filter(Boolean))];

  const getCategoryOptions = (cat: FilterType): { id: string; label: string }[] => {
    if (cat === 'Deity')    return deities.map(d => ({ id: d.id, label: d.description }));
    if (cat === 'Dosha')    return doshas.map(d => ({ id: d.id, label: d.description }));
    if (cat === 'Tithis')   return tithiOptions.map(t => ({ id: t, label: t }));
    if (cat === 'Benefits') return benefits.map(b => ({ id: b.id, label: b.description }));
    return locationOptions.map(l => ({ id: l, label: l }));
  };

  // Dropdown open state (kept for backward compat but unused now)
  const [openDropdown, setOpenDropdown] = useState<FilterType | null>(null);

  // Load pujas + filter options on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      ApiService.getPujas(pujaType),
      ApiService.getExtraFields(3),  // deities
      ApiService.getExtraFields(5),  // doshas
      ApiService.getExtraFields(6),  // benefits
    ]).then(([pujaData, deityData, doshaData, benefitData]) => {
      setAllPujas(pujaData);
      setDeities(deityData);
      setDoshas(doshaData);
      setBenefits(benefitData);
      setLoading(false);
    });
  }, [pujaType]);

  // Unique tithis from loaded pujas
  const tithiOptions = [...new Set(allPujas.map(p => p.tithi).filter(Boolean))];

  const [filteredPujas, setFilteredPujas] = useState<PujaInfo[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [selectedDeity, selectedDosha, selectedTithi, selectedBenefit, selectedLocation, search, allPujas]);

  function applyFilters() {
    const hasApiFilter = !!(selectedDeity || selectedDosha || selectedBenefit || selectedLocation || selectedTithi);

    const clientFilter = (list: PujaInfo[]) => {
      let result = list;
      if (search.trim()) {
        const q = search.toLowerCase();
        result = result.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.mandir_address.toLowerCase().includes(q)
        );
      }
      return result;
    };

    if (!hasApiFilter) {
      setFilteredPujas(clientFilter([...allPujas]));
      return;
    }

    setFilterLoading(true);
    // Build all active API filter params together
    const qp = new URLSearchParams();
    qp.set('booking_status', 'open');
    qp.set('puja_types', pujaType);
    qp.set('page', '1');
    qp.set('limit', '100');
    if (selectedDeity)    qp.set('deity_names',       selectedDeity.description);
    if (selectedDosha)    qp.set('dosha_names',       selectedDosha.description);
    if (selectedBenefit)  qp.set('benefit_categories', selectedBenefit.description);
    if (selectedLocation) qp.set('location',           selectedLocation);
    if (selectedTithi)    qp.set('tithi',              selectedTithi);

    fetch(`https://api.sanatansevasetu.com/api/v1/pujas/all?${qp.toString()}`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    })
      .then(r => r.ok ? r.json() : { data: [] })
      .then((d: any) => {
        const apiResult: PujaInfo[] = d.data ?? [];
        // Also intersect with allPujas IDs to ensure we only show valid results
        const allIds = new Set(allPujas.map(p => p.id));
        const intersected = allIds.size > 0
          ? apiResult.filter(p => allIds.has(p.id))
          : apiResult;
        setFilteredPujas(clientFilter(intersected));
      })
      .catch(() => setFilteredPujas([]))
      .finally(() => setFilterLoading(false));
  }

  const clearFilters = () => {
    setSelectedDeity(null);
    setSelectedDosha(null);
    setSelectedTithi(null);
    setSelectedBenefit(null);
    setSelectedLocation(null as string | null);
  };

  const hasActiveFilter = !!(selectedDeity || selectedDosha || selectedTithi || selectedBenefit || selectedLocation);

  const translatedPujas = useTranslatedList(filteredPujas, ['title', 'subtitle', 'description', 'mandir_address']);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={BRAND.text} size={20} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{title}</ThemedText>
        </View>

        {/* Search + Filter in one row */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} tintColor={BRAND.textSecondary} size={16} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={`${t('searchPlaceholder')} ${title}`}
              placeholderTextColor={BRAND.textSecondary}
              style={styles.searchInput}
            />
          </View>
          <Pressable
            onPress={openFilterPanel}
            style={({ pressed }) => [styles.filterBtn, hasActiveFilter && styles.filterBtnActive, pressed && styles.pressed]}
          >
            <SymbolView name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }} tintColor={hasActiveFilter ? '#FFFFFF' : BRAND.text} size={18} />
            {hasActiveFilter && (
              <View style={styles.filterBadge}>
                <ThemedText style={styles.filterBadgeText}>
                  {[selectedDeity, selectedDosha, selectedTithi, selectedBenefit, selectedLocation].filter(Boolean).length}
                </ThemedText>
              </View>
            )}
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Myntra-style Filter Panel */}
      <Modal visible={filterPanelOpen} transparent animationType="fade" onRequestClose={() => setFilterPanelOpen(false)}>
        <View style={styles.fpBackdrop}>
          <View style={styles.fpContainer}>
            {/* Header */}
            <View style={styles.fpHeader}>
              <ThemedText style={styles.fpHeaderTitle}>{t('filters')}</ThemedText>
              <Pressable onPress={() => setFilterPanelOpen(false)} style={({ pressed }) => [styles.fpCloseBtn, pressed && styles.pressed]}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={BRAND.textSecondary} size={16} />
              </Pressable>
            </View>

            <View style={styles.fpBody}>
              {/* Left: category list */}
              <View style={styles.fpLeft}>
                {(['Deity', 'Tithis', 'Dosha', 'Benefits', 'Location'] as FilterType[]).map(cat => {
                  const count = getDraftSet(cat).set.size;
                  const isActive = activeCategory === cat;
                  const catLabel: Record<FilterType, TranslationKey> = {
                    Deity: 'deity', Tithis: 'tithi', Dosha: 'doshas',
                    Benefits: 'benefitsTab', Location: 'address',
                  };
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setActiveCategory(cat)}
                      style={[styles.fpCatItem, isActive && styles.fpCatItemActive]}
                    >
                      <ThemedText style={[styles.fpCatText, isActive && styles.fpCatTextActive]}>{t(catLabel[cat])}</ThemedText>
                      {count > 0 && (
                        <View style={styles.fpCatBadge}>
                          <ThemedText style={styles.fpCatBadgeText}>{count}</ThemedText>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Right: options with checkboxes */}
              <ScrollView style={styles.fpRight} showsVerticalScrollIndicator={false}>
                {getCategoryOptions(activeCategory).map((opt, i) => {
                  const checked = getDraftSet(activeCategory).set.has(opt.id);
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => toggleDraft(activeCategory, opt.id)}
                      style={({ pressed }) => [
                        styles.fpOptionRow,
                        i > 0 && styles.fpOptionDivider,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={[styles.fpCheckbox, checked && styles.fpCheckboxChecked]}>
                        {checked && <ThemedText style={styles.fpCheckmark}>✓</ThemedText>}
                      </View>
                      <ThemedText style={[styles.fpOptionText, checked && styles.fpOptionTextChecked]}>
                        {opt.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Footer */}
            <View style={styles.fpFooter}>
              <Pressable onPress={clearDraft} style={({ pressed }) => [styles.fpClearBtn, pressed && styles.pressed]}>
                <ThemedText style={styles.fpClearBtnText}>{t('clearAll')}</ThemedText>
              </Pressable>
              <Pressable onPress={applyDraft} style={({ pressed }) => [styles.fpDoneBtn, pressed && styles.pressed]}>
                <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fpDoneGradient}>
                  <ThemedText style={styles.fpDoneText}>{t('done')}{totalDraftCount > 0 ? ` (${totalDraftCount})` : ''}</ThemedText>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* List */}
      {loading || filterLoading ? (
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      ) : filteredPujas.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            message={hasActiveFilter ? t('noPujasFilter') : t('noPujasFound')}
          />
          {hasActiveFilter && (
            <Pressable onPress={clearFilters} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.clearBtnText}>{t('clearFilters')}</ThemedText>
            </Pressable>
          )}
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {translatedPujas.map((puja, i) => (
            <PujaCard key={puja.id} puja={puja} gradientIndex={i} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ── Puja Card ─────────────────────────────────────────────────────────────────
function PujaCard({ puja, gradientIndex }: { puja: PujaInfo; gradientIndex: number }) {
  const t = useT();
  const gradient = BANNER_GRADIENTS[gradientIndex % BANNER_GRADIENTS.length];
  const imgUri = Platform.OS === 'web'
    ? (puja.desktop_image || puja.mobile_image)
    : (puja.mobile_image || puja.desktop_image);

  const formattedDate = (() => {
    try { return new Date(puja.puja_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return puja.puja_date; }
  })();

  return (
    <View style={styles.card}>
      {/* Banner image */}
      <View style={styles.banner}>
        <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
        {imgUri && (
          <Image source={{ uri: imgUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        )}


      </View>

      <View style={styles.subtitleTagRow}>
        <ThemedText style={styles.subtitleTag}>{puja.subtitle}</ThemedText>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.tithiRow}>
          <ThemedText style={styles.tithiTag}>🔱 {puja.maas_paksh} • {puja.tithi}
          </ThemedText>
        </View>
        <ThemedText style={styles.cardTitle}>{puja.title}</ThemedText>
        <ThemedText style={styles.cardDesc}>{puja.description}</ThemedText>
        <View style={styles.metaRow}>
          <SymbolView name={{ ios: 'building.columns', android: 'account_balance', web: 'account_balance' }} tintColor={BRAND.primary} size={13} />
          <ThemedText style={styles.metaText} numberOfLines={2}>{puja.mandir_address}</ThemedText>
        </View>
        <View style={styles.metaRow}>
          <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} tintColor={BRAND.primary} size={13} />
          <ThemedText style={styles.metaText}>{formattedDate}</ThemedText>
        </View>
      </View>

      <Pressable
        onPress={() => router.push({ pathname: '/group-puja-detail', params: { id: puja.id } })}
        style={({ pressed }) => [styles.participateBtn, pressed && styles.pressed]}
      >
        <LinearGradient colors={[BRAND.green, BRAND.greenDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.participateBtnGradient}>
          <ThemedText style={styles.participateBtnText}>{t('participate')}</ThemedText>
        </LinearGradient>

      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  headerSafe: { backgroundColor: BRAND.card, borderBottomWidth: 1, borderBottomColor: BRAND.border },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.two, gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0EAE0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: BRAND.text },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#FFF1DE', borderWidth: 1, borderColor: BRAND.primary },
  clearBtnText: { fontSize: 12, fontWeight: '700', color: BRAND.primary },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F5F0E8', borderRadius: 12,
    paddingHorizontal: 14, height: 42,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: BRAND.text,
    ...(Platform.OS === 'web' ? { outlineWidth: 0, outlineStyle: 'none' } as any : {}),
  },
  filterBtn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#F5F0E8',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: { backgroundColor: BRAND.primary },
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: BRAND.primaryDark,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },
  pressed: { opacity: 0.85 },

  // Myntra Filter Panel
  fpBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fpContainer: {
    backgroundColor: BRAND.card,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 500,
    height: '75%',
  },
  fpHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BRAND.border,
  },
  fpHeaderTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },
  fpCloseBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#F3EAD7', alignItems: 'center', justifyContent: 'center',
  },
  fpBody: { flex: 1, flexDirection: 'row', minHeight: 0 },
  fpLeft: {
    width: 110,
    backgroundColor: '#F7F4EE',
    borderRightWidth: 1,
    borderRightColor: BRAND.border,
  },
  fpCatItem: {
    paddingHorizontal: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderLeftWidth: 3, borderLeftColor: 'transparent',
  },
  fpCatItemActive: {
    backgroundColor: BRAND.card,
    borderLeftColor: BRAND.primary,
  },
  fpCatText: { fontSize: 13, fontWeight: '600', color: BRAND.textSecondary },
  fpCatTextActive: { color: BRAND.primary, fontWeight: '800' },
  fpCatBadge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: BRAND.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  fpCatBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  fpRight: { flex: 1 },
  fpOptionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  fpOptionDivider: { borderTopWidth: 1, borderTopColor: '#F3EAD7' },
  fpCheckbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 2, borderColor: BRAND.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  fpCheckboxChecked: { backgroundColor: BRAND.primary, borderColor: BRAND.primary },
  fpCheckmark: { fontSize: 12, fontWeight: '900', color: '#FFFFFF', lineHeight: 14 },
  fpOptionText: { flex: 1, fontSize: 13, fontWeight: '500', color: BRAND.text },
  fpOptionTextChecked: { fontWeight: '700', color: BRAND.primary },
  fpFooter: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: BRAND.border,
    backgroundColor: BRAND.card,
  },
  fpClearBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 12,
    borderWidth: 1.5, borderColor: BRAND.border,
    alignItems: 'center', justifyContent: 'center',
  },
  fpClearBtnText: { fontSize: 13, fontWeight: '700', color: BRAND.textSecondary },
  fpDoneBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  fpDoneGradient: { paddingVertical: 11, alignItems: 'center', justifyContent: 'center' },
  fpDoneText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: BRAND.textSecondary, fontWeight: '600' },

  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: 40,
    ...(Platform.OS === 'web' ? { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' } as any : {}),
  },

  card: { backgroundColor: BRAND.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: BRAND.border },
  banner: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#1A1A2E',
    ...(Platform.OS === 'web' ? { aspectRatio: 16 / 9 } : { height: 160 }),
  },
  bannerContent: {
    padding: 12,
    gap: 6,
  },
  bannerTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', lineHeight: 18 },
  typePillsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  typePill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  typePillText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  tithiRow: { paddingHorizontal: 12, paddingTop: 10 },
  tithiTag: { fontSize: 12, fontWeight: '700', color: BRAND.primary },

  subtitleTagRow: { paddingHorizontal: 12, paddingTop: 10 },
  subtitleTag: { fontSize: 12, fontWeight: '700', color: BRAND.pink },

  cardBody: { paddingHorizontal: 12, paddingBottom: 12, gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: BRAND.text, lineHeight: 20 },
  cardDesc: { fontSize: 13, color: BRAND.textSecondary, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  metaText: { fontSize: 12, color: BRAND.textSecondary, flex: 1 },

  participateBtn: { marginHorizontal: 12, marginBottom: 12, borderRadius: 12, overflow: 'visible', flexDirection: 'row', alignItems: 'center' },
  participateBtnGradient: { flex: 1, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  participateBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  participatePanditAvatar: {
    position: 'absolute', right: -4, top: -10,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFF8F0', borderWidth: 2, borderColor: BRAND.green,
    alignItems: 'center', justifyContent: 'center',
  },
});
