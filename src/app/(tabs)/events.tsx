import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
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
  chipBg: '#EDE3D2',
  liveBg: '#DC2626',
};

type Category = 'All' | 'Festival' | 'Katha' | 'Aarti' | 'Webinar' | 'More';
const CATEGORIES: Category[] = ['All', 'Festival', 'Katha', 'Aarti', 'Webinar'];

type EventItem = {
  id: string;
  title: string;
  category: Category;
  price: string | 'FREE';
  isLive?: boolean;
  emoji: string;
  bg: string;
  // Webinar-only fields
  date?: string;
  location?: string;
  going?: string;
};

const EVENTS: EventItem[] = [
  {
    id: '1',
    title: 'Ganesh Chaturthi Mahotsav 2025',
    category: 'Festival',
    price: 'FREE',
    emoji: '🐘',
    bg: '#F0EAE0',
  },
  {
    id: '2',
    title: 'Om Namah Shivaya Chanting',
    category: 'Katha',
    price: '₹2,499',
    emoji: '🙏',
    bg: '#C9D8E8',
  },
  {
    id: '3',
    title: 'Live Sound Healing Session',
    category: 'Aarti',
    price: 'FREE',
    isLive: true,
    emoji: '🎵',
    bg: '#1A1A1A',
  },
  {
    id: '4',
    title: 'Independence Day Special Aarti',
    category: 'Aarti',
    price: '₹499',
    emoji: '🇮🇳',
    bg: '#1E7FBF',
  },
  {
    id: '5',
    title: 'Gita Saar Webinar Series',
    category: 'Webinar',
    price: 'FREE',
    isLive: true,
    emoji: '☕',
    bg: '#1A1A1A',
    date: 'Oct 2, 2025',
    location: 'Online',
    going: '1,240 going',
  },
  {
    id: '6',
    title: 'Sunderkand Katha Live',
    category: 'Katha',
    price: '₹999',
    isLive: true,
    emoji: '🪔',
    bg: '#7A1F18',
  },
  {
    id: '7',
    title: 'Vedic Astrology Webinar',
    category: 'Webinar',
    price: '₹499',
    emoji: '⭐',
    bg: '#1E3A5F',
    date: 'Oct 10, 2025',
    location: 'Online',
    going: '860 going',
  },
];

export default function EventsScreen() {
  const t = useT();
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filtered =
    activeCategory === 'All'
      ? EVENTS
      : EVENTS.filter(e => e.category === activeCategory);

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <ThemedText style={styles.headerTitle}>Spiritual Events</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Festivals, kathas, webinars & more</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      {/* Category filter chips */}
      <View style={styles.chipRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={({ pressed }) => [
                styles.chip,
                activeCategory === cat && styles.chipActive,
                pressed && styles.pressed,
              ]}>
              <ThemedText
                style={[
                  styles.chipText,
                  activeCategory === cat && styles.chipTextActive,
                ]}>
                {cat}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Event list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {filtered.map(ev => (
          <EventCard key={ev.id} event={ev} />
        ))}
      </ScrollView>
    </View>
  );
}

function EventCard({ event }: { event: EventItem }) {
  if (event.category === 'Webinar') {
    return <WebinarCard event={event} />;
  }
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.cardImg, { backgroundColor: event.bg }]}>
        <ThemedText style={styles.cardEmoji}>{event.emoji}</ThemedText>
        <View style={styles.cardOverlay}>
          <ThemedText style={styles.cardTitle} numberOfLines={1}>{event.title}</ThemedText>
        </View>
        {event.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveText}>LIVE</ThemedText>
          </View>
        )}
        <View style={[styles.priceBadge, event.price === 'FREE' && styles.priceBadgeFree]}>
          <ThemedText style={styles.priceText}>{event.price}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

function WebinarCard({ event }: { event: EventItem }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}
      style={({ pressed }) => [styles.webinarCard, pressed && styles.pressed]}>
      {/* Image block */}
      <View style={[styles.webinarImg, { backgroundColor: event.bg }]}>
        <ThemedText style={styles.webinarEmoji}>{event.emoji}</ThemedText>
        {event.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveText}>LIVE</ThemedText>
          </View>
        )}
        <View style={[styles.priceBadge, event.price === 'FREE' && styles.priceBadgeFree]}>
          <ThemedText style={styles.priceText}>{event.price}</ThemedText>
        </View>
      </View>

      {/* Card body */}
      <View style={styles.webinarBody}>
        <View style={styles.webinarTitleRow}>
          <ThemedText style={styles.webinarTitle} numberOfLines={1}>{event.title}</ThemedText>
          <View style={styles.webinarCatPill}>
            <ThemedText style={styles.webinarCatText}>Webinar</ThemedText>
          </View>
        </View>
        {event.date && (
          <View style={styles.webinarMetaRow}>
            <ThemedText style={styles.webinarMetaIcon}>📅</ThemedText>
            <ThemedText style={styles.webinarMeta}>{event.date}</ThemedText>
          </View>
        )}
        {event.location && (
          <View style={styles.webinarMetaRow}>
            <ThemedText style={styles.webinarMetaIcon}>📍</ThemedText>
            <ThemedText style={styles.webinarMeta}>{event.location}</ThemedText>
          </View>
        )}
        <View style={styles.webinarFooter}>
          {event.going && (
            <View style={styles.webinarGoingRow}>
              <ThemedText style={styles.webinarMetaIcon}>👥</ThemedText>
              <ThemedText style={styles.webinarMeta}>{event.going}</ThemedText>
            </View>
          )}
          <Pressable
            onPress={() => router.push({ pathname: '/webinar-watch', params: { id: event.id } })}
            style={({ pressed }) => [styles.watchBtn, pressed && styles.pressed]}>
            <ThemedText style={styles.watchBtnText}>Watch</ThemedText>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  header: { paddingBottom: Spacing.three },
  headerInner: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  chipRow: {
    backgroundColor: BRAND.bg,
    paddingVertical: 12,
  },
  chipScroll: { paddingHorizontal: Spacing.three, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: BRAND.chipBg,
  },
  chipActive: { backgroundColor: BRAND.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: BRAND.text },
  chipTextActive: { color: '#FFFFFF' },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
    gap: 12,
  },

  card: { borderRadius: 14, overflow: 'hidden' },
  cardImg: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardEmoji: { fontSize: 40, opacity: 0.35 },

  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  // Webinar card
  webinarCard: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    overflow: 'hidden',
  },
  webinarImg: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  webinarEmoji: { fontSize: 50, opacity: 0.3 },
  webinarBody: { padding: Spacing.three, gap: 6 },
  webinarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  webinarTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: BRAND.text },
  webinarCatPill: {
    backgroundColor: '#FFF1DE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  webinarCatText: { fontSize: 11, fontWeight: '700', color: BRAND.primary },
  webinarMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  webinarMetaIcon: { fontSize: 12 },
  webinarMeta: { fontSize: 13, color: BRAND.textSecondary },
  webinarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  webinarGoingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  watchBtn: {
    backgroundColor: BRAND.primary,
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 999,
  },
  watchBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: BRAND.liveBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

  priceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  priceBadgeFree: { backgroundColor: 'rgba(0,0,0,0.45)' },
  priceText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  pressed: { opacity: 0.88 },
});
