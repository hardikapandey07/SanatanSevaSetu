import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ApiService, formatGoLiveDate, mergeBroadcasts, type BroadcastItem } from '@/constants/api';
import { MessageModal } from '@/components/message-modal';
import { getApiBaseUrl } from '@/constants/environment';
import { Spacing } from '@/constants/theme';
import { useLanguage, useT, useTranslatedBatch } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';
import { EmptyState } from '@/components/empty-state';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  chipBg: '#EDE3D2',
};

type Filter = 'All' | 'Free' | 'Paid';

const FILTERS: { key: Filter; emoji: string; labelKey: TranslationKey }[] = [
  { key: 'All',  emoji: '🙏', labelKey: 'filterAll'  },
  { key: 'Free', emoji: '🎁', labelKey: 'filterFree' },
  { key: 'Paid', emoji: '💰', labelKey: 'filterPaid' },
];

const FALLBACK_COLORS = ['#7A1F18', '#1A3A5F', '#134E4A', '#4A1D96', '#7A3B1E'];
const FALLBACK_EMOJIS = ['🪔', '📖', '🔥', '🙏', '⭐'];

export default function EventsScreen() {
  const t = useT();
  const { lang } = useLanguage();
  const [services, setServices] = useState<BroadcastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('All');
  const loadedOnce = useRef(false);
  // Formatted go-live date of the tapped upcoming service; null = notice hidden
  const [upcomingNotice, setUpcomingNotice] = useState<string | null>(null);

  // Refetch on every focus so services added while the app is open appear here.
  useFocusEffect(
    useCallback(() => {
      if (!loadedOnce.current) setLoading(true);
      Promise.all([
        ApiService.getLiveBroadcasts(),
        ApiService.getUpcomingBroadcasts(),
      ]).then(([live, upcoming]) => {
        setServices(mergeBroadcasts(live, upcoming));
        setLoading(false);
        loadedOnce.current = true;
      });
    }, [lang]),
  );

  const filtered = services.filter(s => {
    if (filter === 'Free') return !s.is_paid_event;
    if (filter === 'Paid') return s.is_paid_event;
    return true;
  });

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <ThemedText style={styles.headerTitle}>{t('eventsTitle')}</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{t('eventsSubtitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      {/* Filter chips — temporarily commented out
      <View style={styles.chipRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {FILTERS.map(f => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={({ pressed }) => [
                styles.chip,
                filter === f.key && styles.chipActive,
                pressed && styles.pressed,
              ]}>
              <ThemedText style={styles.chipEmoji}>{f.emoji}</ThemedText>
              <ThemedText style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
                {t(f.labelKey)}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      */}

      {loading ? (
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <EmptyState message={t('noEventsFound')} />
            </View>
          ) : (
            filtered.map((item, i) => (
              <ServiceCard
                key={item.id}
                item={item}
                colorIndex={i}
                onUpcomingPress={setUpcomingNotice}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Upcoming service notice */}
      <MessageModal
        visible={upcomingNotice !== null}
        onClose={() => setUpcomingNotice(null)}
        type="info"
        title={t('upcomingEventTitle')}
        message={t('upcomingEventMsg').replace('{date}', upcomingNotice ?? '')}
      />
    </View>
  );
}

function ServiceCard({ item, colorIndex, onUpcomingPress }: {
  item: BroadcastItem;
  colorIndex: number;
  onUpcomingPress: (whenStr: string) => void;
}) {
  const t = useT();
  const [title, subTitle] = useTranslatedBatch([item.title, item.sub_title]);
  const imageUri = item.image_url ? `${getApiBaseUrl()}/${item.image_url}` : null;
  const fallbackBg = FALLBACK_COLORS[colorIndex % FALLBACK_COLORS.length];
  const fallbackEmoji = FALLBACK_EMOJIS[colorIndex % FALLBACK_EMOJIS.length];

  const dateStr = (() => {
    try {
      return new Date(item.schedule_start_time).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch { return ''; }
  })();

  const timeStr = (() => {
    try {
      return new Date(item.schedule_start_time).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch { return ''; }
  })();

  const priceLabel = item.is_paid_event && item.event_price != null
    ? `₹${item.event_price.toLocaleString()}`
    : t('free');

  const openStream = () => router.push({
    pathname: '/webinar-watch',
    params: {
      id: item.id,
      title: item.title,
      sub_title: item.sub_title,
      is_paid: String(item.is_paid_event),
    },
  });

  return (
    <Pressable
      onPress={
        item.isLive
          ? openStream
          : () => onUpcomingPress(formatGoLiveDate(item.schedule_start_time))
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {/* Image */}
      <View style={[styles.cardImg, { backgroundColor: fallbackBg }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <ThemedText style={styles.cardEmoji}>{fallbackEmoji}</ThemedText>
        )}

        {/* Live / Upcoming badge */}
        {item.isLive ? (
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.livePillText}>LIVE</ThemedText>
          </View>
        ) : (
          <View style={styles.statusBadge}>
            <ThemedText style={styles.statusText}>📅 {t('upcomingEvents')}</ThemedText>
          </View>
        )}

        {/* Price badge */}
        <View style={[styles.priceBadge, !item.is_paid_event && styles.priceBadgeFree]}>
          <ThemedText style={styles.priceText}>{priceLabel}</ThemedText>
        </View>

        {/* Title overlay */}
        <View style={styles.cardOverlay}>
          <ThemedText style={styles.cardTitle} numberOfLines={2}>{title}</ThemedText>
          {!!subTitle && (
            <ThemedText style={styles.cardSubtitle} numberOfLines={1}>{subTitle}</ThemedText>
          )}
        </View>
      </View>

      {/* Meta — divider only when an action row follows it */}
      <View style={[styles.cardMeta, item.isLive && styles.cardMetaDivider]}>
        {!!dateStr && (
          <View style={styles.metaItem}>
            <ThemedText style={styles.metaIcon}>📅</ThemedText>
            <ThemedText style={styles.metaText}>{dateStr}</ThemedText>
          </View>
        )}
        {!!timeStr && (
          <View style={styles.metaItem}>
            <ThemedText style={styles.metaIcon}>🕐</ThemedText>
            <ThemedText style={styles.metaText}>{timeStr}</ThemedText>
          </View>
        )}
      </View>

      {/* Action */}
      {item.isLive && (
        <View style={styles.actionRow}>
          <Pressable
            onPress={openStream}
            style={({ pressed }) => [styles.joinBtn, pressed && styles.pressed]}>
            <ThemedText style={styles.joinBtnText}>{t('joinNowBtn')}</ThemedText>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  header: { paddingBottom: Spacing.three },
  headerInner: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  chipRow: { backgroundColor: BRAND.bg, paddingVertical: 12 },
  chipScroll: { paddingHorizontal: Spacing.three, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, backgroundColor: BRAND.chipBg,
  },
  chipActive: { backgroundColor: BRAND.primary },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: 13, fontWeight: '600', color: BRAND.text },
  chipTextActive: { color: '#FFFFFF' },

  scroll: { flex: 1 },
  // paddingTop replaces the spacing the (now hidden) filter chip row provided
  scrollContent: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.five, gap: 14 },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },

  card: {
    backgroundColor: BRAND.card,
    borderRadius: 16,
    borderWidth: 1, borderColor: BRAND.border,
    overflow: 'hidden',
  },
  cardImg: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardEmoji: { fontSize: 72, opacity: 0.35 },

  statusBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  statusText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  livePill: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  livePillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

  priceBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  priceBadgeFree: { backgroundColor: '#16A34A' },
  priceText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },

  cardOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    gap: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  cardSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  cardMeta: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    gap: 12, flexWrap: 'wrap',
  },
  cardMetaDivider: { borderBottomWidth: 1, borderBottomColor: BRAND.border },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 12 },
  metaText: { fontSize: 12, color: BRAND.textSecondary, fontWeight: '500' },

  actionRow: { paddingHorizontal: 14, paddingVertical: 12 },
  joinBtn: {
    backgroundColor: BRAND.primary,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  joinBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  preBookBtn: {
    backgroundColor: '#F5EFE6',
    borderWidth: 1, borderColor: BRAND.border,
  },
  preBookBtnText: { color: BRAND.textSecondary, fontSize: 14, fontWeight: '800' },

  pressed: { opacity: 0.88 },
});
