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

import { ThemedText } from '@/components/themed-text';
import { ApiService, type ExtraField, type PujaInfo } from '@/constants/api';
import { Spacing } from '@/constants/theme';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  green: '#22C55E',
  greenDark: '#16A34A',
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
type FilterType = 'Deity' | 'Tithis' | 'Dosha';

export default function GroupPujaListScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const rawType = params.type ?? 'group';

  const pujaType: PujaType =
    rawType === 'individual' ? 'Individual' :
    rawType === 'lokpriya'   ? 'Lokpriya'   : 'Group';

  const title =
    pujaType === 'Individual' ? 'Individual Puja' :
    pujaType === 'Lokpriya'   ? 'Lokpriya Puja'   : 'Group Puja';

  // Data
  const [allPujas, setAllPujas] = useState<PujaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deities, setDeities] = useState<ExtraField[]>([]);
  const [doshas, setDoshas] = useState<ExtraField[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDeity, setSelectedDeity] = useState<ExtraField | null>(null);
  const [selectedDosha, setSelectedDosha] = useState<ExtraField | null>(null);
  const [selectedTithi, setSelectedTithi] = useState<string | null>(null);

  // Dropdown open state
  const [openDropdown, setOpenDropdown] = useState<FilterType | null>(null);

  // Load pujas + filter options on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      ApiService.getPujas(pujaType),
      ApiService.getExtraFields(3),  // deities
      ApiService.getExtraFields(5),  // doshas
    ]).then(([pujaData, deityData, doshaData]) => {
      setAllPujas(pujaData);
      setDeities(deityData);
      setDoshas(doshaData);
      setLoading(false);
    });
  }, [pujaType]);

  // Unique tithis from loaded pujas
  const tithiOptions = [...new Set(allPujas.map(p => p.tithi).filter(Boolean))];

  // Client-side filter (deity/dosha filtering ideally goes to API, but list response
  // includes deities[] only in detail — so we filter by tithi client-side,
  // and re-fetch with deity_id / dosha_id query params when selected)
  const [filteredPujas, setFilteredPujas] = useState<PujaInfo[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    if (!selectedDeity && !selectedDosha) {
      // No API filter — apply tithi + search client-side
      let result = allPujas;
      if (selectedTithi) result = result.filter(p => p.tithi === selectedTithi);
      if (search) result = result.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.mandir_address.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPujas(result);
      return;
    }
    // Re-fetch with deity/dosha filter
    setFilterLoading(true);
    const params: Record<string, string> = {
      booking_status: 'open',
      puja_types: pujaType,
      page: '1',
      limit: '100',
    };
    if (selectedDeity) params.deity_id = selectedDeity.id;
    if (selectedDosha) params.dosha_id = selectedDosha.id;
    const qs = new URLSearchParams(params).toString();
    fetch(`https://api.sanatansevasetu.com/api/v1/pujas/all?${qs}`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    })
      .then(r => r.ok ? r.json() : { data: [] })
      .then((d: any) => {
        let result: PujaInfo[] = d.data ?? [];
        if (selectedTithi) result = result.filter((p: PujaInfo) => p.tithi === selectedTithi);
        if (search) result = result.filter((p: PujaInfo) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.mandir_address.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredPujas(result);
      })
      .catch(() => setFilteredPujas([]))
      .finally(() => setFilterLoading(false));
  }, [selectedDeity, selectedDosha, selectedTithi, search, allPujas]);

  const clearFilters = () => {
    setSelectedDeity(null);
    setSelectedDosha(null);
    setSelectedTithi(null);
  };

  const hasActiveFilter = !!(selectedDeity || selectedDosha || selectedTithi);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={BRAND.text} size={20} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{title}</ThemedText>
          {hasActiveFilter && (
            <Pressable onPress={clearFilters} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.clearBtnText}>Clear</ThemedText>
            </Pressable>
          )}
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} tintColor={BRAND.textSecondary} size={16} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={`Search for ${title}`}
            placeholderTextColor={BRAND.textSecondary}
            style={styles.searchInput}
            {...(Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null)}
          />
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {/* All */}
          <Pressable
            onPress={clearFilters}
            style={({ pressed }) => [styles.filterChip, !hasActiveFilter && styles.filterChipActive, pressed && styles.pressed]}
          >
            <SymbolView name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }} tintColor={!hasActiveFilter ? '#FFFFFF' : BRAND.text} size={13} />
            <ThemedText style={[styles.filterText, !hasActiveFilter && styles.filterTextActive]}>All</ThemedText>
          </Pressable>

          {/* Deity */}
          <Pressable
            onPress={() => setOpenDropdown(o => o === 'Deity' ? null : 'Deity')}
            style={({ pressed }) => [styles.filterChip, !!selectedDeity && styles.filterChipActive, pressed && styles.pressed]}
          >
            <ThemedText style={[styles.filterText, !!selectedDeity && styles.filterTextActive]}>
              {selectedDeity ? selectedDeity.description : 'Deity'}
            </ThemedText>
            <SymbolView
              name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
              tintColor={selectedDeity ? '#FFFFFF' : BRAND.text} size={12}
            />
          </Pressable>

          {/* Tithis */}
          <Pressable
            onPress={() => setOpenDropdown(o => o === 'Tithis' ? null : 'Tithis')}
            style={({ pressed }) => [styles.filterChip, !!selectedTithi && styles.filterChipActive, pressed && styles.pressed]}
          >
            <ThemedText style={[styles.filterText, !!selectedTithi && styles.filterTextActive]}>
              {selectedTithi ?? 'Tithis'}
            </ThemedText>
            <SymbolView
              name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
              tintColor={selectedTithi ? '#FFFFFF' : BRAND.text} size={12}
            />
          </Pressable>

          {/* Dosha */}
          <Pressable
            onPress={() => setOpenDropdown(o => o === 'Dosha' ? null : 'Dosha')}
            style={({ pressed }) => [styles.filterChip, !!selectedDosha && styles.filterChipActive, pressed && styles.pressed]}
          >
            <ThemedText style={[styles.filterText, !!selectedDosha && styles.filterTextActive]}>
              {selectedDosha ? selectedDosha.description : 'Dosha'}
            </ThemedText>
            <SymbolView
              name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
              tintColor={selectedDosha ? '#FFFFFF' : BRAND.text} size={12}
            />
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      {/* Dropdown modals */}
      <DropdownModal
        visible={openDropdown === 'Deity'}
        title="Select Deity"
        options={deities.map(d => ({ id: d.id, label: d.description }))}
        selected={selectedDeity?.id ?? null}
        onSelect={id => {
          setSelectedDeity(deities.find(d => d.id === id) ?? null);
          setOpenDropdown(null);
        }}
        onClose={() => setOpenDropdown(null)}
      />
      <DropdownModal
        visible={openDropdown === 'Tithis'}
        title="Select Tithi"
        options={tithiOptions.map(t => ({ id: t, label: t }))}
        selected={selectedTithi}
        onSelect={id => { setSelectedTithi(id); setOpenDropdown(null); }}
        onClose={() => setOpenDropdown(null)}
      />
      <DropdownModal
        visible={openDropdown === 'Dosha'}
        title="Select Dosha"
        options={doshas.map(d => ({ id: d.id, label: d.description }))}
        selected={selectedDosha?.id ?? null}
        onSelect={id => {
          setSelectedDosha(doshas.find(d => d.id === id) ?? null);
          setOpenDropdown(null);
        }}
        onClose={() => setOpenDropdown(null)}
      />

      {/* List */}
      {loading || filterLoading ? (
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      ) : filteredPujas.length === 0 ? (
        <View style={styles.emptyWrap}>
          <ThemedText style={styles.emptyEmoji}>🙏</ThemedText>
          <ThemedText style={styles.emptyText}>No pujas found</ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredPujas.map((puja, i) => (
            <PujaCard key={puja.id} puja={puja} gradientIndex={i} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ── Dropdown Modal ────────────────────────────────────────────────────────────
function DropdownModal({
  visible, title, options, selected, onSelect, onClose,
}: {
  visible: boolean;
  title: string;
  options: { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>{title}</ThemedText>
            <Pressable onPress={onClose} style={({ pressed }) => [pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={BRAND.textSecondary} size={16} />
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {options.map((opt, i) => (
              <Pressable
                key={opt.id}
                onPress={() => onSelect(opt.id)}
                style={({ pressed }) => [
                  styles.modalRow,
                  i < options.length - 1 && styles.modalRowDivider,
                  selected === opt.id && styles.modalRowSelected,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText style={[styles.modalRowText, selected === opt.id && styles.modalRowTextSelected]}>
                  {opt.label}
                </ThemedText>
                {selected === opt.id && (
                  <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={BRAND.primary} size={14} />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Puja Card ─────────────────────────────────────────────────────────────────
function PujaCard({ puja, gradientIndex }: { puja: PujaInfo; gradientIndex: number }) {
  const gradient = BANNER_GRADIENTS[gradientIndex % BANNER_GRADIENTS.length];

  const formattedDate = (() => {
    try { return new Date(puja.puja_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return puja.puja_date; }
  })();

  return (
    <View style={styles.card}>
      <LinearGradient colors={gradient} style={styles.banner}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerTagBg}>
            <ThemedText style={styles.bannerTag}>🔱 {puja.maas_paksh} • {puja.tithi}</ThemedText>
          </View>
          <ThemedText style={styles.bannerTitle} numberOfLines={3}>{puja.title}</ThemedText>
          <View style={styles.typePillsRow}>
            {(puja.puja_types ?? []).map(tp => (
              <View key={tp} style={styles.typePill}>
                <ThemedText style={styles.typePillText}>{tp}</ThemedText>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.bannerAvatarWrap}>
          <ThemedText style={styles.bannerAvatar}>🛕</ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.subtitleTagRow}>
        <ThemedText style={styles.subtitleTag}>{puja.subtitle}</ThemedText>
      </View>

      <View style={styles.cardBody}>
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
          <ThemedText style={styles.participateBtnText}>PARTICIPATE  ›</ThemedText>
        </LinearGradient>
        <View style={styles.participatePanditAvatar}>
          <ThemedText style={{ fontSize: 22 }}>🛕</ThemedText>
        </View>
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

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F5F0E8', borderRadius: 12,
    paddingHorizontal: 14, height: 42,
    marginHorizontal: Spacing.three, marginBottom: Spacing.two,
  },
  searchInput: { flex: 1, fontSize: 14, color: BRAND.text },

  filtersRow: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: BRAND.border,
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: BRAND.card,
  },
  filterChipActive: { backgroundColor: BRAND.text, borderColor: BRAND.text },
  filterText: { fontSize: 13, fontWeight: '600', color: BRAND.text },
  filterTextActive: { color: '#FFFFFF' },
  pressed: { opacity: 0.85 },

  // Dropdown modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: 24 },
  modalBox: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 10 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BRAND.border },
  modalTitle: { fontSize: 15, fontWeight: '800', color: BRAND.text },
  modalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
  modalRowDivider: { borderBottomWidth: 1, borderBottomColor: BRAND.border },
  modalRowSelected: { backgroundColor: '#FFF8F0' },
  modalRowText: { fontSize: 14, fontWeight: '500', color: BRAND.text },
  modalRowTextSelected: { color: BRAND.primary, fontWeight: '700' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: BRAND.textSecondary, fontWeight: '600' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 40 },

  card: { backgroundColor: BRAND.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: BRAND.border },
  banner: { flexDirection: 'row', padding: 16, minHeight: 140, alignItems: 'center' },
  bannerContent: { flex: 1, gap: 8 },
  bannerTagBg: { backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  bannerTag: { fontSize: 10, fontWeight: '800', color: '#FFD700', letterSpacing: 0.5 },
  bannerTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', lineHeight: 18 },
  typePillsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  typePill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  typePillText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  bannerAvatarWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  bannerAvatar: { fontSize: 40 },

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
