import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  searchBg: 'rgba(255,255,255,0.95)',
};

type DropdownItem = {
  labelKey: TranslationKey;
  icon: { ios: string; android: string; web: string };
  onPress: () => void;
  danger?: boolean;
};

type QuickAction = {
  label: TranslationKey;
  emoji: string;
  bg: string;
  route: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'bookPooja',       emoji: '🪔', bg: '#FFF1DE', route: '/book-pooja' },
  { label: 'panditSearch',    emoji: '🙏', bg: '#FEF3C7', route: '/pandit-search' },
  { label: 'templeSearch',    emoji: '🛕', bg: '#D1FAE5', route: '/temple-search' },
  { label: 'healing',         emoji: '🧘', bg: '#EDE9FE', route: '/healing' },
  { label: 'liveAarti',       emoji: '📅', bg: '#DBEAFE', route: '/(tabs)/events' },
  { label: 'sanskritLearning',emoji: '📦', bg: '#FCE7F3', route: '/sanskrit-learning' },
];

type BannerItem = {
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  colors: [string, string];
  showLive: boolean;
};

const BANNERS: BannerItem[] = [
  { titleKey: 'bannerSunderkandTitle', subtitleKey: 'bannerSunderkandSubtitle', colors: ['#B83227', '#7A1F18'], showLive: true },
  { titleKey: 'bannerAartiTitle',      subtitleKey: 'bannerAartiSubtitle',      colors: ['#D97706', '#92400E'], showLive: true },
  { titleKey: 'bannerPoojaTitle',      subtitleKey: 'bannerPoojaSubtitle',      colors: ['#7C3AED', '#4C1D95'], showLive: false },
  { titleKey: 'bannerPanditTitle',     subtitleKey: 'bannerPanditSubtitle',     colors: ['#0F766E', '#134E4A'], showLive: false },
];

type PanditItem = { name: string; speciality: string; rating: string; exp: string };
const FEATURED_PANDITS: PanditItem[] = [
  { name: 'Pt. Ramesh Sharma', speciality: 'Grihapravesh, Vivah', rating: '4.9', exp: '18 yrs' },
  { name: 'Pt. Suresh Joshi',  speciality: 'Satyanarayan, Katha', rating: '4.8', exp: '12 yrs' },
  { name: 'Pt. Hari Prasad',   speciality: 'Vastu, Havan',        rating: '4.7', exp: '20 yrs' },
];

type TempleItem = { name: string; deity: string; location: string; rating: string };
const POPULAR_TEMPLES: TempleItem[] = [
  { name: 'Siddhivinayak Temple', deity: 'Lord Ganesha', location: 'Mumbai',   rating: '4.9' },
  { name: 'Kashi Vishwanath',     deity: 'Lord Shiva',   location: 'Varanasi', rating: '5.0' },
  { name: 'Tirupati Balaji',      deity: 'Lord Vishnu',  location: 'Tirupati', rating: '5.0' },
];

type HealingExpert = { name: string; speciality: string; rating: string; emoji: string };
const HEALING_EXPERTS: HealingExpert[] = [
  { name: 'Dr. Meera Devi',  speciality: 'Pranic Healing, Reiki',    rating: '4.8', emoji: '🧘‍♀️' },
  { name: 'Swami Ananda',    speciality: 'Ayurveda, Meditation',     rating: '4.9', emoji: '🌿' },
  { name: 'Yogi Ramkrishna', speciality: 'Kundalini, Healing',       rating: '4.7', emoji: '🔮' },
];

type BlogItem = { tag: string; title: string; emoji: string };
const TRENDING_BLOGS: BlogItem[] = [
  { tag: 'Ritual',    title: 'The Significance of Satyanarayan Puja', emoji: '🪔' },
  { tag: 'Astrology', title: 'Vedic Astrology: Your October 2025 Guide', emoji: '⭐' },
  { tag: 'Healing',   title: 'Benefits of Daily Mantra Chanting',     emoji: '🎵' },
];

type EventItem = { titleKey: TranslationKey; date: string; time: string };
const EVENTS: EventItem[] = [
  { titleKey: 'eventSpiritualWebinar', date: 'May 5, 2026',  time: '6:00 PM' },
  { titleKey: 'eventChantingProgram',  date: 'May 7, 2026',  time: '5:30 PM' },
  { titleKey: 'eventKathaSession',     date: 'May 10, 2026', time: '7:00 PM' },
];

export default function HomeScreen() {
  const t = useT();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const menuBtnRef = useRef<View>(null);

  const openMenu = () => {
    if (Platform.OS === 'web') {
      // On web, use a simpler positioning approach
      setDropdownPos({ top: 0, right: 0 }); // Will be positioned via CSS
      setMenuOpen(true);
    } else {
      // On mobile, use measure for precise positioning
      menuBtnRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
        setDropdownPos({ top: pageY + height + 4, right: Dimensions.get('window').width - pageX - width });
        setMenuOpen(true);
      });
    }
  };

  const DROPDOWN_ITEMS: DropdownItem[] = [
    { labelKey: 'registerAsPandit', icon: { ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }, onPress: () => { setMenuOpen(false); router.push('/pandit-register'); } },
    { labelKey: 'registerMandir',   icon: { ios: 'building.columns.fill', android: 'account_balance', web: 'account_balance' }, onPress: () => { setMenuOpen(false); router.push('/mandir-register'); } },
  ];

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <View style={styles.headerTop}>
            {/* Left: logo + welcome text */}
            <View style={styles.brandRow}>
              <View style={styles.brandLogo}>
                <Image
                  source={require('@/assets/images/logo.jpg')}
                  style={styles.brandLogoImg}
                  contentFit="contain"
                />
              </View>
              <View>
                <ThemedText style={styles.welcomeText}>{t('welcomeBack')} 🙏</ThemedText>
                <ThemedText style={styles.brandText}>{t('brand')}</ThemedText>
              </View>
            </View>

            {/* Right: notification + menu */}
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => router.push('/notifications')}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'bell', android: 'notifications_none', web: 'notifications_none' }}
                  tintColor="#FFFFFF"
                  size={20}
                />
              </Pressable>
              <Pressable
                ref={menuBtnRef}
                onPress={openMenu}
                accessibilityLabel="Join"
                style={({ pressed }) => [styles.joinBtn, pressed && styles.pressed]}>
                <ThemedText style={styles.joinBtnText}>{t('join')}</ThemedText>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Search bar (outside gradient, on bg) ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrap}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            tintColor={BRAND.textSecondary}
            size={16}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('searchPlaceholderNew')}
            placeholderTextColor={BRAND.textSecondary}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Banner Slider */}
        <BannerSlider t={t} />

        {/* Quick Actions */}
        <ThemedText style={styles.sectionTitle}>{t('quickActions')}</ThemedText>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map(item => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route as never)}
              style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}>
              <View style={[styles.quickEmojiBg, { backgroundColor: item.bg }]}>
                <ThemedText style={styles.quickEmoji}>{item.emoji}</ThemedText>
              </View>
              <ThemedText style={styles.quickLabel}>{t(item.label)}</ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Live Services */}
        <ThemedText style={styles.sectionTitle}>{t('liveServices')}</ThemedText>
        <View style={{ gap: Spacing.two }}>
          <LiveRow label={t('liveAarti')} badgeText={t('liveNow')} isLive />
          <LiveRow label={t('liveKatha')} badgeText={t('startingSoon')} isLive={false} />
        </View>

        {/* Upcoming Events */}
        <View style={styles.eventsHeaderRow}>
          <ThemedText style={styles.sectionTitle}>{t('upcomingEvents')}</ThemedText>
          <Pressable><ThemedText style={styles.viewAll}>{t('viewAll')}</ThemedText></Pressable>
        </View>
        <View style={{ gap: Spacing.two }}>
          {EVENTS.map(ev => (
            <EventCard key={ev.titleKey} title={t(ev.titleKey)} date={ev.date} time={ev.time} />
          ))}
        </View>

        {/* Featured Pandits */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitleEmoji}>✨ {t('featuredPandits')}</ThemedText>
          <Pressable onPress={() => router.push('/pandit-search')} style={({ pressed }) => [pressed && styles.pressed]}>
            <ThemedText style={styles.seeAll}>{t('seeAll')} ›</ThemedText>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={styles.hScrollContent}>
          {FEATURED_PANDITS.map(p => (
            <Pressable key={p.name} style={({ pressed }) => [styles.panditCard, pressed && styles.pressed]}>
              <View style={styles.panditAvatar}>
                <ThemedText style={styles.panditAvatarText}>{p.name.charAt(3)}</ThemedText>
              </View>
              <ThemedText style={styles.panditName} numberOfLines={2}>{p.name}</ThemedText>
              <ThemedText style={styles.panditSpeciality} numberOfLines={2}>{p.speciality}</ThemedText>
              <ThemedText style={styles.panditRating}>⭐ {p.rating} · {p.exp}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Popular Temples */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitleEmoji}>🛕 {t('popularTemples')}</ThemedText>
          <Pressable onPress={() => router.push('/temple-search')} style={({ pressed }) => [pressed && styles.pressed]}>
            <ThemedText style={styles.seeAll}>{t('seeAll')} ›</ThemedText>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={styles.hScrollContent}>
          {POPULAR_TEMPLES.map(temple => (
            <Pressable key={temple.name} style={({ pressed }) => [styles.templeCard, pressed && styles.pressed]}>
              <View style={styles.templeImgPlaceholder}>
                <ThemedText style={{ fontSize: 36 }}>🛕</ThemedText>
              </View>
              <View style={styles.templeCardBody}>
                <ThemedText style={styles.templeName}>{temple.name}</ThemedText>
                <ThemedText style={styles.templeDeity}>{temple.deity}</ThemedText>
                <View style={styles.templeFooter}>
                  <ThemedText style={styles.templeLocation}>📍 {temple.location}</ThemedText>
                  <ThemedText style={styles.templeRating}>⭐ {temple.rating}</ThemedText>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Healing Experts */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitleEmoji}>🧘 {t('healingExperts')}</ThemedText>
          <Pressable onPress={() => router.push('/healing')} style={({ pressed }) => [pressed && styles.pressed]}>
            <ThemedText style={styles.seeAll}>{t('seeAll')} ›</ThemedText>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={styles.hScrollContent}>
          {HEALING_EXPERTS.map(expert => (
            <Pressable key={expert.name} style={({ pressed }) => [styles.panditCard, pressed && styles.pressed]}>
              <View style={[styles.panditAvatar, { backgroundColor: '#EDE9FE', borderColor: '#7C3AED' }]}>
                <ThemedText style={{ fontSize: 26 }}>{expert.emoji}</ThemedText>
              </View>
              <ThemedText style={styles.panditName} numberOfLines={2}>{expert.name}</ThemedText>
              <ThemedText style={styles.panditSpeciality} numberOfLines={2}>{expert.speciality}</ThemedText>
              <ThemedText style={[styles.panditRating, { color: '#7C3AED' }]}>⭐ {expert.rating}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Trending Blogs */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitleEmoji}>📖 {t('trendingBlogs')}</ThemedText>
          <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
            <ThemedText style={styles.seeAll}>{t('seeAll')} ›</ThemedText>
          </Pressable>
        </View>
        <View style={{ gap: 10 }}>
          {TRENDING_BLOGS.map(blog => (
            <Pressable key={blog.title} style={({ pressed }) => [styles.blogCard, pressed && styles.pressed]}>
              <View style={styles.blogThumb}>
                <ThemedText style={{ fontSize: 32 }}>{blog.emoji}</ThemedText>
              </View>
              <View style={styles.blogBody}>
                <View style={styles.blogTagWrap}>
                  <ThemedText style={styles.blogTag}>{blog.tag}</ThemedText>
                </View>
                <ThemedText style={styles.blogTitle} numberOfLines={2}>{blog.title}</ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* ── Dropdown overlay — rendered last so it sits on top of everything ── */}
      {menuOpen && (
        <Pressable
          style={styles.overlayBackdrop}
          onPress={() => setMenuOpen(false)}
        />
      )}
      {menuOpen && dropdownPos && (
        <View style={[
          styles.dropdownMenu, 
          Platform.OS === 'web' 
            ? styles.dropdownMenuWeb 
            : { top: dropdownPos.top, right: dropdownPos.right }
        ]}>
          {DROPDOWN_ITEMS.map((item, i) => (
            <Pressable
              key={item.labelKey}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.dropdownItem,
                i < DROPDOWN_ITEMS.length - 1 && styles.dropdownItemDivider,
                pressed && styles.pressed,
              ]}>
              <SymbolView name={item.icon} tintColor={item.danger ? '#DC2626' : BRAND.primary} size={16} />
              <ThemedText style={[styles.dropdownItemText, item.danger && styles.dropdownItemDanger]}>
                {t(item.labelKey)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function BannerSlider({ t }: { t: (k: TranslationKey) => string }) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== indexRef.current) { indexRef.current = next; setIndex(next); }
  };

  useEffect(() => {
    if (!width) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const next = (indexRef.current + 1) % BANNERS.length;
      indexRef.current = next;
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, 3000);
    return () => clearInterval(id);
  }, [width]);

  return (
    <View style={styles.bannerWrap} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onScrollBeginDrag={() => { pausedRef.current = true; }}
        onScrollEndDrag={() => { pausedRef.current = false; }}
        scrollEventThrottle={16}
        snapToInterval={width || undefined}
        decelerationRate="fast">
        {BANNERS.map(b => (
          <LinearGradient
            key={b.titleKey}
            colors={b.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bannerCard, { width: width || Dimensions.get('window').width - 32 }]}>
            {b.showLive && (
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <ThemedText style={styles.liveTagText}>{t('bannerLiveTag')}</ThemedText>
              </View>
            )}
            <View style={styles.bannerBottom}>
              <View style={styles.bannerTitleRow}>
                <View style={styles.bannerPulse} />
                <ThemedText style={styles.bannerTitle}>{t(b.titleKey)}</ThemedText>
              </View>
              <ThemedText style={styles.bannerSubtitle}>{t(b.subtitleKey)}</ThemedText>
              <Pressable style={({ pressed }) => [styles.watchBtn, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
                  tintColor="#FFFFFF"
                  size={14}
                />
                <ThemedText style={styles.watchBtnText}>{t('watchNow')}</ThemedText>
              </Pressable>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
      <View style={styles.dotsRow}>
        {BANNERS.map((b, i) => (
          <View key={b.titleKey} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function LiveRow({ label, badgeText, isLive }: { label: string; badgeText: string; isLive: boolean }) {
  return (
    <Pressable style={({ pressed }) => [styles.liveRow, pressed && styles.pressed]}>
      <View style={[styles.liveIconBg, { backgroundColor: isLive ? '#FDE2D0' : '#FFF1DE' }]}>
        <SymbolView
          name={{ ios: isLive ? 'dot.radiowaves.left.and.right' : 'book.closed', android: isLive ? 'podcasts' : 'menu_book', web: isLive ? 'podcasts' : 'menu_book' }}
          tintColor={BRAND.primary}
          size={20}
        />
      </View>
      <ThemedText style={styles.liveLabel}>{label}</ThemedText>
      <View style={[styles.liveBadge, { backgroundColor: isLive ? '#FDE2D0' : '#FFF1DE' }]}>
        <ThemedText style={styles.liveBadgeText}>{badgeText}</ThemedText>
      </View>
    </Pressable>
  );
}

function EventCard({ title, date, time }: { title: string; date: string; time: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.eventCard, pressed && styles.pressed]}>
      <ThemedText style={styles.eventTitle}>{title}</ThemedText>
      <ThemedText style={styles.eventMeta}>{date}  ·  {time}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  header: { paddingBottom: Spacing.three },
  headerInner: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandLogo: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  brandLogoImg: { width: '94%', height: '94%' },
  welcomeText: { fontSize: 12, color: '#FFE7CF' },
  brandText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  joinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  joinBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 999,
    minWidth: 220,
    zIndex: 9999,
  },
  dropdownMenuWeb: {
    top: Platform.OS === 'web' ? 70 : undefined, // Position below header on web
    right: Platform.OS === 'web' ? 16 : undefined, // Align to right edge like mobile
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownItemDivider: { borderBottomWidth: 1, borderBottomColor: BRAND.border },
  dropdownItemText: { fontSize: 14, fontWeight: '600', color: BRAND.text },
  dropdownItemDanger: { color: '#DC2626' },
  overlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
    backgroundColor: 'transparent',
  },

  searchContainer: {
    backgroundColor: BRAND.bg,
    paddingHorizontal: Spacing.four,
    paddingTop: 14,
    paddingBottom: 6,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: BRAND.text,
    height: '100%',
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null),
  },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: BRAND.text },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
  },
  quickEmojiBg: {
    width: 64, height: 64, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  quickEmoji: { fontSize: 28 },
  quickLabel: { fontSize: 12, fontWeight: '600', color: BRAND.text, textAlign: 'center' },

  liveRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: BRAND.card,
    borderWidth: 1, borderColor: BRAND.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 12,
  },
  liveIconBg: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  liveLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: BRAND.text },
  liveBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  liveBadgeText: { color: BRAND.primaryDark, fontSize: 11, fontWeight: '700' },

  eventsHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  viewAll: { color: BRAND.primary, fontSize: 13, fontWeight: '600' },
  eventCard: {
    backgroundColor: BRAND.card,
    borderWidth: 1, borderColor: BRAND.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  eventTitle: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  eventMeta: { fontSize: 12, color: BRAND.textSecondary, marginTop: 4 },

  bannerWrap: { gap: 8 },
  bannerCard: {
    height: 180, borderRadius: 16, padding: 16,
    justifyContent: 'space-between', overflow: 'hidden',
  },
  liveTag: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveTagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  bannerBottom: { gap: 8 },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerPulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6B6B' },
  bannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', flexShrink: 1 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  watchBtn: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginTop: 4,
  },
  watchBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E0CFB0' },
  dotActive: { width: 18, backgroundColor: BRAND.primary },
  pressed: { opacity: 0.85 },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleEmoji: { fontSize: 16, fontWeight: '700', color: BRAND.text },
  seeAll: { fontSize: 13, fontWeight: '600', color: BRAND.primary },

  hScroll: { marginHorizontal: -Spacing.three },
  hScrollContent: { paddingHorizontal: Spacing.three, gap: 12 },

  panditCard: {
    width: 130,
    backgroundColor: BRAND.card,
    borderWidth: 1, borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  panditAvatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FFF1DE',
    borderWidth: 2, borderColor: BRAND.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  panditAvatarText: { fontSize: 24, fontWeight: '800', color: BRAND.primary },
  panditName: { fontSize: 13, fontWeight: '700', color: BRAND.text, textAlign: 'center' },
  panditSpeciality: { fontSize: 11, color: BRAND.textSecondary, textAlign: 'center' },
  panditRating: { fontSize: 11, fontWeight: '600', color: BRAND.primary },

  templeCard: {
    width: 160,
    backgroundColor: BRAND.card,
    borderWidth: 1, borderColor: BRAND.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  templeImgPlaceholder: {
    width: '100%', height: 90,
    backgroundColor: '#E8F4FD',
    alignItems: 'center', justifyContent: 'center',
  },
  templeCardBody: { padding: 10, gap: 4 },
  templeName: { fontSize: 13, fontWeight: '700', color: BRAND.text },
  templeDeity: { fontSize: 11, color: BRAND.textSecondary },
  templeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  templeLocation: { fontSize: 11, color: BRAND.textSecondary },
  templeRating: { fontSize: 11, fontWeight: '700', color: BRAND.primary },

  blogCard: {
    flexDirection: 'row',
    backgroundColor: BRAND.card,
    borderWidth: 1, borderColor: BRAND.border,
    borderRadius: 12, overflow: 'hidden',
  },
  blogThumb: {
    width: 80, height: 80,
    backgroundColor: '#FFF1DE',
    alignItems: 'center', justifyContent: 'center',
  },
  blogBody: { flex: 1, padding: 12, justifyContent: 'center', gap: 6 },
  blogTagWrap: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1DE',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  blogTag: { fontSize: 10, fontWeight: '700', color: BRAND.primary },
  blogTitle: { fontSize: 13, fontWeight: '700', color: BRAND.text },
});
