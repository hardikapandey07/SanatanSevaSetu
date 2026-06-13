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
  watchBg: '#2D1F0E',
};

type WebinarData = {
  title: string;
  host: string;
  hostRating: string;
  viewers: string;
  description: string;
  bg: string;
  emoji: string;
  isLive: boolean;
  chapters: { time: string; title: string }[];
};

const WEBINAR_DATA: Record<string, WebinarData> = {
  '5': {
    title: 'Gita Saar Webinar Series',
    host: 'Swami Ramakrishnananda',
    hostRating: '4.9',
    viewers: '1,240',
    bg: '#1A1A1A',
    emoji: '\u2615',
    isLive: true,
    description: 'Deep dive into the Bhagavad Gita with chapter-wise explanations and Q&A sessions.',
    chapters: [
      { time: '00:00', title: 'Introduction and Prayer' },
      { time: '12:30', title: 'Chapter 1 - Arjuna Dilemma' },
      { time: '35:00', title: 'Chapter 2 - Sankhya Yoga' },
      { time: '58:20', title: 'Q and A Session' },
    ],
  },
  '7': {
    title: 'Vedic Astrology Webinar',
    host: 'Jyotish Acharya Sharma',
    hostRating: '4.7',
    viewers: '860',
    bg: '#1E3A5F',
    emoji: '\u2b50',
    isLive: false,
    description: 'Understand your destiny through Vedic astrology. Learn about planetary positions and their impact on your life.',
    chapters: [
      { time: '00:00', title: 'Basics of Jyotish' },
      { time: '18:00', title: 'Planetary Houses Explained' },
      { time: '40:00', title: 'Your Birth Chart' },
      { time: '62:00', title: 'Live Chart Reading' },
    ],
  },
};

export default function WebinarWatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = WEBINAR_DATA[id ?? '5'] ?? WEBINAR_DATA['5'];

  return (
    <View style={styles.root}>
      {/* Video area */}
      <View style={[styles.videoArea, { backgroundColor: data.bg }]}>
        <ThemedText style={styles.videoEmoji}>{data.emoji}</ThemedText>

        <View style={styles.playBtn}>
          <ThemedText style={styles.playIcon}>{'\u25b6'}</ThemedText>
        </View>

        <SafeAreaView edges={['top']} style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <ThemedText style={styles.backIcon}>{'\u2039'}</ThemedText>
          </Pressable>
        </SafeAreaView>

        <View style={styles.videoBottom}>
          {data.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <ThemedText style={styles.liveText}>LIVE</ThemedText>
            </View>
          )}
          <View style={styles.viewerBadge}>
            <ThemedText style={styles.viewerText}>{data.viewers} watching</ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <ThemedText style={styles.title}>{data.title}</ThemedText>

        {/* Host card */}
        <View style={styles.card}>
          <ThemedText style={styles.hostedBy}>Hosted by</ThemedText>
          <View style={styles.hostRow}>
            <View style={styles.hostAvatar}>
              <ThemedText style={styles.hostAvatarText}>{data.host.charAt(0)}</ThemedText>
            </View>
            <ThemedText style={styles.hostName}>{data.host}</ThemedText>
            <View style={styles.ratingRow}>
              <ThemedText style={styles.starEmoji}>{'\u2b50'}</ThemedText>
              <ThemedText style={styles.ratingText}>{data.hostRating}</ThemedText>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.aboutSection}>
          <ThemedText style={styles.sectionTitle}>About This Event</ThemedText>
          <ThemedText style={styles.aboutText}>{data.description}</ThemedText>
        </View>

        {/* Chapters */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Session Chapters</ThemedText>
          {data.chapters.map((ch, i) => (
            <View
              key={ch.time}
              style={[styles.chapterRow, i < data.chapters.length - 1 && styles.chapterDivider]}>
              <View style={styles.chapterTimeBadge}>
                <ThemedText style={styles.chapterTime}>{ch.time}</ThemedText>
              </View>
              <ThemedText style={styles.chapterTitle}>{ch.title}</ThemedText>
              <ThemedText style={styles.chapterPlay}>{'\u25b6'}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <Pressable style={({ pressed }) => [styles.watchBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.watchIcon}>{'\u25b6'}</ThemedText>
          <ThemedText style={styles.watchText}>Watch Live</ThemedText>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.registerBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.registerText}>Register Free</ThemedText>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.shareIcon}>{'\u2934'}</ThemedText>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  videoArea: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoEmoji: { fontSize: 80, opacity: 0.15 },
  playBtn: {
    position: 'absolute',
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  playIcon: { fontSize: 22, color: '#FFFFFF', marginLeft: 4 },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: BRAND.text, lineHeight: 26, marginLeft: -2 },
  videoBottom: {
    position: 'absolute', bottom: 12, left: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: BRAND.liveBg,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  viewerBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  viewerText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.two },

  title: { fontSize: 18, fontWeight: '800', color: BRAND.text },

  card: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1, borderColor: BRAND.border,
    padding: Spacing.three,
    gap: 10,
  },
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

  aboutSection: { gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: BRAND.text },
  aboutText: { fontSize: 13, color: BRAND.textSecondary, lineHeight: 20 },

  chapterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10,
  },
  chapterDivider: { borderBottomWidth: 1, borderBottomColor: BRAND.border },
  chapterTimeBadge: {
    backgroundColor: '#FFF1DE',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    minWidth: 48, alignItems: 'center',
  },
  chapterTime: { fontSize: 11, fontWeight: '700', color: BRAND.primary },
  chapterTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: BRAND.text },
  chapterPlay: { fontSize: 12, color: BRAND.textSecondary },

  bottomBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two, paddingBottom: Spacing.two,
    backgroundColor: BRAND.card,
    borderTopWidth: 1, borderTopColor: BRAND.border,
  },
  watchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: BRAND.watchBg,
    borderRadius: 12, paddingVertical: 13, paddingHorizontal: 18,
  },
  watchIcon: { color: '#FFFFFF', fontSize: 12 },
  watchText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  registerBtn: {
    flex: 1, backgroundColor: BRAND.primary,
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  registerText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  shareBtn: {
    width: 46, height: 46, borderRadius: 12,
    borderWidth: 1.5, borderColor: BRAND.border,
    backgroundColor: BRAND.card,
    alignItems: 'center', justifyContent: 'center',
  },
  shareIcon: { fontSize: 18, color: BRAND.text },

  pressed: { opacity: 0.85 },
});
