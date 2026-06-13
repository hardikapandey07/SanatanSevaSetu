import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  liveBg: '#DC2626',
  chipBg: '#F3EAD7',
  watchBg: '#2D1F0E',
};

const EVENT_DETAILS: Record<string, {
  title: string;
  isLive: boolean;
  bg: string;
  emoji: string;
  date: string;
  time: string;
  location: string;
  registered: number;
  capacity: number;
  host: string;
  hostRating: string;
  price: string;
  description: string;
}> = {
  '1': {
    title: 'Ganesh Chaturthi Mahotsav 2025', isLive: false, bg: '#F0EAE0', emoji: '🐘',
    date: 'Sep 7, 2025', time: '6:00 PM – 9:00 PM', location: 'Siddhivinayak Temple, Mumbai',
    registered: 3200, capacity: 5000, host: 'Siddhivinayak Trust', hostRating: '4.8',
    price: 'FREE', description: 'Celebrate the grand festival of Lord Ganesha with devotional songs, aarti, and prasad distribution at Siddhivinayak Temple.',
  },
  '2': {
    title: 'Om Namah Shivaya Chanting', isLive: false, bg: '#C9D8E8', emoji: '🙏',
    date: 'Oct 5, 2025', time: '5:30 PM – 7:30 PM', location: 'Kashi Vishwanath, Varanasi',
    registered: 980, capacity: 2000, host: 'Pandit Suresh Kumar', hostRating: '4.7',
    price: '₹2,499', description: 'A deeply meditative chanting session of Om Namah Shivaya led by experienced pandits at the holy banks of Ganga.',
  },
  '3': {
    title: 'Live Sound Healing Session', isLive: true, bg: '#1A1A1A', emoji: '🎵',
    date: 'Oct 1, 2025', time: '4:00 PM – 5:30 PM', location: 'Online',
    registered: 540, capacity: 1000, host: 'Dr. Anjali Verma', hostRating: '4.9',
    price: 'FREE', description: 'Experience the healing power of Tibetan singing bowls and sacred mantras in this live online session.',
  },
  '4': {
    title: 'Independence Day Special Aarti', isLive: false, bg: '#1E7FBF', emoji: '🇮🇳',
    date: 'Aug 15, 2025', time: '7:00 AM – 8:30 AM', location: 'India Gate, New Delhi',
    registered: 1500, capacity: 3000, host: 'Rashtriya Dharma Manch', hostRating: '4.6',
    price: '₹499', description: 'A special patriotic aarti and puja to celebrate Independence Day at the iconic India Gate.',
  },
  '5': {
    title: 'Gita Saar Webinar Series', isLive: true, bg: '#1A1A1A', emoji: '☕',
    date: 'Oct 2, 2025', time: '7:00 PM – 9:00 PM', location: 'Online',
    registered: 1240, capacity: 5000, host: 'Swami Ramakrishnananda', hostRating: '4.9',
    price: 'FREE', description: 'Deep dive into the Bhagavad Gita with chapter-wise explanations and Q&A sessions.',
  },
  '6': {
    title: 'Sunderkand Katha Live', isLive: true, bg: '#7A1F18', emoji: '🪔',
    date: 'Oct 3, 2025', time: '6:00 PM – 9:00 PM', location: 'Online',
    registered: 2400, capacity: 5000, host: 'Pt. Ramesh Sharma', hostRating: '4.9',
    price: '₹999', description: 'Join 2,400+ devotees for a live recitation of Sunderkand Katha — the glorious episode of Hanuman from the Ramcharitmanas.',
  },
  '7': {
    title: 'Vedic Astrology Webinar', isLive: false, bg: '#1E3A5F', emoji: '⭐',
    date: 'Oct 10, 2025', time: '6:30 PM – 8:30 PM', location: 'Online',
    registered: 860, capacity: 2000, host: 'Jyotish Acharya Sharma', hostRating: '4.7',
    price: '₹499', description: 'Understand your destiny through Vedic astrology. Learn about planetary positions and their impact on your life.',
  },
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ev = EVENT_DETAILS[id ?? '5'] ?? EVENT_DETAILS['5'];
  const pct = Math.round((ev.registered / ev.capacity) * 100);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={[styles.hero, { backgroundColor: ev.bg }]}>
          <ThemedText style={styles.heroEmoji}>{ev.emoji}</ThemedText>

          <SafeAreaView edges={['top']} style={styles.heroTopBar}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.backIcon}>‹</ThemedText>
            </Pressable>
          </SafeAreaView>

          <View style={styles.heroOverlay}>
            {ev.isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <ThemedText style={styles.liveText}>LIVE</ThemedText>
              </View>
            )}
            <ThemedText style={styles.heroTitle}>{ev.title}</ThemedText>
          </View>
        </View>

        {/* ── Date / Time / Location chips ── */}
        <View style={styles.chipsWrap}>
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <ThemedText style={styles.chipIcon}>📅</ThemedText>
              <ThemedText style={styles.chipText}>{ev.date}</ThemedText>
            </View>
            <View style={styles.chip}>
              <ThemedText style={styles.chipIcon}>🕖</ThemedText>
              <ThemedText style={styles.chipText}>{ev.time}</ThemedText>
            </View>
          </View>
          <View style={styles.chip}>
            <ThemedText style={styles.chipIcon}>📍</ThemedText>
            <ThemedText style={styles.chipText}>{ev.location}</ThemedText>
          </View>
        </View>

        {/* ── Registration progress ── */}
        <View style={styles.card}>
          <View style={styles.regTopRow}>
            <View style={styles.regLabelRow}>
              <ThemedText style={styles.regIcon}>👥</ThemedText>
              <ThemedText style={styles.regLabel}>
                {ev.registered.toLocaleString()} registered
              </ThemedText>
            </View>
            <ThemedText style={styles.regPct}>{pct}% full</ThemedText>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
          </View>
        </View>

        {/* ── Host card ── */}
        <View style={styles.card}>
          <ThemedText style={styles.hostedBy}>Hosted by</ThemedText>
          <View style={styles.hostRow}>
            <View style={styles.hostAvatar}>
              <ThemedText style={styles.hostAvatarText}>{ev.host.charAt(0)}</ThemedText>
            </View>
            <ThemedText style={styles.hostName}>{ev.host}</ThemedText>
            <View style={styles.ratingRow}>
              <ThemedText style={styles.starEmoji}>⭐</ThemedText>
              <ThemedText style={styles.ratingText}>{ev.hostRating}</ThemedText>
            </View>
          </View>
        </View>

        {/* ── About ── */}
        <View style={styles.aboutSection}>
          <ThemedText style={styles.aboutTitle}>About This Event</ThemedText>
          <ThemedText style={styles.aboutText}>{ev.description}</ThemedText>
        </View>
      </ScrollView>

      {/* ── Sticky bottom action bar ── */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <Pressable style={({ pressed }) => [styles.watchBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.watchBtnIcon}>▶</ThemedText>
          <ThemedText style={styles.watchBtnText}>Watch Live</ThemedText>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.registerBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.registerBtnText}>
            {ev.price === 'FREE' ? 'Register Free' : `Register · ${ev.price}`}
          </ThemedText>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.shareIcon}>⤴</ThemedText>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.three },

  // Hero
  hero: { height: 260, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  heroEmoji: { fontSize: 80, opacity: 0.2 },
  heroTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: BRAND.text, lineHeight: 26, marginLeft: -2 },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, paddingTop: Spacing.four,
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: BRAND.liveBg,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },

  // Chips
  chipsWrap: {
    padding: Spacing.three,
    gap: 8,
  },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: BRAND.chipBg,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, alignSelf: 'flex-start',
  },
  chipIcon: { fontSize: 13 },
  chipText: { fontSize: 13, fontWeight: '600', color: BRAND.text },

  // Cards
  card: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1, borderColor: BRAND.border,
    padding: Spacing.three,
    gap: 10,
  },

  // Progress
  regTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  regLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  regIcon: { fontSize: 14 },
  regLabel: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  regPct: { fontSize: 13, color: BRAND.textSecondary, fontWeight: '600' },
  progressBg: { height: 6, backgroundColor: '#EDE3D2', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: BRAND.primary, borderRadius: 3 },

  // Host
  hostedBy: { fontSize: 12, color: BRAND.textSecondary, fontWeight: '600' },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hostAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFF1DE',
    borderWidth: 2, borderColor: BRAND.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  hostAvatarText: { fontSize: 20, fontWeight: '800', color: BRAND.primary },
  hostName: { flex: 1, fontSize: 15, fontWeight: '800', color: BRAND.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starEmoji: { fontSize: 14 },
  ratingText: { fontSize: 14, fontWeight: '700', color: BRAND.text },

  // About
  aboutSection: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    gap: 8,
  },
  aboutTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },
  aboutText: { fontSize: 14, color: BRAND.textSecondary, lineHeight: 22 },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    backgroundColor: BRAND.card,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
  },
  watchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: BRAND.watchBg,
    borderRadius: 12,
    paddingVertical: 13, paddingHorizontal: 18,
  },
  watchBtnIcon: { color: '#FFFFFF', fontSize: 12 },
  watchBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  registerBtn: {
    flex: 1,
    backgroundColor: BRAND.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  registerBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  shareBtn: {
    width: 46, height: 46, borderRadius: 12,
    borderWidth: 1.5, borderColor: BRAND.border,
    backgroundColor: BRAND.card,
    alignItems: 'center', justifyContent: 'center',
  },
  shareIcon: { fontSize: 18, color: BRAND.text },

  pressed: { opacity: 0.85 },
});
