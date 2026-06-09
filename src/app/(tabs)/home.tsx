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
  TouchableWithoutFeedback,
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
  iconBg: '#FFF1DE',
  liveBg: '#FDE2D0',
  liveText: '#C95A0E',
  soonBg: '#FDE2D0',
  soonText: '#C95A0E',
  searchBg: 'rgba(255,255,255,0.95)',
};

type IconName = { ios: string; android: string; web: string };

const ICON_PANDIT: IconName = { ios: 'person.2.fill', android: 'group', web: 'group' };
const ICON_TEMPLE: IconName = { ios: 'book.closed.fill', android: 'menu_book', web: 'menu_book' };
const ICON_POOJA: IconName = { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' };
const ICON_HEAL: IconName = { ios: 'heart.fill', android: 'favorite', web: 'favorite' };
const ICON_SANSKRIT: IconName = { ios: 'book.fill', android: 'book', web: 'book' };
const ICON_REGISTER: IconName = { ios: 'person.badge.plus', android: 'person_add', web: 'person_add' };

const QUICK_ITEMS: { key: TranslationKey; icon: IconName }[] = [
  { key: 'panditSearch', icon: ICON_PANDIT },
  { key: 'templeSearch', icon: ICON_TEMPLE },
  { key: 'bookPooja', icon: ICON_POOJA },
  { key: 'healing', icon: ICON_HEAL },
  { key: 'sanskritLearning', icon: ICON_SANSKRIT },
];

type BannerItem = {
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  colors: [string, string];
  showLive: boolean;
};

const BANNERS: BannerItem[] = [
  {
    titleKey: 'bannerSunderkandTitle',
    subtitleKey: 'bannerSunderkandSubtitle',
    colors: ['#B83227', '#7A1F18'],
    showLive: true,
  },
  {
    titleKey: 'bannerAartiTitle',
    subtitleKey: 'bannerAartiSubtitle',
    colors: ['#D97706', '#92400E'],
    showLive: true,
  },
  {
    titleKey: 'bannerPoojaTitle',
    subtitleKey: 'bannerPoojaSubtitle',
    colors: ['#7C3AED', '#4C1D95'],
    showLive: false,
  },
  {
    titleKey: 'bannerPanditTitle',
    subtitleKey: 'bannerPanditSubtitle',
    colors: ['#0F766E', '#134E4A'],
    showLive: false,
  },
];

type EventItem = { titleKey: TranslationKey; date: string; time: string };
const EVENTS: EventItem[] = [
  { titleKey: 'eventSpiritualWebinar', date: 'May 5, 2026', time: '6:00 PM' },
  { titleKey: 'eventChantingProgram', date: 'May 7, 2026', time: '5:30 PM' },
  { titleKey: 'eventKathaSession', date: 'May 10, 2026', time: '7:00 PM' },
];

type DropdownItem = {
  labelKey: TranslationKey;
  icon: IconName;
  onPress: () => void;
  danger?: boolean;
};

export default function HomeScreen() {
  const t = useT();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const menuBtnRef = useRef<View>(null);

  const openMenu = () => {
    menuBtnRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      const screenWidth = Dimensions.get('window').width;
      setDropdownPos({
        top: pageY + height + 4,
        right: screenWidth - pageX - width,
      });
      setMenuOpen(true);
    });
  };

  const DROPDOWN_ITEMS: DropdownItem[] = [
    {
      labelKey: 'registerAsPandit',
      icon: ICON_REGISTER,
      onPress: () => { setMenuOpen(false); router.push('/pandit-register'); },
    },
    {
      labelKey: 'registerMandir',
      icon: { ios: 'building.columns.fill', android: 'account_balance', web: 'account_balance' },
      onPress: () => { setMenuOpen(false); router.push('/mandir-register'); },
    },
    {
      labelKey: 'notifications',
      icon: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
      onPress: () => { setMenuOpen(false); router.push('/notifications'); },
    },
    {
      labelKey: 'logout',
      icon: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
      onPress: () => { setMenuOpen(false); router.replace('/'); },
      danger: true,
    },
  ];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <View style={styles.brandRow}>
            <View style={styles.brandLogo}>
              <Image
                source={require('@/assets/images/logo.jpg')}
                style={styles.brandLogoImg}
                contentFit="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.brandText}>{t('brand')}</ThemedText>
              <ThemedText style={styles.brandTagline}>{t('brandTagline')}</ThemedText>
            </View>

            {/* Menu button */}
            <Pressable
              ref={menuBtnRef}
              accessibilityLabel="Menu"
              onPress={openMenu}
              style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}>
              <SymbolView
                name={{ ios: 'ellipsis', android: 'more_vert', web: 'more_vert' }}
                tintColor="#FFFFFF"
                size={22}
              />
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              tintColor={BRAND.textSecondary}
              size={16}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={BRAND.textSecondary}
              style={styles.searchInput}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {menuOpen && dropdownPos && (
        <>
          {/* Full-screen overlay to close on outside tap */}
          <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          {/* Dropdown rendered at root level — no clipping, no overlap */}
          <View style={[styles.dropdownMenu, { top: dropdownPos.top, right: dropdownPos.right }]}>
            {DROPDOWN_ITEMS.map((item, i) => (
              <Pressable
                key={item.labelKey}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.dropdownItem,
                  i < DROPDOWN_ITEMS.length - 1 && styles.dropdownItemDivider,
                  pressed && styles.pressed,
                ]}>
                <SymbolView
                  name={item.icon}
                  tintColor={item.danger ? '#DC2626' : BRAND.primary}
                  size={16}
                />
                <ThemedText style={[styles.dropdownItemText, item.danger && styles.dropdownItemDanger]}>
                  {t(item.labelKey)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <BannerSlider t={t} />

        <View style={styles.roleRow}>
          <RoleCard
            title={t('registerAsPandit')}
            subtitle={t('offerServices')}
            icon={ICON_REGISTER}
            onPress={() => router.push('/pandit-register')}
          />
          <RoleCard
            title={t('mandirRegTitle')}
            subtitle={t('bookServices')}
            icon={ICON_REGISTER}
            onPress={() => router.push('/mandir-register')}
          />
        </View>

        <ThemedText style={styles.sectionTitle}>{t('quickAccess')}</ThemedText>
        <View style={styles.quickGrid}>
          {QUICK_ITEMS.map(item => (
            <QuickCard
              key={item.key}
              label={t(item.key)}
              icon={item.icon}
              onPress={
                item.key === 'panditSearch'
                  ? () => router.push('/pandit-search')
                  : item.key === 'templeSearch'
                    ? () => router.push('/temple-search')
                    : item.key === 'bookPooja'
                    ? () => router.push('/book-pooja')
                    : item.key === 'healing'
                      ? () => router.push('/healing')
                      : item.key === 'sanskritLearning'
                        ? () => router.push('/sanskrit-learning')
                        : undefined
              }
            />
          ))}
        </View>

        <ThemedText style={styles.sectionTitle}>{t('liveServices')}</ThemedText>
        <View style={{ gap: Spacing.two }}>
          <LiveRow
            label={t('liveAarti')}
            icon={{ ios: 'dot.radiowaves.left.and.right', android: 'podcasts', web: 'podcasts' }}
            badgeText={t('liveNow')}
          />
          <LiveRow
            label={t('liveKatha')}
            icon={{ ios: 'book.closed', android: 'menu_book', web: 'menu_book' }}
            badgeText={t('startingSoon')}
          />
        </View>

        <View style={styles.eventsHeaderRow}>
          <ThemedText style={styles.sectionTitle}>{t('upcomingEvents')}</ThemedText>
          <Pressable>
            <ThemedText style={styles.viewAll}>{t('viewAll')}</ThemedText>
          </Pressable>
        </View>
        <View style={{ gap: Spacing.two }}>
          {EVENTS.map(ev => (
            <EventCard
              key={ev.titleKey}
              title={t(ev.titleKey)}
              date={ev.date}
              time={ev.time}
            />
          ))}
        </View>
      </ScrollView>
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
    if (next !== indexRef.current) {
      indexRef.current = next;
      setIndex(next);
    }
  };

  useEffect(() => {
    if (!width) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const next = (indexRef.current + 1) % BANNERS.length;
      indexRef.current = next;
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, y: 0, animated: true });
    }, 3000);
    return () => clearInterval(id);
  }, [width]);

  return (
    <View
      style={styles.bannerWrap}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}>
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
            {b.showLive ? (
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <ThemedText style={styles.liveTagText}>{t('bannerLiveTag')}</ThemedText>
              </View>
            ) : null}
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
          <View
            key={b.titleKey}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

function RoleCard({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: IconName;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.roleCard, pressed && styles.pressed]}>
      <SymbolView name={icon} tintColor={BRAND.primary} size={20} />
      <View style={{ flexShrink: 1 }}>
        <ThemedText style={styles.roleTitle}>{title}</ThemedText>
        <ThemedText style={styles.roleSubtitle}>{subtitle}</ThemedText>
      </View>
    </Pressable>
  );
}

function QuickCard({ label, icon, onPress }: { label: string; icon: IconName; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}>
      <SymbolView name={icon} tintColor={BRAND.primary} size={22} />
      <ThemedText style={styles.quickLabel}>{label}</ThemedText>
    </Pressable>
  );
}

function LiveRow({ label, icon, badgeText }: { label: string; icon: IconName; badgeText: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.liveRow, pressed && styles.pressed]}>
      <View style={styles.liveIcon}>
        <SymbolView name={icon} tintColor={BRAND.primary} size={20} />
      </View>
      <ThemedText style={styles.liveLabel}>{label}</ThemedText>
      <View style={styles.liveBadge}>
        <ThemedText style={styles.liveBadgeText}>{badgeText}</ThemedText>
      </View>
    </Pressable>
  );
}

function EventCard({ title, date, time }: { title: string; date: string; time: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.eventCard, pressed && styles.pressed]}>
      <ThemedText style={styles.eventTitle}>{title}</ThemedText>
      <ThemedText style={styles.eventMeta}>
        {date}    {time}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.four },
  headerInner: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogoImg: { width: '94%', height: '94%' },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    elevation: 12,
    minWidth: 220,
    overflow: 'hidden',
    zIndex: 999,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND.text,
  },
  dropdownItemDanger: {
    color: '#DC2626',
  },
  brandText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  brandTagline: { fontSize: 12, color: '#FFE7CF', marginTop: 2 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.searchBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: BRAND.text,
    height: '100%',
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null),
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  roleRow: { flexDirection: 'row', gap: Spacing.two },
  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  roleTitle: { fontSize: 13, fontWeight: '700', color: BRAND.text },
  roleSubtitle: { fontSize: 11, color: BRAND.primary, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: BRAND.text, marginTop: Spacing.two },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  quickCard: {
    width: '31.5%',
    aspectRatio: 1,
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
  },
  quickLabel: { fontSize: 11, fontWeight: '600', color: BRAND.text, textAlign: 'center' },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  liveIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: BRAND.text },
  liveBadge: {
    backgroundColor: BRAND.liveBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveBadgeText: { color: BRAND.liveText, fontSize: 11, fontWeight: '700' },
  eventsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAll: { color: BRAND.primary, fontSize: 13, fontWeight: '600' },
  eventCard: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eventTitle: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  eventMeta: { fontSize: 12, color: BRAND.textSecondary, marginTop: 4 },
  pressed: { opacity: 0.85 },

  bannerWrap: { gap: 8 },
  bannerCard: {
    height: 180,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  liveTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveTagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  bannerBottom: { gap: 8 },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
  },
  bannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', flexShrink: 1 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  watchBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  watchBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0CFB0',
  },
  dotActive: {
    width: 18,
    backgroundColor: BRAND.primary,
  },
});
