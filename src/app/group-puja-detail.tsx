import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RazorpayWebView } from '@/components/razorpay-webview';
import { ThemedText } from '@/components/themed-text';
import { ApiService, TokenManager, type FAQ, type InitiatePujaBookingResponse, type PujaDetail, type PujaPackageInfo, type PujaProcess } from '@/constants/api';
import { ENV_CONFIG, getApiBaseUrl } from '@/constants/environment';
import { Spacing } from '@/constants/theme';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  green: '#22C55E',
  greenDark: '#16A34A',
  bg: '#FFFFFF',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  pink: '#E91E8C',
  bgLight: '#FFF8F0',
};

const TABS = ['About Puja', 'Benefits', 'Temple Details', 'Packages', 'Process', 'FAQs'];
const DUMMY_DEVOTEE_EMOJIS = ['👨', '👩', '🧔', '👱', '👴', '👵', '🧑', '👦', '👧', '🧕'];

/** Strip HTML tags for plain-text display */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function resolveUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${getApiBaseUrl()}/${url}`;
}

export default function GroupPujaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log('[GroupPujaDetail] received id:', id);
  const [puja, setPuja] = useState<PujaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [processes, setProcesses] = useState<PujaProcess[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [pkgModalVisible, setPkgModalVisible] = useState(false);
  const [pkgInfoItems, setPkgInfoItems] = useState<PujaPackageInfo[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [initiating, setInitiating] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<InitiatePujaBookingResponse | null>(null);
  const [razorpayVisible, setRazorpayVisible] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [devoteeName, setDevoteeName] = useState('');
  const [devoteeMobile, setDevoteeMobile] = useState('');
  const [sliderIndex, setSliderIndex] = useState(0);
  const sliderRef = useRef<ScrollView>(null);
  const sliderIndexRef = useRef(0);
  const [sliderWidth, setSliderWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ApiService.getPujaDetail(id).then(res => {
      if (res.success && res.data) setPuja(res.data);
      setLoading(false);
    });
    ApiService.getPujaProcesses().then(setProcesses);
    ApiService.getFaqs().then(setFaqs);
    ApiService.getPujaPackageInfo().then(setPkgInfoItems);
  }, [id]);

  // Auto-slide image sliders
  useEffect(() => {
    if (!puja?.image_sliders?.length || puja.image_sliders.length < 2) return;
    const count = puja.image_sliders.length;
    const id = setInterval(() => {
      const next = (sliderIndexRef.current + 1) % count;
      sliderIndexRef.current = next;
      setSliderIndex(next);
      sliderRef.current?.scrollTo({ x: next * sliderWidth, animated: true });
    }, 3000);
    return () => clearInterval(id);
  }, [puja?.image_sliders?.length, sliderWidth]);

  const onSliderScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / sliderWidth);
    if (next !== sliderIndexRef.current) {
      sliderIndexRef.current = next;
      setSliderIndex(next);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND.bg }}>
        <ActivityIndicator size="large" color={BRAND.primary} />
      </View>
    );
  }

  if (!puja) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText>Puja not found</ThemedText>
      </View>
    );
  }

  const formattedDate = (() => {
    try { return new Date(puja.puja_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return puja.puja_date; }
  })();

  const mainImage = (Platform.OS === 'web' ? puja.desktop_image : puja.mobile_image) || puja.mobile_image || puja.desktop_image;
  const sliders = puja.image_sliders ?? [];

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={BRAND.text} size={20} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.headerLogoWrap}>
              <ThemedText style={{ fontSize: 20 }}>🛕</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.headerTitle}>Sanatan Seva Setu</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Puja Seva</ThemedText>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Image Slider */}
        {sliders.length > 0 ? (
          <View
            style={styles.sliderWrap}
            onLayout={e => setSliderWidth(e.nativeEvent.layout.width)}
          >
            <ScrollView
              ref={sliderRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onSliderScroll}
              scrollEventThrottle={16}
              snapToInterval={sliderWidth}
              decelerationRate="fast"
            >
              {sliders.map(s => {
                const sliderImg = Platform.OS === 'web'
                  ? (s.desktop_image || s.mobile_image)
                  : (s.mobile_image || s.desktop_image);
                return (
                  <Image
                    key={s.id}
                    source={{ uri: resolveUrl(sliderImg) }}
                    style={[styles.sliderImg, { width: sliderWidth }]}
                    contentFit="cover"
                  />
                );
              })}
            </ScrollView>
            {sliders.length > 1 && (
              <View style={styles.dotsRow}>
                {sliders.map((s, i) => (
                  <View key={s.id} style={[styles.dot, i === sliderIndex && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        ) : mainImage ? (
          <Image source={{ uri: resolveUrl(mainImage) }} style={styles.mainImg} contentFit="cover" />
        ) : null}

        {/* Puja type pills */}
        {puja.puja_types?.length > 0 && (
          <View style={styles.typePillsRow}>
            {puja.puja_types.map(tp => (
              <View key={tp} style={styles.typePill}>
                <ThemedText style={styles.typePillText}>{tp}</ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Tag */}
        <View style={styles.tagRow}>
          <ThemedText style={styles.tagText}>{puja.maas_paksh} • {puja.tithi}</ThemedText>
        </View>

        {/* Title + meta */}
        <View style={styles.section}>
          <ThemedText style={styles.mainTitle}>{puja.title}</ThemedText>
          <ThemedText style={styles.mainDesc}>{puja.description}</ThemedText>

          <View style={styles.metaRow}>
            <SymbolView name={{ ios: 'building.columns', android: 'account_balance', web: 'account_balance' }} tintColor={BRAND.primary} size={14} />
            <ThemedText style={styles.metaText}>{puja.mandir_address}</ThemedText>
          </View>
          <View style={styles.metaRow}>
            <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} tintColor={BRAND.primary} size={14} />
            <ThemedText style={styles.metaText}>{formattedDate}</ThemedText>
          </View>

          {/* Deities */}
          {puja.deities?.length > 0 && (
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaIcon}>🙏</ThemedText>
              <ThemedText style={styles.metaText}>{puja.deities.map(d => d.deity_name).join(', ')}</ThemedText>
            </View>
          )}

          {/* Doshas */}
          {puja.doshas?.length > 0 && (
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaIcon}>✨</ThemedText>
              <ThemedText style={styles.metaText}>{puja.doshas.map(d => d.dosha_name).join(', ')}</ThemedText>
            </View>
          )}
        </View>

        {/* Devotees */}
        <View style={styles.section}>
          <View style={styles.devoteesAvatars}>
            {DUMMY_DEVOTEE_EMOJIS.map((e, i) => (
              <View key={i} style={[styles.devoteeAvatar, { marginLeft: i === 0 ? 0 : -10 }]}>
                <ThemedText style={{ fontSize: 14 }}>{e}</ThemedText>
              </View>
            ))}
          </View>
          <ThemedText style={styles.devoteesText}>
            Thousands of devotees have participated in Pujas conducted by{' '}
            <ThemedText style={styles.devoteesCount}>Sanatan Seva Setu</ThemedText>.
          </ThemedText>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsRow}>
          {TABS.map((tab, i) => (
            <Pressable key={tab} onPress={() => setActiveTab(i)} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
              <ThemedText style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</ThemedText>
              {activeTab === i && <View style={styles.tabUnderline} />}
            </Pressable>
          ))}
        </ScrollView>

        {/* Tab Content */}
        <View style={styles.tabContent}>

          {/* About Puja */}
          {activeTab === 0 && (
            <View style={{ gap: 12 }}>
              {!!puja.about_header && (
                <ThemedText style={styles.aboutHeader}>{puja.about_header}</ThemedText>
              )}
              {!!puja.about_details && (
                <ThemedText style={styles.aboutText}>{stripHtml(puja.about_details)}</ThemedText>
              )}
            </View>
          )}

          {/* Benefits */}
          {activeTab === 1 && (
            <View style={{ gap: 14 }}>
              {puja.benefits?.length > 0 ? puja.benefits.map(b => {
                const benefitImgUri = Platform.OS === 'web'
                  ? (b.desktop_image_url || b.mobile_image_url)
                  : (b.mobile_image_url || b.desktop_image_url);
                return (
                <View key={b.id} style={styles.benefitCard}>
                  {benefitImgUri ? (
                    <Image
                      source={{ uri: resolveUrl(benefitImgUri) }}
                      style={styles.benefitImg}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.benefitImg, { backgroundColor: '#FFF1DE', alignItems: 'center', justifyContent: 'center' }]}>
                      <ThemedText style={{ fontSize: 28 }}>✨</ThemedText>
                    </View>
                  )}
                  <View style={styles.benefitBody}>
                    <ThemedText style={styles.benefitCategory}>{b.category_name}</ThemedText>
                    <ThemedText style={styles.benefitHeader}>{b.header}</ThemedText>
                    <ThemedText style={styles.benefitDesc}>{b.description}</ThemedText>
                  </View>
                </View>
                );
              }) : (
                <ThemedText style={styles.aboutText}>No benefits listed.</ThemedText>
              )}
            </View>
          )}

          {/* Temple Details */}
          {activeTab === 2 && (
            <View style={{ gap: 12 }}>
              {puja.mandir_image_url ? (
                <Image
                  source={{ uri: resolveUrl(puja.mandir_image_url) }}
                  style={styles.templeImg}
                  contentFit="cover"
                />
              ) : null}
              <View style={styles.templeDetailRow}>
                <SymbolView name={{ ios: 'building.columns', android: 'account_balance', web: 'account_balance' }} tintColor={BRAND.primary} size={16} />
                <ThemedText style={styles.templeDetailText}>{puja.mandir_address}</ThemedText>
              </View>
              <View style={styles.templeDetailRow}>
                <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} tintColor={BRAND.primary} size={16} />
                <ThemedText style={styles.templeDetailText}>{formattedDate}</ThemedText>
              </View>
              {!!puja.pooja_description && (
                <ThemedText style={styles.aboutText}>{stripHtml(puja.pooja_description)}</ThemedText>
              )}
            </View>
          )}

          {/* Process */}
          {activeTab === 4 && (
            <View style={{ gap: 16 }}>
              {processes.length > 0 ? processes.map((p, i) => (
                <View key={p.Id} style={styles.processCard}>
                  <View style={styles.processStepBadge}>
                    <ThemedText style={styles.processStepNum}>{p.SerialNo}</ThemedText>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <ThemedText style={styles.processTitle}>{p.Title}</ThemedText>
                    <ThemedText style={styles.processDesc}>{p.Description}</ThemedText>
                  </View>
                  {i < processes.length - 1 && <View style={styles.processConnector} />}
                </View>
              )) : (
                <ThemedText style={styles.aboutText}>No process steps available.</ThemedText>
              )}
            </View>
          )}

          {/* FAQs */}
          {activeTab === 5 && (
            <View style={{ gap: 10 }}>
              {faqs.filter(f => f.IsActive).length > 0 ? faqs.filter(f => f.IsActive).map(f => (
                <Pressable key={f.Id} onPress={() => setExpandedFaq(expandedFaq === f.Id ? null : f.Id)} style={({ pressed }) => [styles.faqCard, pressed && styles.pressed]}>
                  <View style={styles.faqHeader}>
                    <ThemedText style={styles.faqQuestion}>{f.Question}</ThemedText>
                    <ThemedText style={styles.faqChevron}>{expandedFaq === f.Id ? '▲' : '▼'}</ThemedText>
                  </View>
                  {expandedFaq === f.Id && (
                    <ThemedText style={styles.faqAnswer}>{f.Answer}</ThemedText>
                  )}
                </Pressable>
              )) : (
                <ThemedText style={styles.aboutText}>No FAQs available.</ThemedText>
              )}
            </View>
          )}

          {/* Packages */}
          {activeTab === 3 && (
            <View style={{ gap: 12 }}>
              {puja.packages?.length > 0 ? puja.packages.map((pkg, i) => {
                const pkgImgUri = Platform.OS === 'web'
                  ? (pkg.desktop_image_url || pkg.mobile_image_url)
                  : (pkg.mobile_image_url || pkg.desktop_image_url);
                return (
                <View key={pkg.id} style={[styles.packageCard, i === 0 && styles.packageCardHighlight]}>
                  {i === 0 && (
                    <View style={styles.popularBadge}>
                      <ThemedText style={styles.popularBadgeText}>⭐ Most Popular</ThemedText>
                    </View>
                  )}
                  <View style={styles.packageTopRow}>
                    {pkgImgUri ? (
                      <Image
                        source={{ uri: resolveUrl(pkgImgUri) }}
                        style={styles.packageImg}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.packageImg, { backgroundColor: '#FFF1DE', alignItems: 'center', justifyContent: 'center' }]}>
                        <ThemedText style={{ fontSize: 24 }}>🙏</ThemedText>
                      </View>
                    )}
                    <View style={{ flex: 1, gap: 4 }}>
                      <ThemedText style={styles.packageName}>{pkg.package_title}</ThemedText>
                      {pkg.person_count > 0 && (
                        <ThemedText style={styles.packagePersons}>👥 {pkg.person_count} {pkg.person_count === 1 ? 'Person' : 'Persons'}</ThemedText>
                      )}
                      {!!pkg.person_count_description && (
                        <ThemedText style={styles.packageDesc}>{pkg.person_count_description}</ThemedText>
                      )}
                    </View>
                    <ThemedText style={styles.packagePrice}>₹{pkg.price.toLocaleString()}</ThemedText>
                  </View>
                </View>
                );
              }) : (
                <ThemedText style={styles.aboutText}>No packages available.</ThemedText>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          onPress={() => {
            setSelectedPkgId(puja.packages?.[0]?.id ?? null);
            setPkgModalVisible(true);
          }}
          style={({ pressed }) => [styles.selectPkgBtn, pressed && styles.pressed]}
        >
          <LinearGradient colors={[BRAND.green, BRAND.greenDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.selectPkgGradient}>
            <ThemedText style={styles.selectPkgText}>Select Puja Package  →</ThemedText>
          </LinearGradient>
        </Pressable>
      </SafeAreaView>

      {/* Package Selection Modal */}
      <Modal visible={pkgModalVisible} animationType="slide" transparent onRequestClose={() => setPkgModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPkgModalVisible(false)} />
        <View style={styles.modalSheet}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>All Puja Packages includes</ThemedText>
            <Pressable onPress={() => setPkgModalVisible(false)} style={({ pressed }) => [styles.modalClose, pressed && styles.pressed]}>
              <ThemedText style={styles.modalCloseText}>✕</ThemedText>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Package Info Checklist */}
            <View style={styles.modalSection}>
              {pkgInfoItems.sort((a, b) => a.SerialNo - b.SerialNo).map(item => (
                <View key={item.Id} style={styles.checkRow}>
                  <ThemedText style={styles.checkIcon}>✓</ThemedText>
                  <ThemedText style={styles.checkText}>{item.Description}</ThemedText>
                </View>
              ))}
            </View>

            {/* Green info banner */}
            <View style={styles.infoBanner}>
              <ThemedText style={styles.infoBannerIcon}>🎁</ThemedText>
              <ThemedText style={styles.infoBannerText}>
                Opt for additional offerings like Vastra Daan, Anna Daan, Deep Daan, or Gau Seva in your name, available on the payments page.
              </ThemedText>
            </View>

            {/* Select Package label */}
            <ThemedText style={styles.selectPkgLabel}>Select your puja package</ThemedText>

            {/* Horizontal package cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pkgCardsRow}>
              {(puja.packages ?? []).map(pkg => {
                const isSelected = selectedPkgId === pkg.id;
                const imgUri = Platform.OS === 'web'
                  ? (pkg.desktop_image_url || pkg.mobile_image_url)
                  : (pkg.mobile_image_url || pkg.desktop_image_url);
                return (
                  <Pressable
                    key={pkg.id}
                    onPress={() => setSelectedPkgId(pkg.id)}
                    style={({ pressed }) => [styles.pkgCard, isSelected && styles.pkgCardSelected, pressed && styles.pressed]}
                  >
                    {/* Person badge */}
                    <View style={[styles.pkgPersonBadge, isSelected && styles.pkgPersonBadgeSelected]}>
                      <ThemedText style={[styles.pkgPersonBadgeText, isSelected && styles.pkgPersonBadgeTextSelected]}>
                        👤 {pkg.person_count} {pkg.person_count === 1 ? 'Person' : 'Person'}
                      </ThemedText>
                      {isSelected && <ThemedText style={styles.pkgCheckMark}> ✓</ThemedText>}
                    </View>
                    <ThemedText style={styles.pkgCardName} numberOfLines={2}>{pkg.package_title}</ThemedText>
                    {imgUri ? (
                      <Image source={{ uri: resolveUrl(imgUri) }} style={styles.pkgCardImg} contentFit="cover" />
                    ) : (
                      <View style={[styles.pkgCardImg, { backgroundColor: '#FFF1DE', alignItems: 'center', justifyContent: 'center' }]}>
                        <ThemedText style={{ fontSize: 28 }}>🙏</ThemedText>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Trust badges */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trustRow}>
              {['✅ Money Back Guarantee', '🏷️ No Hidden Cost', '🔒 ISO 27001 Certified', '🛕 Official Temple Partner'].map(t => (
                <View key={t} style={styles.trustBadge}>
                  <ThemedText style={styles.trustBadgeText}>{t}</ThemedText>
                </View>
              ))}
            </ScrollView>
          </ScrollView>

          {/* Proceed CTA */}
          {selectedPkgId && (() => {
            const sel = puja.packages?.find(p => p.id === selectedPkgId);
            if (!sel) return null;
            return (
              <Pressable
                onPress={async () => {
                  if (initiating) return;
                  setInitiating(true);
                  try {
                    const profile = await TokenManager.getUserProfile();
                    const res = await ApiService.initiatePujaBooking({
                      puja_id: puja.id,
                      package_id: sel.id,
                      amount: sel.price,
                      devotee_name: profile.name || '',
                      mobile_number: profile.mobile || '',
                      gotra: '',
                      nakshatra: '',
                      rashi: '',
                      family_members_details: '',
                    });
                    if (res.success && res.data) {
                      setDevoteeName(profile.name || '');
                      setDevoteeMobile(profile.mobile || '');
                      if (res.pending) {
                        setInitiating(false);
                        Alert.alert(
                          'Pending Booking',
                          'You have a pending payment for this Puja. Would you like to complete it now?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Continue Payment',
                              onPress: () => {
                                setRazorpayOrder(res.data!);
                                setPkgModalVisible(false);
                                setRazorpayVisible(true);
                              },
                            },
                          ]
                        );
                        return;
                      }
                      setRazorpayOrder(res.data);
                      setPkgModalVisible(false);
                      setRazorpayVisible(true);
                    } else {
                      Alert.alert('Error', res.message || 'Failed to initiate booking.');
                    }
                  } catch {
                    Alert.alert('Error', 'Something went wrong. Please try again.');
                  } finally {
                    setInitiating(false);
                  }
                }}
                disabled={initiating}
                style={({ pressed }) => [styles.proceedBtn, pressed && styles.pressed]}
              >
                <LinearGradient colors={[BRAND.green, BRAND.greenDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.proceedGradient}>
                  <View>
                    <ThemedText style={styles.proceedPrice}>₹{sel.price.toLocaleString()}</ThemedText>
                    <ThemedText style={styles.proceedPkgName}>{sel.package_title}</ThemedText>
                  </View>
                  {initiating
                    ? <ActivityIndicator color="#FFFFFF" size="small" />
                    : <ThemedText style={styles.proceedCta}>Proceed →</ThemedText>
                  }
                </LinearGradient>
              </Pressable>
            );
          })()}
        </View>
      </Modal>
      {/* Razorpay WebView Modal */}
      {razorpayOrder && (
        <Modal visible={razorpayVisible} animationType="slide" onRequestClose={() => setRazorpayVisible(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View style={styles.rzpHeader}>
              <Pressable onPress={() => setRazorpayVisible(false)} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={BRAND.text} size={18} />
              </Pressable>
              <ThemedText style={styles.rzpHeaderTitle}>Complete Payment</ThemedText>
            </View>
            <RazorpayWebView
              html={buildRazorpayHtml(razorpayOrder, devoteeName, devoteeMobile)}
              style={{ flex: 1 }}
              onMessage={async (e) => {
                try {
                  const msg = JSON.parse(e.nativeEvent.data);
                  if (msg.type === 'payment_success') {
                    setRazorpayVisible(false);
                    const verifyRes = await ApiService.verifyPujaPayment({
                      razorpay_order_id: msg.razorpay_order_id,
                      razorpay_payment_id: msg.razorpay_payment_id,
                      razorpay_signature: msg.razorpay_signature,
                    });
                    if (verifyRes.success) {
                      setTransactionId(verifyRes.data?.transaction_id ?? '');
                      setPaymentSuccess(true);
                    } else {
                      Alert.alert('Verification Failed', verifyRes.message);
                    }
                  } else if (msg.type === 'payment_failed') {
                    setRazorpayVisible(false);
                    Alert.alert('Payment Failed', msg.description || 'Payment was not completed.');
                  } else if (msg.type === 'payment_dismissed') {
                    setRazorpayVisible(false);
                  }
                } catch { /* ignore parse errors */ }
              }}
            />
          </SafeAreaView>
        </Modal>
      )}

      {/* Payment Success Modal */}
      <Modal visible={paymentSuccess} animationType="fade" transparent onRequestClose={() => { setPaymentSuccess(false); router.replace('/(tabs)/home'); }}>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} tintColor="#16A34A" size={56} />
            </View>
            <ThemedText style={styles.successTitle}>Payment Successful!</ThemedText>
            <ThemedText style={styles.successMsg}>Your puja booking has been confirmed.</ThemedText>
            {!!transactionId && (
              <View style={styles.txnRow}>
                <ThemedText style={styles.txnLabel}>Transaction ID</ThemedText>
                <ThemedText style={styles.txnValue}>{transactionId}</ThemedText>
              </View>
            )}
            <Pressable
              onPress={() => { setPaymentSuccess(false); router.replace('/(tabs)/home'); }}
              style={({ pressed }) => [styles.successBtn, pressed && styles.pressed]}
            >
              <ThemedText style={styles.successBtnText}>Back to Home</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function buildRazorpayHtml(
  order: InitiatePujaBookingResponse,
  name: string,
  mobile: string,
): string {
  const key = ENV_CONFIG.RAZORPAY_KEY_ID;
  const amount = Math.round(order.amount * 100);
  const orderId = order.razorpay_order_id;
  const desc = 'Puja Booking #' + order.booking_no;
  const safeName = name.replace(/"/g, '');
  const safeMobile = mobile.replace(/"/g, '');

  return (
    '<!DOCTYPE html><html><head>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>' +
    'body{margin:0;background:#F7F4EE;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;gap:16px}' +
    '.title{font-size:16px;font-weight:700;color:#1F1A14}' +
    '.amt{font-size:26px;font-weight:900;color:#E8731C}' +
    '.desc{font-size:13px;color:#6B6258}' +
    '#rzp-button1{background:#E8731C;color:#fff;border:none;border-radius:12px;padding:16px 48px;font-size:16px;font-weight:700;cursor:pointer;letter-spacing:0.3px}' +
    '#rzp-button1:active{opacity:0.85}' +
    '</style></head><body>' +
    '<div class="title">Sanatan Seva Setu</div>' +
    '<div class="amt">\u20b9' + order.amount.toLocaleString('en-IN') + '</div>' +
    '<div class="desc">' + desc + '</div>' +
    '<button id="rzp-button1">Pay Now</button>' +
    '<script src="https://checkout.razorpay.com/v1/checkout.js"><\/script>' +
    '<script>' +
    'function postMsg(d){var m=JSON.stringify(d);if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(m);}else{window.parent.postMessage(m,"*");}}' +
    'var options={' +
    '"key":"' + key + '",' +
    '"amount":"' + amount + '",' +
    '"currency":"INR",' +
    '"name":"Sanatan Seva Setu",' +
    '"description":"' + desc + '",' +
    '"order_id":"' + orderId + '",' +
    '"prefill":{"name":"' + safeName + '","contact":"' + safeMobile + '"},' +
    '"notes":{"app":"SanatanSevaSetu"},' +
    '"theme":{"color":"#E8731C"},' +
    '"handler":function(r){postMsg({type:"payment_success",razorpay_order_id:r.razorpay_order_id,razorpay_payment_id:r.razorpay_payment_id,razorpay_signature:r.razorpay_signature});},' +
    '"modal":{"ondismiss":function(){postMsg({type:"payment_dismissed"});}}' +
    '};' +
    'var rzp1=new Razorpay(options);' +
    'document.getElementById("rzp-button1").onclick=function(e){rzp1.open();e.preventDefault();};' +
    'rzp1.on("payment.failed",function(r){postMsg({type:"payment_failed",description:r.error.description});});' +
    '<\/script></body></html>'
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  headerSafe: { backgroundColor: BRAND.card, borderBottomWidth: 1, borderBottomColor: BRAND.border },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0EAE0', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogoWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF1DE', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: BRAND.text },
  headerSubtitle: { fontSize: 11, color: BRAND.textSecondary },
  pressed: { opacity: 0.85 },

  scroll: { flex: 1 },

  sliderWrap: { position: 'relative' },
  sliderImg: { height: 220 },
  mainImg: { width: '100%', height: 220 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E0CFB0' },
  dotActive: { width: 18, backgroundColor: BRAND.primary },

  typePillsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.three, paddingTop: 12, flexWrap: 'wrap' },
  typePill: { backgroundColor: '#FFF1DE', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: BRAND.border },
  typePillText: { fontSize: 11, fontWeight: '700', color: BRAND.primary },

  tagRow: { paddingHorizontal: Spacing.three, paddingTop: 8, paddingBottom: 4 },
  tagText: { fontSize: 11, fontWeight: '800', color: BRAND.pink, letterSpacing: 0.5, textTransform: 'uppercase' },

  section: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, gap: 8 },
  mainTitle: { fontSize: 20, fontWeight: '900', color: BRAND.text, lineHeight: 26 },
  mainDesc: { fontSize: 14, color: BRAND.textSecondary, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  metaText: { fontSize: 13, color: BRAND.textSecondary, flex: 1, lineHeight: 18 },
  metaIcon: { fontSize: 14 },

  devoteesAvatars: { flexDirection: 'row', marginBottom: 6 },
  devoteeAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E0D6C2', borderWidth: 2, borderColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  devoteesText: { fontSize: 12, color: BRAND.textSecondary, lineHeight: 17 },
  devoteesCount: { color: BRAND.primary, fontWeight: '800' },

  tabsScroll: { borderBottomWidth: 1, borderBottomColor: BRAND.border },
  tabsRow: { paddingHorizontal: Spacing.three, gap: 0 },
  tab: { paddingHorizontal: 14, paddingVertical: 12, position: 'relative' },
  tabText: { fontSize: 14, fontWeight: '600', color: BRAND.textSecondary },
  tabTextActive: { color: BRAND.primary, fontWeight: '800' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 14, right: 14, height: 2.5, backgroundColor: BRAND.primary, borderRadius: 2 },

  tabContent: { padding: Spacing.three },
  aboutHeader: { fontSize: 15, fontWeight: '700', color: BRAND.text, lineHeight: 22 },
  aboutText: { fontSize: 14, color: BRAND.textSecondary, lineHeight: 22 },

  // Benefits
  benefitCard: { flexDirection: 'row', gap: 12, backgroundColor: BRAND.bgLight, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: BRAND.border },
  benefitImg: { width: 80, height: 80 },
  benefitBody: { flex: 1, padding: 10, gap: 4 },
  benefitCategory: { fontSize: 10, fontWeight: '800', color: BRAND.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  benefitHeader: { fontSize: 13, fontWeight: '800', color: BRAND.text },
  benefitDesc: { fontSize: 12, color: BRAND.textSecondary, lineHeight: 17 },

  // Temple
  templeImg: { width: '100%', height: 160, borderRadius: 12 },
  templeDetailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  templeDetailText: { flex: 1, fontSize: 14, color: BRAND.text, lineHeight: 20 },

  // Packages
  packageCard: {
    borderWidth: 1.5, borderColor: BRAND.border,
    borderRadius: 14, padding: Spacing.three, gap: 8,
    backgroundColor: BRAND.card,
  },
  packageCardHighlight: { borderColor: BRAND.primary, backgroundColor: '#FFF8F0' },
  popularBadge: {
    alignSelf: 'flex-start', backgroundColor: '#FFF1DE',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  popularBadgeText: { fontSize: 11, fontWeight: '800', color: BRAND.primary },
  packageTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  packageImg: { width: 64, height: 64, borderRadius: 10 },
  packageName: { fontSize: 15, fontWeight: '800', color: BRAND.text },
  packagePersons: { fontSize: 12, color: BRAND.textSecondary },
  packageDesc: { fontSize: 12, color: BRAND.textSecondary },
  packagePrice: { fontSize: 20, fontWeight: '900', color: BRAND.primary },

  footer: {
    backgroundColor: BRAND.card, borderTopWidth: 1, borderTopColor: BRAND.border,
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.two,
  },
  selectPkgBtn: { borderRadius: 14, overflow: 'hidden' },
  selectPkgGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  selectPkgText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },

  // Process
  processCard: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  processStepBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: BRAND.primary, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  processStepNum: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
  processTitle: { fontSize: 14, fontWeight: '800', color: BRAND.text },
  processDesc: { fontSize: 13, color: BRAND.textSecondary, lineHeight: 20 },
  processConnector: {
    position: 'absolute', left: 17, top: 36, width: 2, height: 20,
    backgroundColor: BRAND.border,
  },

  // FAQs
  faqCard: {
    borderWidth: 1, borderColor: BRAND.border, borderRadius: 12,
    padding: 14, backgroundColor: BRAND.bgLight, gap: 8,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '700', color: BRAND.text, lineHeight: 20 },
  faqChevron: { fontSize: 11, color: BRAND.primary, marginTop: 2 },
  faqAnswer: { fontSize: 13, color: BRAND.textSecondary, lineHeight: 21 },

  // Package Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: BRAND.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingTop: 4,
    ...(Platform.OS === 'web' ? { maxWidth: 520, alignSelf: 'center' as const, width: '100%', borderRadius: 24, marginTop: 'auto' as const } : {}),
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: BRAND.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '900', color: BRAND.text, flex: 1 },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0EAE0', alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  modalSection: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  checkRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  checkIcon: { fontSize: 15, fontWeight: '900', color: BRAND.green, marginTop: 1 },
  checkText: { flex: 1, fontSize: 14, color: BRAND.text, lineHeight: 21 },
  infoBanner: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#E8F5E9', borderRadius: 10,
    marginHorizontal: 20, marginTop: 14, padding: 12,
  },
  infoBannerIcon: { fontSize: 18 },
  infoBannerText: { flex: 1, fontSize: 12, color: '#2E7D32', lineHeight: 18 },
  selectPkgLabel: { fontSize: 16, fontWeight: '900', color: BRAND.text, paddingHorizontal: 20, marginTop: 18, marginBottom: 12 },
  pkgCardsRow: { paddingHorizontal: 20, gap: 10 },
  pkgCard: {
    width: 130, borderRadius: 14, borderWidth: 1.5, borderColor: BRAND.border,
    backgroundColor: BRAND.card, padding: 10, gap: 6, overflow: 'hidden',
  },
  pkgCardSelected: { borderColor: BRAND.primary, backgroundColor: '#FFF8F0' },
  pkgPersonBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FCE4EC', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  pkgPersonBadgeSelected: { backgroundColor: BRAND.primary },
  pkgPersonBadgeText: { fontSize: 10, fontWeight: '700', color: '#C2185B' },
  pkgPersonBadgeTextSelected: { color: '#FFFFFF' },
  pkgCheckMark: { fontSize: 10, fontWeight: '900', color: '#FFFFFF' },
  pkgCardName: { fontSize: 12, fontWeight: '800', color: BRAND.text, lineHeight: 16 },
  pkgCardImg: { width: '100%', height: 80, borderRadius: 8, marginTop: 4 },
  trustRow: { paddingHorizontal: 20, gap: 8, marginTop: 16 },
  trustBadge: {
    backgroundColor: '#F5F5F5', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  trustBadgeText: { fontSize: 11, color: BRAND.textSecondary, fontWeight: '600' },
  proceedBtn: { marginHorizontal: 20, marginTop: 12, marginBottom: 8, borderRadius: 14, overflow: 'hidden' },
  proceedGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  proceedPrice: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  proceedPkgName: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  proceedCta: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },

  rzpHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.two,
    borderBottomWidth: 1, borderBottomColor: BRAND.border,
    backgroundColor: BRAND.card,
  },
  rzpHeaderTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },

  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  successCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28,
    alignItems: 'center', gap: 12, width: '100%', maxWidth: 360,
  },
  successIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F0FFF4', alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 20, fontWeight: '900', color: BRAND.text },
  successMsg: { fontSize: 14, color: BRAND.textSecondary, textAlign: 'center' },
  txnRow: { alignSelf: 'stretch', backgroundColor: '#F0FFF4', borderRadius: 10, padding: 12, gap: 4 },
  txnLabel: { fontSize: 12, color: BRAND.textSecondary, fontWeight: '600' },
  txnValue: { fontSize: 13, color: BRAND.text, fontWeight: '800' },
  successBtn: {
    backgroundColor: BRAND.primary, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32, marginTop: 4,
  },
  successBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
