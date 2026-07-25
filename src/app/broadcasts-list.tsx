import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ApiService, type Broadcast } from '@/constants/api';
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
  inputBg: '#FFFFFF',
};

const LIVE_BG_COLORS = ['#7A1F18', '#1E3A5F', '#134E4A', '#4A1D96', '#92400E'];
const LIVE_EMOJIS    = ['🪔', '📖', '🔥', '🙏', '🎵'];
const UP_BG_COLORS   = ['#1A3A5F', '#134E4A', '#4A1D96', '#7A3B1E', '#1E4A3A'];
const UP_EMOJIS      = ['🌸', '🏔️', '🪔', '🙏', '⭐'];

export default function BroadcastsListScreen() {
  const t = useT();
  const { type } = useLocalSearchParams<{ type: 'live' | 'upcoming' }>();
  const isLive = type === 'live';

  const [items, setItems] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetch = isLive ? ApiService.getLiveBroadcasts() : ApiService.getUpcomingBroadcasts();
    fetch.then(data => { setItems(data); setLoading(false); });
  }, [isLive]);

  const filtered = search.trim()
    ? items.filter(
        i =>
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.sub_title.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const bgColors = isLive ? LIVE_BG_COLORS : UP_BG_COLORS;
  const emojis   = isLive ? LIVE_EMOJIS    : UP_EMOJIS;

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
              <SymbolView
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                tintColor="#FFFFFF"
                size={20}
              />
            </Pressable>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.headerTitle}>
                {isLive ? t('liveServices') : t('upcomingEvents')}
              </ThemedText>
              {!loading && (
                <ThemedText style={styles.headerCount}>
                  {filtered.length} {isLive ? 'live now' : 'upcoming'}
                </ThemedText>
              )}
            </View>
            {isLive && (
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <ThemedText style={styles.livePillText}>LIVE</ThemedText>
              </View>
            )}
          </View>

          {/* Search bar */}
          <View style={styles.searchWrap}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              tintColor={BRAND.textSecondary}
              size={16}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={isLive ? 'Search live services...' : 'Search upcoming events...'}
              placeholderTextColor={BRAND.textSecondary}
              style={[styles.searchInput, Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null]}
            />
            {!!search && (
              <Pressable onPress={() => setSearch('')} style={({ pressed }) => [pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                  tintColor={BRAND.textSecondary}
                  size={16}
                />
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 48 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <ThemedText style={styles.emptyEmoji}>{isLive ? '📺' : '📅'}</ThemedText>
          <ThemedText style={styles.emptyText}>
            {search ? 'No results found' : isLive ? 'No live services right now' : 'No upcoming events'}
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {filtered.map((item, i) => (
            <BroadcastRow
              key={item.id}
              item={item}
              isLive={isLive}
              bg={bgColors[i % bgColors.length]}
              emoji={emojis[i % emojis.length]}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function BroadcastRow({
  item,
  isLive,
  bg,
  emoji,
}: {
  item: Broadcast;
  isLive: boolean;
  bg: string;
  emoji: string;
}) {
  const dateStr = (() => {
    try {
      return new Date(item.schedule_start_time).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch { return ''; }
  })();

  const onPress = () => {
    if (isLive) {
      router.push({
        pathname: '/webinar-watch',
        params: { id: item.id, title: item.title, sub_title: item.sub_title, is_paid: String(item.is_paid_event) },
      });
    }
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {/* Color thumb */}
      <View style={[styles.thumb, { backgroundColor: bg }]}>
        <ThemedText style={styles.thumbEmoji}>{emoji}</ThemedText>
        {isLive && (
          <View style={styles.thumbLivePill}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.livePillText}>LIVE</ThemedText>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.rowBody}>
        <ThemedText style={styles.rowTitle} numberOfLines={2}>{item.title}</ThemedText>
        {!!item.sub_title && (
          <ThemedText style={styles.rowSub} numberOfLines={1}>{item.sub_title}</ThemedText>
        )}
        {!!dateStr && (
          <ThemedText style={styles.rowDate}>📅 {dateStr}</ThemedText>
        )}
        <View style={styles.rowFooter}>
          <View style={[styles.priceBadge, !item.is_paid_event && styles.priceBadgeFree]}>
            <ThemedText style={styles.priceText}>
              {item.is_paid_event && item.event_price != null ? `₹${item.event_price}` : 'Free'}
            </ThemedText>
          </View>
          {isLive && (
            <View style={styles.watchBtn}>
              <ThemedText style={styles.watchBtnText}>▶ Watch</ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  header: { paddingBottom: Spacing.two },
  headerInner: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerCount: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  livePillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: BRAND.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14, height: 44,
    marginBottom: Spacing.two,
  },
  searchInput: { flex: 1, fontSize: 14, color: BRAND.text },

  list: { padding: Spacing.three, gap: 12, paddingBottom: Spacing.five },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: BRAND.textSecondary, fontWeight: '600' },

  row: {
    flexDirection: 'row',
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    overflow: 'hidden',
  },
  thumb: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbEmoji: { fontSize: 32, opacity: 0.7 },
  thumbLivePill: {
    position: 'absolute', bottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999,
  },

  rowBody: { flex: 1, padding: 12, gap: 4, justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '700', color: BRAND.text, lineHeight: 18 },
  rowSub: { fontSize: 12, color: BRAND.textSecondary },
  rowDate: { fontSize: 11, color: BRAND.textSecondary, marginTop: 2 },
  rowFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },

  priceBadge: {
    backgroundColor: '#E8731C',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999,
  },
  priceBadgeFree: { backgroundColor: '#16A34A' },
  priceText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  watchBtn: {
    backgroundColor: BRAND.primary,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
  },
  watchBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  pressed: { opacity: 0.85 },
});
