import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ApiService, type Event } from '@/constants/api';
import { getApiBaseUrl } from '@/constants/environment';
import { Spacing } from '@/constants/theme';
import { useLanguage, useT, useTranslatedBatch } from '@/i18n/LanguageContext';

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

type Filter = 'All' | 'Free' | 'Paid' | 'Online' | 'Offline';

const FILTERS: { key: Filter; emoji: string }[] = [
  { key: 'All',     emoji: '🙏' },
  { key: 'Free',    emoji: '🎁' },
  { key: 'Paid',    emoji: '💰' },
  { key: 'Online',  emoji: '💻' },
  { key: 'Offline', emoji: '📍' },
];

const FALLBACK_COLORS = ['#7A1F18', '#1A3A5F', '#134E4A', '#4A1D96', '#7A3B1E'];

export default function EventsScreen() {
  const t = useT();
  const { lang } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    setLoading(true);
    ApiService.getUpcomingEvents().then(data => {
      setEvents(data);
      setLoading(false);
    });
  }, [lang]);

  const filtered = events.filter(e => {
    if (filter === 'Free')    return !e.is_paid;
    if (filter === 'Paid')    return e.is_paid;
    if (filter === 'Online')  return e.is_online;
    if (filter === 'Offline') return !e.is_online;
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

      {/* Filter chips */}
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
                {f.key}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <ThemedText style={styles.emptyEmoji}>🙏</ThemedText>
              <ThemedText style={styles.emptyText}>No events found</ThemedText>
            </View>
          ) : (
            filtered.map((ev, i) => (
              <EventCard key={ev.id} event={ev} colorIndex={i} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

function EventCard({ event, colorIndex }: { event: Event; colorIndex: number }) {
  const t = useT();
  const [eventName, venueName, description] = useTranslatedBatch([
    event.event_name,
    event.venue_name,
    event.description,
  ]);
  const imageUri = event.mobile_image_url
    ? `${getApiBaseUrl()}/${event.mobile_image_url}`
    : null;
  const fallbackBg = FALLBACK_COLORS[colorIndex % FALLBACK_COLORS.length];

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch { return date; }
  };

  const formatTime = (time: string) => {
    try {
      const [h, m] = time.split(':').map(Number);
      const d = new Date(); d.setHours(h, m);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return time; }
  };

  const priceLabel = event.is_paid && event.amount != null
    ? `₹${event.amount.toLocaleString()}`
    : 'FREE';

  const onPress = () => router.push({
    pathname: '/event-detail',
    params: {
      id: event.id,
      title: event.event_name,
      subtitle: event.venue_name,
      description: event.description,
      date: `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`,
      time: `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`,
      location: event.venue_name,
      price: priceLabel,
      isOnline: String(event.is_online),
      status: event.status,
      imageUri: imageUri ?? '',
    },
  });

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {/* Image */}
      <View style={[styles.cardImg, { backgroundColor: fallbackBg }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <ThemedText style={styles.cardEmoji}>🎉</ThemedText>
        )}

        {/* Status badge */}
        {event.status === 'SCHEDULED' && (
          <View style={styles.statusBadge}>
            <ThemedText style={styles.statusText}>📅 Scheduled</ThemedText>
          </View>
        )}

        {/* Price badge */}
        <View style={[styles.priceBadge, !event.is_paid && styles.priceBadgeFree]}>
          <ThemedText style={styles.priceText}>{priceLabel}</ThemedText>
        </View>

        {/* Online/Offline pill */}
        <View style={styles.modePill}>
          <ThemedText style={styles.modePillText}>
            {event.is_online ? '💻 Online' : '📍 In-Person'}
          </ThemedText>
        </View>

        {/* Title overlay */}
        <View style={styles.cardOverlay}>
          <ThemedText style={styles.cardTitle} numberOfLines={2}>{eventName}</ThemedText>
          {!!venueName && (
            <ThemedText style={styles.cardSubtitle} numberOfLines={1}>📍 {venueName}</ThemedText>
          )}
        </View>
      </View>

      {/* Meta */}
      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <ThemedText style={styles.metaIcon}>📅</ThemedText>
          <ThemedText style={styles.metaText}>
            {formatDate(event.start_date)}
            {event.start_date !== event.end_date ? ` – ${formatDate(event.end_date)}` : ''}
          </ThemedText>
        </View>
        <View style={styles.metaItem}>
          <ThemedText style={styles.metaIcon}>🕐</ThemedText>
          <ThemedText style={styles.metaText}>{formatTime(event.start_time)}</ThemedText>
        </View>
        <Pressable onPress={onPress} style={styles.viewDetailBtn}>
          <ThemedText style={styles.viewDetailText}>{t('viewDetails')} ›</ThemedText>
        </Pressable>
      </View>

      {/* Description */}
      {!!description && (
        <View style={styles.descRow}>
          <ThemedText style={styles.descText} numberOfLines={2}>{description}</ThemedText>
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
  scrollContent: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.five, gap: 14 },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: BRAND.textSecondary, fontWeight: '600' },

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
  cardEmoji: { fontSize: 72, opacity: 0.25 },

  statusBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  statusText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  priceBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  priceBadgeFree: { backgroundColor: '#16A34A' },
  priceText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },

  modePill: {
    position: 'absolute', bottom: 52, left: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  modePillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

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
    borderBottomWidth: 1, borderBottomColor: BRAND.border,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 12 },
  metaText: { fontSize: 12, color: BRAND.textSecondary, fontWeight: '500' },
  viewDetailBtn: { marginLeft: 'auto' },
  viewDetailText: { fontSize: 13, fontWeight: '700', color: BRAND.primary },

  descRow: { paddingHorizontal: 14, paddingVertical: 10 },
  descText: { fontSize: 13, color: BRAND.textSecondary, lineHeight: 19 },

  pressed: { opacity: 0.88 },
});
