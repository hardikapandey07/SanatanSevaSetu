import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import {
  ApiService,
  TokenManager,
  type Banner,
  type Broadcast,
  type Mandir,
} from "@/constants/api";
import { unregisterForPush } from "@/constants/push";
import { getApiBaseUrl } from "@/constants/environment";
import { LANGUAGES } from "@/constants/languages";
import { Spacing } from "@/constants/theme";
import { useLanguage, useTranslatedBatch, useTranslatedList } from "@/i18n/LanguageContext";
import { ImageSlider } from "@/components/image-slider";
import { useUnreadNotificationsCount } from "@/hooks/use-unread-notifications";
import type { LangCode } from "@/i18n/translations";

const BRAND = {
  primary: "#E8731C",
  primaryDark: "#C95A0E",
  bg: "#F7F4EE",
  card: "#FFFFFF",
  border: "#EFE7D7",
  text: "#1F1A14",
  textSecondary: "#6B6258",
  searchBg: "rgba(255,255,255,0.95)",
};

const BANNERS = [
  {
    titleKey: "bannerSunderkandTitle",
    subtitleKey: "bannerSunderkandSubtitle",
    colors: ["#B83227", "#7A1F18"],
    showLive: true,
  },
  {
    titleKey: "bannerAartiTitle",
    subtitleKey: "bannerAartiSubtitle",
    colors: ["#D97706", "#92400E"],
    showLive: true,
  },
  {
    titleKey: "bannerPoojaTitle",
    subtitleKey: "bannerPoojaSubtitle",
    colors: ["#7C3AED", "#4C1D95"],
    showLive: false,
  },
  {
    titleKey: "bannerPanditTitle",
    subtitleKey: "bannerPanditSubtitle",
    colors: ["#0F766E", "#134E4A"],
    showLive: false,
  },
];

type PanditItem = {
  name: string;
  speciality: string;
  rating: string;
  exp: string;
};
const FEATURED_PANDITS: PanditItem[] = [
  {
    name: "Pt. Ramesh Sharma",
    speciality: "Grihapravesh, Vivah",
    rating: "4.9",
    exp: "18 yrs",
  },
  {
    name: "Pt. Suresh Joshi",
    speciality: "Satyanarayan, Katha",
    rating: "4.8",
    exp: "12 yrs",
  },
  {
    name: "Pt. Hari Prasad",
    speciality: "Vastu, Havan",
    rating: "4.7",
    exp: "20 yrs",
  },
];

type TempleItem = {
  name: string;
  deity: string;
  location: string;
  rating: string;
};
const POPULAR_TEMPLES: TempleItem[] = [
  {
    name: "Siddhivinayak Temple",
    deity: "Lord Ganesha",
    location: "Mumbai",
    rating: "4.9",
  },
  {
    name: "Kashi Vishwanath",
    deity: "Lord Shiva",
    location: "Varanasi",
    rating: "5.0",
  },
  {
    name: "Tirupati Balaji",
    deity: "Lord Vishnu",
    location: "Tirupati",
    rating: "5.0",
  },
];

type HealingExpert = {
  name: string;
  speciality: string;
  rating: string;
  emoji: string;
};
const HEALING_EXPERTS: HealingExpert[] = [
  {
    name: "Dr. Meera Devi",
    speciality: "Pranic Healing, Reiki",
    rating: "4.8",
    emoji: "🧘‍♀️",
  },
  {
    name: "Swami Ananda",
    speciality: "Ayurveda, Meditation",
    rating: "4.9",
    emoji: "🌿",
  },
  {
    name: "Yogi Ramkrishna",
    speciality: "Kundalini, Healing",
    rating: "4.7",
    emoji: "🔮",
  },
];

type BlogItem = { tag: string; title: string; emoji: string };
const TRENDING_BLOGS: BlogItem[] = [
  {
    tag: "Ritual",
    title: "The Significance of Satyanarayan Puja",
    emoji: "🪔",
  },
  {
    tag: "Astrology",
    title: "Vedic Astrology: Your October 2025 Guide",
    emoji: "⭐",
  },
  { tag: "Healing", title: "Benefits of Daily Mantra Chanting", emoji: "🎵" },
];

const LIVE_BG_COLORS = ["#7A1F18", "#1E3A5F", "#134E4A", "#4A1D96", "#92400E"];
const LIVE_EMOJIS = ["🪔", "📖", "🔥", "🙏", "🎵"];
const UPCOMING_BG_COLORS = [
  "#C8E6C9",
  "#B0BEC5",
  "#FFCCBC",
  "#E1BEE7",
  "#B3E5FC",
];
const UPCOMING_EMOJIS = ["🌸", "🏔️", "🪔", "🙏", "⭐"];

const SIDE_MENU_ITEMS = [
  {
    icon: {
      ios: "building.columns.fill",
      android: "account_balance",
      web: "account_balance",
    },
    labelKey: "mandirSearch",
    route: "/temple-search",
  },
  {
    icon: { ios: "list.bullet.rectangle", android: "receipt_long", web: "receipt_long" },
    labelKey: "myBookingsMenu",
    route: "/my-bookings",
  },
] as const;

export default function HomeScreen() {
  const { t, lang, setLang } = useLanguage();
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const slideAnim = useState(() => new Animated.Value(-280))[0];
  const [banners, setBanners] = useState<Banner[]>([]);
  const [liveItems, setLiveItems] = useState<Broadcast[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<Broadcast[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [mandirs, setMandirs] = useState<Mandir[]>([]);
  const [mandirLoading, setMandirLoading] = useState(true);
  const unreadCount = useUnreadNotificationsCount();
  const translatedBanners = useTranslatedList(banners, ["title", "description"]);

  useEffect(() => {
    setLiveLoading(true);
    setUpcomingLoading(true);
    setMandirLoading(true);
    ApiService.getActiveBanners().then((data) => setBanners(data));
    ApiService.getLiveBroadcasts().then((data) => {
      setLiveItems(data);
      setLiveLoading(false);
    });
    ApiService.getUpcomingBroadcasts().then((data) => {
      setUpcomingItems(data);
      setUpcomingLoading(false);
    });
    ApiService.getMandirs().then((data) => {
      setMandirs(data);
      setMandirLoading(false);
    });
  }, [lang]);

  const openSideMenu = () => {
    setSideMenuOpen(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };
  const closeSideMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -280,
      useNativeDriver: true,
      duration: 220,
    }).start(() => setSideMenuOpen(false));
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <View style={styles.headerTop}>
            {/* Left: 3-dot menu + logo + welcome text */}
            <View style={styles.brandRow}>
              <Pressable
                onPress={openSideMenu}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView
                  name={{
                    ios: "ellipsis",
                    android: "more_vert",
                    web: "more_vert",
                  }}
                  tintColor="#FFFFFF"
                  size={20}
                />
              </Pressable>
              <View style={styles.brandLogo}>
                <Image
                  source={require("@/assets/images/logo.jpg")}
                  style={styles.brandLogoImg}
                  contentFit="contain"
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <ThemedText style={styles.welcomeText} numberOfLines={1}>
                  {t("welcomeBack")} 🙏
                </ThemedText>
                <ThemedText style={styles.brandText} numberOfLines={1}>
                  {t("brand")}
                </ThemedText>
              </View>
            </View>

            {/* Right: language + notification */}
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => setLangPickerOpen(true)}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText style={styles.langIconText}>
                  {lang.toUpperCase()}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => router.push("/notifications")}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView
                  name={{
                    ios: "bell",
                    android: "notifications_none",
                    web: "notifications_none",
                  }}
                  tintColor="#FFFFFF"
                  size={20}
                />
                {unreadCount > 0 && (
                  <View style={styles.notifBadge}>
                    <ThemedText style={styles.notifBadgeText}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </ThemedText>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
          {/* Search Bar — temporarily commented out
          <Pressable
            onPress={() => router.push("/pandit-search")}
            style={styles.searchBar}
          >
            <SymbolView
              name={{
                ios: "magnifyingglass",
                android: "search",
                web: "search",
              }}
              tintColor={BRAND.textSecondary}
              size={16}
            />
            <ThemedText style={styles.searchBarText}>
              {t("searchPlaceholderNew")}
            </ThemedText>
          </Pressable>
          */}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Slider */}
        <ImageSlider
          slides={translatedBanners.map(b => ({
            id: b.id,
            uri: `${getApiBaseUrl()}/${Platform.OS === 'web' ? b.desktop_image : b.mobile_image}`,
            title: b.title,
            description: b.description,
            buttonText: b.buttons?.[0]?.button_text || 'Book Now',
          }))}
          onPress={b => {
            if (b.id) {
              const banner = translatedBanners.find(tb => tb.id === b.id);
              if (banner?.banner_for === 'PUJA BOOKING' && banner?.reference_id) {
                router.push({ pathname: '/group-puja-detail', params: { id: banner.reference_id } });
              } else {
                router.push({ pathname: '/banner-detail', params: { id: b.id } });
              }
            }
          }}
        />

        {/* Book Puja */}
        <ThemedText style={styles.sectionTitle}>{t('bookPuja')}</ThemedText>
        <View style={{ gap: 8 }}>
          {/* Row 1: 2 cards */}
          <View style={styles.pujaCategRow}>
            {([{ label: t('groupPuja'), sub: t('joinTemplePujas'), img: require("@/assets/images/GroupPuja_bg.jpeg"), type: 'group' }, { label: t('individualPuja'), sub: t('personalizedSankalp'), img: require("@/assets/images/indivisualPuaj_bg.jpeg"), type: 'individual' }] as const).map((cat) => (
              <Pressable
                key={cat.label}
                onPress={() => router.push({ pathname: "/group-puja-list", params: { type: cat.type } })}
                style={({ pressed }) => [styles.pujaCategCard, pressed && styles.pressed]}
              >
                <Image
                  source={cat.img}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.65)"]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.pujaCategBottom}>
                  <ThemedText style={styles.pujaCategTitle}>{cat.label}</ThemedText>
                  <ThemedText style={styles.pujaCategSub}>{cat.sub}</ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
          {/* Row 2: Lokpriya full-width */}
          <Pressable
            onPress={() => router.push({ pathname: "/group-puja-list", params: { type: 'lokpriya' } })}
            style={({ pressed }) => [styles.pujaCategCardWide, pressed && styles.pressed]}
          >
            <Image
              source={require("@/assets/images/quick.jpeg")}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(201,90,14,0.75)", "rgba(180,70,0,0.92)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.lokpriyaBadge}>
              <ThemedText style={styles.lokpriyaBadgeText}>{t('mostBooked')}</ThemedText>
            </View>
            <View style={styles.lokpriyaBottom}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.lokpriyaTitle}>{t('lokpriyaPuja')}</ThemedText>
                <ThemedText style={styles.lokpriyaSub}>{t('mostBookedPremium')}</ThemedText>
              </View>
              <View style={styles.lokpriyaBookBtn}>
                <ThemedText style={styles.lokpriyaBookBtnText}>{t('bookNowBtn')}</ThemedText>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Live Services — only shown while an event is ongoing */}
        {(liveLoading || liveItems.length > 0) && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.liveSectionTitleRow}>
                <View style={styles.liveDotIndicator} />
                <ThemedText style={styles.sectionTitle}>
                  {t("liveServices")}
                </ThemedText>
              </View>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/broadcasts-list",
                    params: { type: "live" },
                  })
                }
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <ThemedText style={styles.seeAll}>See all ›</ThemedText>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.hScroll}
              contentContainerStyle={styles.hScrollContent}
            >
              {liveLoading ? (
                [1, 2, 3].map((i) => <BroadcastSkeleton key={i} />)
              ) : (
                liveItems.map((item, i) => (
                  <LiveServiceCard
                    key={item.id}
                    item={item}
                    bg={LIVE_BG_COLORS[i % LIVE_BG_COLORS.length]}
                    emoji={LIVE_EMOJIS[i % LIVE_EMOJIS.length]}
                  />
                ))
              )}
            </ScrollView>
          </>
        )}

        {/* Upcoming Events */}
        <View style={styles.eventsHeaderRow}>
          <ThemedText style={styles.sectionTitle}>
            {t("upcomingEvents")}
          </ThemedText>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/broadcasts-list",
                params: { type: "upcoming" },
              })
            }
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <ThemedText style={styles.viewAll}>{t("viewAll")} ›</ThemedText>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hScroll}
          contentContainerStyle={styles.hScrollContent}
        >
          {upcomingLoading ? (
            [1, 2, 3].map((i) => <BroadcastSkeleton key={i} />)
          ) : upcomingItems.length > 0 ? (
            upcomingItems.map((item, i) => (
              <UpcomingEventCard
                key={item.id}
                item={item}
                bg={UPCOMING_BG_COLORS[i % UPCOMING_BG_COLORS.length]}
                emoji={UPCOMING_EMOJIS[i % UPCOMING_EMOJIS.length]}
              />
            ))
          ) : (
            <NoDataFound label={t('noUpcomingEvents')} emoji="📅" />
          )}
        </ScrollView>

        {/* Featured Pandits — temporarily commented out
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
        */}

        {/* Popular Temples */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitleEmoji}>
            🛕 {t("popularTemples")}
          </ThemedText>
          <Pressable
            onPress={() => router.push("/temple-search")}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <ThemedText style={styles.seeAll}>{t("seeAll")} ›</ThemedText>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hScroll}
          contentContainerStyle={styles.hScrollContent}
        >
          {mandirLoading ? (
            [1, 2, 3].map((i) => <BroadcastSkeleton key={i} />)
          ) : mandirs.length > 0 ? (
            mandirs.slice(0, 10).map((mandir) => (
              <MandirCard key={mandir.id} mandir={mandir} />
            ))
          ) : (
            <NoDataFound label={t('noTemplesFound')} emoji="🛕" />
          )}
        </ScrollView>

        {/* Healing Experts — temporarily commented out
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
        */}

        {/* Trending Blogs — temporarily commented out
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
        */}
      </ScrollView>

      {/* ── Side Menu Modal ── */}
      <Modal
        visible={sideMenuOpen}
        transparent
        animationType="none"
        onRequestClose={closeSideMenu}
        statusBarTranslucent
      >
        <View style={{ flex: 1 }}>
          <Pressable style={styles.sideMenuBackdrop} onPress={closeSideMenu} />
          <Animated.View
            style={[
              styles.sideMenu,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* Header */}
            <LinearGradient
              colors={[BRAND.primary, BRAND.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sideMenuHeader}
            >
              <View style={styles.sideMenuLogo}>
                <Image
                  source={require("@/assets/images/logo.jpg")}
                  style={{ width: "94%", height: "94%" }}
                  contentFit="contain"
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.sideMenuBrand}>
                  Sanatan Seva Setu
                </ThemedText>
                <ThemedText style={styles.sideMenuTagline}>
                  Bridging Devotion
                </ThemedText>
              </View>
              <Pressable
                onPress={closeSideMenu}
                style={({ pressed }) => [
                  styles.sideMenuClose,
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView
                  name={{ ios: "xmark", android: "close", web: "close" }}
                  tintColor="#FFFFFF"
                  size={18}
                />
              </Pressable>
            </LinearGradient>

            {/* Items */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {SIDE_MENU_ITEMS.map((item, i) => (
                <Pressable
                  key={item.label}
                  onPress={() => {
                    closeSideMenu();
                    setTimeout(() => router.push(item.route as never), 250);
                  }}
                  style={({ pressed }) => [
                    styles.sideMenuItem,
                    i > 0 && styles.sideMenuItemDivider,
                    pressed && styles.sideMenuItemPressed,
                  ]}
                >
                  <View style={styles.sideMenuIconBg}>
                    <SymbolView
                      name={item.icon}
                      tintColor={BRAND.primary}
                      size={18}
                    />
                  </View>
                  <ThemedText style={styles.sideMenuItemLabel}>
                    {t(item.labelKey as any)}
                  </ThemedText>
                  <SymbolView
                    name={{
                      ios: "chevron.right",
                      android: "chevron_right",
                      web: "chevron_right",
                    }}
                    tintColor={BRAND.textSecondary}
                    size={14}
                  />
                </Pressable>
              ))}
              <Pressable
                onPress={async () => {
                  closeSideMenu();
                  await unregisterForPush();
                  await TokenManager.clearToken();
                  router.replace("/");
                }}
                style={({ pressed }) => [
                  styles.sideMenuItem,
                  styles.sideMenuItemDivider,
                  pressed && styles.sideMenuItemPressed,
                ]}
              >
                <View style={[styles.sideMenuIconBg, { backgroundColor: "#FEE2E2" }]}>
                  <SymbolView
                    name={{
                      ios: "rectangle.portrait.and.arrow.right",
                      android: "logout",
                      web: "logout",
                    }}
                    tintColor="#DC2626"
                    size={18}
                  />
                </View>
                <ThemedText style={[styles.sideMenuItemLabel, { color: "#DC2626" }]}>
                  {t('logout')}
                </ThemedText>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* ── Language Picker Modal ── */}
      <Modal
        visible={langPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLangPickerOpen(false)}
      >
        <Pressable
          style={styles.langModalBackdrop}
          onPress={() => setLangPickerOpen(false)}
        >
          <View style={styles.langModalBox}>
            <ThemedText style={styles.langModalTitle}>
              {t("chooseLanguage")}
            </ThemedText>
            {LANGUAGES.map((l, i) => (
              <Pressable
                key={l.code}
                onPress={() => {
                  setLang(l.code as LangCode);
                  setLangPickerOpen(false);
                }}
                style={({ pressed }) => [
                  styles.langModalRow,
                  i < LANGUAGES.length - 1 && styles.langModalRowDivider,
                  lang === l.code && styles.langModalRowSelected,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText
                  style={[
                    styles.langModalNative,
                    lang === l.code && styles.langModalNativeSelected,
                  ]}
                >
                  {l.nativeName}
                </ThemedText>
                <ThemedText style={styles.langModalEnglish}>
                  {l.englishName}
                </ThemedText>
                {lang === l.code && (
                  <SymbolView
                    name={{ ios: "checkmark", android: "check", web: "check" }}
                    tintColor={BRAND.primary}
                    size={16}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}

function LiveServiceCard({
  item, bg, emoji,
}: { item: Broadcast; bg: string; emoji: string }) {
  const [title, subTitle] = useTranslatedBatch([item.title, item.sub_title]);
  const timeStr = (() => {
    try {
      return new Date(item.schedule_start_time).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  })();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/webinar-watch",
          params: {
            id: item.id,
            title: item.title,
            sub_title: item.sub_title,
            is_paid: String(item.is_paid_event),
          },
        })
      }
      style={({ pressed }) => [
        styles.liveServiceCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.liveServiceImg, { backgroundColor: bg }]}>
        {item.image_url ? (
          <Image
            source={{ uri: `${getApiBaseUrl()}/${item.image_url}` }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <ThemedText style={styles.liveServiceEmoji}>{emoji}</ThemedText>
        )}
        <View style={styles.liveServiceBadgeRow}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.livePillText}>LIVE</ThemedText>
          </View>
        </View>
        {item.is_paid_event && item.event_price != null && (
          <View style={styles.viewersBadge}>
            <ThemedText style={styles.viewersText}>
              ₹{item.event_price}
            </ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={styles.liveServiceTitle} numberOfLines={2}>
        {title}
      </ThemedText>
      <ThemedText style={styles.liveServiceLocation} numberOfLines={1}>
        {subTitle}
      </ThemedText>
      {!!timeStr && (
        <ThemedText style={styles.liveServiceTime}>{timeStr}</ThemedText>
      )}
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/webinar-watch",
            params: {
              id: item.id,
              title: item.title,
              sub_title: item.sub_title,
              is_paid: String(item.is_paid_event),
            },
          })
        }
        style={({ pressed }) => [styles.watchBtn, pressed && styles.pressed]}
      >
        <ThemedText style={styles.watchBtnText}>{t('watchBtn')}</ThemedText>
      </Pressable>
    </Pressable>
  );
}

function UpcomingEventCard({
  item, bg, emoji,
}: { item: Broadcast; bg: string; emoji: string }) {
  const [title] = useTranslatedBatch([item.title]);
  const dateStr = (() => {
    try {
      return new Date(item.schedule_start_time).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  })();

  return (
    <Pressable
      style={({ pressed }) => [styles.upcomingCard, pressed && styles.pressed]}
    >
      <View style={[styles.upcomingImg, { backgroundColor: bg }]}>
        {item.image_url ? (
          <Image
            source={{ uri: `${getApiBaseUrl()}/${item.image_url}` }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <ThemedText style={{ fontSize: 40 }}>{emoji}</ThemedText>
        )}
        <View
          style={[
            styles.upcomingBadge,
            { backgroundColor: item.is_paid_event ? "#E8731C" : "#4CAF50" },
          ]}
        >
          <ThemedText style={styles.upcomingBadgeText}>
            {item.is_paid_event && item.event_price != null
              ? `₹${item.event_price}`
              : "Free"}
          </ThemedText>
        </View>
      </View>
      <View style={styles.upcomingBody}>
        <ThemedText style={styles.upcomingTitle} numberOfLines={2}>
          {title}
        </ThemedText>
        {!!dateStr && (
          <ThemedText style={styles.upcomingDate}>📅 {dateStr}</ThemedText>
        )}
      </View>
    </Pressable>
  );
}

function MandirCard({ mandir }: { mandir: Mandir }) {
  const [mandirName, chadhava, address] = useTranslatedBatch([
    mandir.mandir_name,
    mandir.chadhava_details,
    mandir.address,
  ]);
  return (
    <Pressable
      onPress={() => router.push("/temple-search")}
      style={({ pressed }) => [styles.templeCard, pressed && styles.pressed]}
    >
      <View style={styles.templeImgPlaceholder}>
        {mandir.mandir_image_url ? (
          <Image
            source={{ uri: `${getApiBaseUrl()}/${mandir.mandir_image_url}` }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <ThemedText style={{ fontSize: 36 }}>🛕</ThemedText>
        )}
        {mandir.is_verify && (
          <View style={styles.templeVerifiedBadge}>
            <ThemedText style={styles.templeVerifiedText}>✓</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.templeCardBody}>
        <ThemedText style={styles.templeName} numberOfLines={2}>{mandirName}</ThemedText>
        {!!chadhava && (
          <ThemedText style={styles.templeDeity} numberOfLines={1}>{chadhava}</ThemedText>
        )}
        <View style={styles.templeFooter}>
          <ThemedText style={styles.templeLocation} numberOfLines={1}>📍 {address}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

function NoDataFound({ label, emoji }: { label: string; emoji: string }) {
  return (
    <View style={styles.noDataWrap}>
      <ThemedText style={styles.noDataEmoji}>{emoji}</ThemedText>
      <ThemedText style={styles.noDataText}>{label}</ThemedText>
    </View>
  );
}

function BroadcastSkeleton() {
  return (
    <View style={[styles.liveServiceCard, { opacity: 0.35 }]}>
      <View style={[styles.liveServiceImg, { backgroundColor: "#E0D6C2" }]} />
      <View style={{ padding: 10, gap: 6 }}>
        <View
          style={{
            height: 12,
            backgroundColor: "#E0D6C2",
            borderRadius: 6,
            width: "80%",
          }}
        />
        <View
          style={{
            height: 10,
            backgroundColor: "#E0D6C2",
            borderRadius: 6,
            width: "55%",
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  header: { paddingBottom: Spacing.three },
  headerInner: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  brandLogoImg: { width: "94%", height: "94%" },
  welcomeText: { fontSize: 12, color: "#FFE7CF" },
  brandText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  langIconText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  notifBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 3,
    backgroundColor: "#DC2626",
    borderWidth: 1.5,
    borderColor: "#C95A0E",
    alignItems: "center",
    justifyContent: "center",
  },
  notifBadgeText: { fontSize: 9, fontWeight: "800", color: "#FFFFFF" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 42,
    marginTop: Spacing.two,
  },
  searchBarText: { fontSize: 13, color: BRAND.textSecondary, flex: 1 },

  langModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  langModalBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "100%",
    maxWidth: 320,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
  },
  langModalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BRAND.text,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  langModalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  langModalRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  langModalRowSelected: { backgroundColor: "#FFF8F0" },
  langModalNative: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND.text,
    flex: 1,
  },
  langModalNativeSelected: { color: BRAND.primary },
  langModalEnglish: { fontSize: 12, color: BRAND.textSecondary },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: BRAND.text },

  pujaCategRow: { flexDirection: "row", gap: 8 },
  pujaCategCard: {
    flex: 1,
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  pujaCategCardWide: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  pujaCategBottom: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 2,
  },
  pujaCategTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  pujaCategSub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  lokpriyaBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  lokpriyaBadgeText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  lokpriyaBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 8,
  },
  lokpriyaTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  lokpriyaSub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    marginTop: 2,
  },
  lokpriyaBookBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  lokpriyaBookBtnText: { fontSize: 12, fontWeight: "800", color: BRAND.primaryDark },
  eventsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewAll: { color: BRAND.primary, fontSize: 13, fontWeight: "600" },

  liveSectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC2626",
  },

  noDataWrap: {
    width: 200,
    height: 140,
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noDataEmoji: { fontSize: 32 },
  noDataText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND.textSecondary,
    textAlign: "center",
    paddingHorizontal: 12,
  },

  liveServiceCard: {
    width: 160,
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    overflow: "hidden",
  },
  liveServiceImg: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  liveServiceEmoji: { fontSize: 36, opacity: 0.6 },
  liveServiceBadgeRow: { position: "absolute", top: 8, left: 8 },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#FFFFFF" },
  livePillText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  startingSoonPill: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  startingSoonText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  viewersBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  viewersText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  liveServiceTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND.text,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  liveServiceLocation: {
    fontSize: 11,
    color: BRAND.textSecondary,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  liveServiceTime: {
    fontSize: 10,
    color: BRAND.primary,
    paddingHorizontal: 10,
    marginTop: 1,
    fontWeight: "600",
  },
  watchBtn: {
    margin: 10,
    backgroundColor: BRAND.primary,
    borderRadius: 999,
    paddingVertical: 7,
    alignItems: "center",
  },
  watchBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  upcomingCard: {
    width: 200,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  upcomingImg: {
    width: 200,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#F5EFE6",
  },
  upcomingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  upcomingBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  upcomingBody: { padding: 10, gap: 4 },
  upcomingTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND.text,
    lineHeight: 16,
  },
  upcomingDate: { fontSize: 11, color: BRAND.textSecondary },

  bannerWrap: { gap: 8 },
  bannerCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E0D6C2",
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 32,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 19,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
    fontWeight: '500',
  },
  bannerArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  bannerArrowLeft: { left: 10 },
  bannerArrowRight: { right: 10 },
  bannerArrowText: { color: "#FFFFFF", fontSize: 22, fontWeight: "700", lineHeight: 26 },
  bannerBookBtn: {
    backgroundColor: BRAND.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    flexShrink: 0,
  },
  bannerBookBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E0CFB0" },
  dotActive: { width: 18, backgroundColor: BRAND.primary },
  pressed: { opacity: 0.85 },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleEmoji: { fontSize: 16, fontWeight: "700", color: BRAND.text },
  seeAll: { fontSize: 13, fontWeight: "600", color: BRAND.primary },

  hScroll: { marginHorizontal: -Spacing.three },
  hScrollContent: { paddingHorizontal: Spacing.three, gap: 12 },

  panditCard: {
    width: 130,
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  panditAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF1DE",
    borderWidth: 2,
    borderColor: BRAND.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  panditAvatarText: { fontSize: 24, fontWeight: "800", color: BRAND.primary },
  panditName: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND.text,
    textAlign: "center",
  },
  panditSpeciality: {
    fontSize: 11,
    color: BRAND.textSecondary,
    textAlign: "center",
  },
  panditRating: { fontSize: 11, fontWeight: "600", color: BRAND.primary },

  templeVerifiedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#D1FAE5",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  templeVerifiedText: { fontSize: 10, fontWeight: "800", color: "#15803D" },
  templeCard: {
    width: 160,
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    overflow: "hidden",
  },
  templeImgPlaceholder: {
    width: "100%",
    height: 90,
    backgroundColor: "#E8F4FD",
    alignItems: "center",
    justifyContent: "center",
  },
  templeCardBody: { padding: 10, gap: 4 },
  templeName: { fontSize: 13, fontWeight: "700", color: BRAND.text },
  templeDeity: { fontSize: 11, color: BRAND.textSecondary },
  templeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  templeLocation: { fontSize: 11, color: BRAND.textSecondary },
  templeRating: { fontSize: 11, fontWeight: "700", color: BRAND.primary },

  blogCard: {
    flexDirection: "row",
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  blogThumb: {
    width: 80,
    height: 80,
    backgroundColor: "#FFF1DE",
    alignItems: "center",
    justifyContent: "center",
  },
  blogBody: { flex: 1, padding: 12, justifyContent: "center", gap: 6 },
  blogTagWrap: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF1DE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  blogTag: { fontSize: 10, fontWeight: "700", color: BRAND.primary },
  blogTitle: { fontSize: 13, fontWeight: "700", color: BRAND.text },

  sideMenuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sideMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 0 },
    shadowRadius: 16,
    elevation: 20,
  },
  sideMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 18,
  },
  sideMenuLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  sideMenuBrand: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
  sideMenuTagline: { fontSize: 11, color: "#FFE7CF", marginTop: 1 },
  sideMenuClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sideMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  sideMenuItemDivider: { borderTopWidth: 1, borderTopColor: BRAND.border },
  sideMenuItemPressed: { backgroundColor: "#FFF8F0" },
  sideMenuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFF1DE",
    alignItems: "center",
    justifyContent: "center",
  },
  sideMenuItemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: BRAND.text,
  },
});
