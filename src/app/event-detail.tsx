import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
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
  liveBg: '#DC2626',
  chipBg: '#F3EAD7',
};

// Fallback detail data removed — all data comes from API params now

export default function EventDetailScreen() {
  const t = useT();
  const params = useLocalSearchParams<{
    id: string; title: string; subtitle: string;
    description: string; date: string; time: string;
    location: string; price: string;
    isOnline: string; status: string; imageUri: string;
    // legacy params kept for broadcast events
    category?: string; isLive?: string; emoji?: string; bg?: string;
    host?: string; registered?: string; capacity?: string;
  }>();

  const isLive = params.isLive === 'true';
  const isFree = params.price === 'FREE';
  const imageUri = params.imageUri || null;
  const fallbackBg = params.bg || '#7A1F18';

  const handleShare = async () => {
    try {
      await Share.share({ message: `${params.title} — ${params.date} at ${params.location}` });
    } catch {}
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: fallbackBg }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <ThemedText style={styles.heroEmoji}>{params.emoji || '🎉'}</ThemedText>
          )}
          <View style={styles.heroScrim} />

          <SafeAreaView edges={['top']} style={styles.heroTopBar}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
              <SymbolView
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                tintColor={BRAND.text} size={18}
              />
            </Pressable>
          </SafeAreaView>

          <View style={styles.heroOverlay}>
            <View style={styles.heroTopBadges}>
              {isLive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <ThemedText style={styles.liveText}>LIVE</ThemedText>
                </View>
              )}
              {!!params.status && params.status !== 'LIVE' && (
                <View style={styles.statusBadge}>
                  <ThemedText style={styles.statusText}>📅 {params.status}</ThemedText>
                </View>
              )}
              <View style={[styles.priceBadge, isFree && styles.priceBadgeFree]}>
                <ThemedText style={styles.priceText}>{params.price}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.heroTitle}>{params.title}</ThemedText>
            {!!params.subtitle && (
              <ThemedText style={styles.heroSubtitle}>{params.subtitle}</ThemedText>
            )}
          </View>
        </View>

        {/* Chips */}
        <View style={styles.chipsWrap}>
          {!!params.date && (
            <View style={styles.chip}>
              <ThemedText style={styles.chipIcon}>📅</ThemedText>
              <ThemedText style={styles.chipText}>{params.date}</ThemedText>
            </View>
          )}
          {!!params.time && (
            <View style={styles.chip}>
              <ThemedText style={styles.chipIcon}>🕐</ThemedText>
              <ThemedText style={styles.chipText}>{params.time}</ThemedText>
            </View>
          )}
          {!!params.location && (
            <View style={styles.chip}>
              <ThemedText style={styles.chipIcon}>📍</ThemedText>
              <ThemedText style={styles.chipText}>{params.location}</ThemedText>
            </View>
          )}
          {params.isOnline !== undefined && (
            <View style={[styles.chip, styles.chipCategory]}>
              <ThemedText style={styles.chipIcon}>{params.isOnline === 'true' ? '💻' : '🏛️'}</ThemedText>
              <ThemedText style={[styles.chipText, { color: BRAND.primary }]}>
                {params.isOnline === 'true' ? 'Online' : 'In-Person'}
              </ThemedText>
            </View>
          )}
        </View>

        {/* About */}
        {!!params.description && (
          <View style={styles.card}>
            <ThemedText style={styles.aboutTitle}>About This Event</ThemedText>
            <ThemedText style={styles.aboutText}>{params.description}</ThemedText>
          </View>
        )}

        {/* What to expect */}
        <View style={styles.card}>
          <ThemedText style={styles.aboutTitle}>What to Expect</ThemedText>
          {['Spiritual experience & divine blessings', 'Connect with fellow devotees', 'Receive prasad & blessings', 'Memorable devotional experience'].map((item, i) => (
            <View key={i} style={styles.expectRow}>
              <View style={styles.expectDot} />
              <ThemedText style={styles.expectText}>{item}</ThemedText>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Bottom action bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <Pressable
          onPress={() => router.push({ pathname: '/webinar-watch', params: { id: params.id, title: params.title, sub_title: params.subtitle ?? '', is_paid: String(!isFree) } })}
          style={({ pressed }) => [styles.registerBtn, pressed && styles.pressed]}>
          <LinearGradient
            colors={[BRAND.primary, BRAND.primaryDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.registerBtnGradient}>
            <ThemedText style={styles.registerBtnText}>
              {isFree ? 'Register Free' : `Register · ${params.price}`}
            </ThemedText>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={handleShare} style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }}
            tintColor={BRAND.text} size={18}
          />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.three },

  hero: { height: 280, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  heroEmoji: { fontSize: 100, opacity: 0.15 },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  heroTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, paddingTop: Spacing.four,
    backgroundColor: 'rgba(0,0,0,0.5)', gap: 6,
  },
  heroTopBadges: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: BRAND.liveBg,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  statusBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  statusText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  priceBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  priceBadgeFree: { backgroundColor: '#16A34A' },
  priceText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.three, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: BRAND.chipBg,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
  },
  chipCategory: { backgroundColor: '#FFF1DE', borderWidth: 1, borderColor: BRAND.primary },
  chipIcon: { fontSize: 13 },
  chipText: { fontSize: 13, fontWeight: '600', color: BRAND.text },

  card: {
    marginHorizontal: Spacing.three, marginBottom: Spacing.two,
    backgroundColor: BRAND.card, borderRadius: 14,
    borderWidth: 1, borderColor: BRAND.border,
    padding: Spacing.three, gap: 10,
  },

  regTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  regLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  regIcon: { fontSize: 14 },
  regLabel: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  regPct: { fontSize: 13, color: BRAND.textSecondary, fontWeight: '600' },
  progressBg: { height: 6, backgroundColor: '#EDE3D2', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: BRAND.primary, borderRadius: 3 },

  hostedBy: { fontSize: 12, color: BRAND.textSecondary, fontWeight: '600' },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hostAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFF1DE', borderWidth: 2, borderColor: BRAND.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  hostAvatarText: { fontSize: 20, fontWeight: '800', color: BRAND.primary },
  hostName: { flex: 1, fontSize: 15, fontWeight: '800', color: BRAND.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starEmoji: { fontSize: 14 },
  ratingText: { fontSize: 14, fontWeight: '700', color: BRAND.text },

  aboutTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },
  aboutText: { fontSize: 14, color: BRAND.textSecondary, lineHeight: 22 },

  expectRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  expectDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.primary, marginTop: 6, flexShrink: 0 },
  expectText: { flex: 1, fontSize: 14, color: BRAND.text, lineHeight: 20 },

  bottomBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two, paddingBottom: Spacing.two,
    backgroundColor: BRAND.card,
    borderTopWidth: 1, borderTopColor: BRAND.border,
  },
  watchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1A1A1A', borderRadius: 12,
    paddingVertical: 13, paddingHorizontal: 16,
  },
  watchBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  registerBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  registerBtnGradient: { paddingVertical: 13, alignItems: 'center' },
  registerBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  shareBtn: {
    width: 46, height: 46, borderRadius: 12,
    borderWidth: 1.5, borderColor: BRAND.border,
    backgroundColor: BRAND.card,
    alignItems: 'center', justifyContent: 'center',
  },

  pressed: { opacity: 0.85 },
});
