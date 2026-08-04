import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RazorpayWebView } from '@/components/razorpay-webview';
import { ThemedText } from '@/components/themed-text';
import { ImageSlider } from '@/components/image-slider';
import { ApiService, TokenManager, type FAQ, type InitiatePujaBookingResponse, type PujaDetail, type PujaPackageInfo, type PujaProcess } from '@/constants/api';
import { ENV_CONFIG, getApiBaseUrl } from '@/constants/environment';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useT, useTranslatedBatch, useTranslatedList } from '@/i18n/LanguageContext';

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

const TABS = [
  'aboutPujaTab', 'benefitsTab', 'templeDetailsTab', 'packagesTab', 'processTab', 'faqsTab',
] as const;

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
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log('[GroupPujaDetail] received id:', id);
  const [puja, setPuja] = useState<PujaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const mainScrollRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<(View | null)[]>([]);
  const scrollNodeRef = useRef<number | null>(null);
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

  const [title, description, mandirAddress, aboutHeader, aboutDetailsText, poojaDescriptionText] = useTranslatedBatch([
    puja?.title,
    puja?.description,
    puja?.mandir_address,
    puja?.about_header,
    puja ? stripHtml(puja.about_details ?? '') : '',
    puja ? stripHtml(puja.pooja_description ?? '') : '',
  ]);
  const translatedBenefits = useTranslatedList(puja?.benefits ?? [], ['header', 'description', 'category_name']);
  const translatedPackages = useTranslatedList(puja?.packages ?? [], ['package_title', 'person_count_description']);
  const translatedProcesses = useTranslatedList(processes, ['Title', 'Description']);
  const translatedFaqs = useTranslatedList(faqs, ['Question', 'Answer']);

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
              <ThemedText style={styles.headerSubtitle}>{t('pujaSeva')}</ThemedText>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Tabs — fixed outside ScrollView so they stay clickable on Android */}
      <View style={styles.tabsSticky}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map((tab, i) => (
            <Pressable
              key={tab}
              onPress={() => {
                setActiveTab(i);
                const section = sectionRefs.current[i];
                if (!section || !mainScrollRef.current) return;
                if (Platform.OS === 'web') {
                  const node = (section as any)._nativeTag ?? (section as any);
                  if (node?.scrollIntoView) {
                    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    (section as any).measureLayout?.(
                      (mainScrollRef.current as any),
                      (_x: number, y: number) => {
                        mainScrollRef.current?.scrollTo({ y: y - 60, animated: true });
                      },
                      () => {},
                    );
                  }
                } else {
                  (section as any).measureLayout(
                    (mainScrollRef.current as any),
                    (_x: number, y: number) => {
                      mainScrollRef.current?.scrollTo({ y: y - 60, animated: true });
                    },
                    () => {},
                  );
                }
              }}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              <ThemedText style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{t(tab as any)}</ThemedText>
              {activeTab === i && <View style={styles.tabUnderline} />}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={mainScrollRef}
        style={styles.scroll}
        contentContainerStyle={Platform.OS === 'web' ? styles.scrollContentWeb : undefined}
        showsVerticalScrollIndicator={false}
      >

        {/* Image Slider */}
        {sliders.length > 0 ? (
          <ImageSlider
            slides={sliders.map(s => ({
              id: s.id,
              uri: resolveUrl(Platform.OS === 'web' ? (s.desktop_image || s.mobile_image) : (s.mobile_image || s.desktop_image)),
            }))}
          />
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
          <ThemedText style={styles.mainTitle}>{title}</ThemedText>
          <ThemedText style={styles.mainDesc}>{description}</ThemedText>

          <View style={styles.metaRow}>
            <SymbolView name={{ ios: 'building.columns', android: 'account_balance', web: 'account_balance' }} tintColor={BRAND.primary} size={14} />
            <ThemedText style={styles.metaText}>{mandirAddress}</ThemedText>
          </View>
          <View style={styles.metaRow}>
            <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} tintColor={BRAND.primary} size={14} />
            <ThemedText style={styles.metaText}>{formattedDate}</ThemedText>
          </View>

          {/* Deities */}
          {puja.deities?.length > 0 && (
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaIcon}>🙏</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.metaText, { fontWeight: '700', color: BRAND.text }]}>Deities</ThemedText>
                <ThemedText style={styles.metaText}>{puja.deities.map(d => d.deity_name).join(', ')}</ThemedText>
              </View>
            </View>
          )}

          {/* Tithis */}
          {!!puja.tithi && (
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaIcon}>🌙</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.metaText, { fontWeight: '700', color: BRAND.text }]}>Tithi</ThemedText>
                <ThemedText style={styles.metaText}>{puja.tithi}{puja.maas_paksh ? ` • ${puja.maas_paksh}` : ''}</ThemedText>
              </View>
            </View>
          )}

          {/* Doshas */}
          {puja.doshas?.length > 0 && (
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaIcon}>✨</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.metaText, { fontWeight: '700', color: BRAND.text }]}>Doshas</ThemedText>
                <ThemedText style={styles.metaText}>{puja.doshas.map(d => d.dosha_name).join(', ')}</ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Devotees section removed */}

        {/* About Puja */}
        <View
          style={styles.tabContent}
          ref={r => { sectionRefs.current[0] = r; }}
        >
          <ThemedText style={styles.sectionHeading}>{t('aboutPujaTab')}</ThemedText>
          <ExpandableText text={aboutHeader ? `${aboutHeader}\n\n${aboutDetailsText}` : aboutDetailsText} fallback={t('noDetails')} />
        </View>

        {/* Benefits */}
        <View
          style={styles.tabContent}
          ref={r => { sectionRefs.current[1] = r; }}
        >
          <ThemedText style={styles.sectionHeading}>{t('benefitsTab')}</ThemedText>
          <View style={{ gap: 14 }}>
            {translatedBenefits.length > 0 ? translatedBenefits.map(b => {
              const benefitImgUri = Platform.OS === 'web'
                ? (b.desktop_image_url || b.mobile_image_url)
                : (b.mobile_image_url || b.desktop_image_url);
              return (
                <View key={b.id} style={styles.benefitCard}>
                  {benefitImgUri ? (
                    <Image source={{ uri: resolveUrl(benefitImgUri) }} style={styles.benefitImg} contentFit="cover" />
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
            }) : <ThemedText style={styles.aboutText}>{t('noBenefits')}</ThemedText>}
          </View>
        </View>

        {/* Temple Details */}
        <View
          style={styles.tabContent}
          ref={r => { sectionRefs.current[2] = r; }}
        >
          <ThemedText style={styles.sectionHeading}>{t('templeDetailsTab')}</ThemedText>
          <View style={{ gap: 12 }}>
            {puja.mandir_image_url ? (
              <Image source={{ uri: resolveUrl(puja.mandir_image_url) }} style={styles.templeImg} contentFit="cover" />
            ) : null}
            <View style={styles.templeDetailRow}>
              <SymbolView name={{ ios: 'building.columns', android: 'account_balance', web: 'account_balance' }} tintColor={BRAND.primary} size={16} />
              <ThemedText style={styles.templeDetailText}>{mandirAddress}</ThemedText>
            </View>
            <View style={styles.templeDetailRow}>
              <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} tintColor={BRAND.primary} size={16} />
              <ThemedText style={styles.templeDetailText}>{formattedDate}</ThemedText>
            </View>
            {!!puja.pooja_description && (
              <ExpandableText text={poojaDescriptionText} />
            )}
          </View>
        </View>

        {/* Packages */}
        <View
          style={styles.tabContent}
          ref={r => { sectionRefs.current[3] = r; }}
        >
          <ThemedText style={styles.sectionHeading}>{t('packagesTab')}</ThemedText>
          <View style={{ gap: 12 }}>
            {translatedPackages.length > 0 ? translatedPackages.map((pkg, i) => {
              const pkgImgUri = Platform.OS === 'web'
                ? (pkg.desktop_image_url || pkg.mobile_image_url)
                : (pkg.mobile_image_url || pkg.desktop_image_url);
              const isSelected = selectedPkgId === pkg.id;
              return (
                <Pressable
                  key={pkg.id}
                  onPress={() => setSelectedPkgId(isSelected ? null : pkg.id)}
                  style={({ pressed }) => [styles.packageCard, isSelected && styles.packageCardHighlight, pressed && styles.pressed]}
                >
                  {i === 0 && (
                    <View style={styles.popularBadge}>
                      <ThemedText style={styles.popularBadgeText}>{t('mostPopular')}</ThemedText>
                    </View>
                  )}
                  <View style={styles.packageTopRow}>
                    {pkgImgUri ? (
                      <Image source={{ uri: resolveUrl(pkgImgUri) }} style={styles.packageImg} contentFit="cover" />
                    ) : (
                      <View style={[styles.packageImg, { backgroundColor: '#FFF1DE', alignItems: 'center', justifyContent: 'center' }]}>
                        <ThemedText style={{ fontSize: 24 }}>🙏</ThemedText>
                      </View>
                    )}
                    <View style={{ flex: 1, gap: 4 }}>
                      <ThemedText style={styles.packageName}>{pkg.package_title}</ThemedText>
                      {pkg.person_count > 0 && (
                        <ThemedText style={styles.packagePersons}>👥 {pkg.person_count} {pkg.person_count === 1 ? t('person') : t('persons')}</ThemedText>
                      )}
                      {!!pkg.person_count_description && (
                        <ThemedText style={styles.packageDesc}>{pkg.person_count_description}</ThemedText>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <ThemedText style={styles.packagePrice}>₹{pkg.price.toLocaleString()}</ThemedText>
                      {isSelected && (
                        <View style={styles.pkgSelectedBadge}>
                          <ThemedText style={styles.pkgSelectedBadgeText}>{t('selected')}</ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            }) : <ThemedText style={styles.aboutText}>{t('noPackages')}</ThemedText>}
          </View>
        </View>

        {/* Process */}
        <View
          style={styles.tabContent}
          ref={r => { sectionRefs.current[4] = r; }}
        >
          <ThemedText style={styles.sectionHeading}>{t('processTab')}</ThemedText>
          <View style={{ gap: 16 }}>
            {translatedProcesses.length > 0 ? translatedProcesses.map((p, i) => (
              <View key={p.Id} style={styles.processCard}>
                <View style={styles.processStepBadge}>
                  <ThemedText style={styles.processStepNum}>{p.SerialNo}</ThemedText>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <ThemedText style={styles.processTitle}>{p.Title}</ThemedText>
                  <ThemedText style={styles.processDesc}>{p.Description}</ThemedText>
                </View>
                {i < translatedProcesses.length - 1 && <View style={styles.processConnector} />}
              </View>
            )) : <ThemedText style={styles.aboutText}>{t('noProcess')}</ThemedText>}
          </View>
        </View>

        {/* FAQs */}
        <View
          style={styles.tabContent}
          ref={r => { sectionRefs.current[5] = r; }}
        >
          <ThemedText style={styles.sectionHeading}>{t('faqsTab')}</ThemedText>
          <View style={{ gap: 10 }}>
            {translatedFaqs.filter(f => f.IsActive).length > 0 ? translatedFaqs.filter(f => f.IsActive).map(f => (
              <Pressable key={f.Id} onPress={() => setExpandedFaq(expandedFaq === f.Id ? null : f.Id)} style={({ pressed }) => [styles.faqCard, pressed && styles.pressed]}>
                <View style={styles.faqHeader}>
                  <ThemedText style={styles.faqQuestion}>{f.Question}</ThemedText>
                  <ThemedText style={styles.faqChevron}>{expandedFaq === f.Id ? '▲' : '▼'}</ThemedText>
                </View>
                {expandedFaq === f.Id && (
                  <ThemedText style={styles.faqAnswer}>{f.Answer}</ThemedText>
                )}
              </Pressable>
            )) : <ThemedText style={styles.aboutText}>{t('noFaqs')}</ThemedText>}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          onPress={() => {
            if (!selectedPkgId && puja.packages?.length) setSelectedPkgId(puja.packages[0].id);
            setPkgModalVisible(true);
          }}
          style={({ pressed }) => [styles.selectPkgBtn, pressed && styles.pressed]}
        >
          <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.selectPkgGradient}>
            <ThemedText style={styles.selectPkgText}>{t('bookThisPuja')}</ThemedText>
          </LinearGradient>
        </Pressable>
      </SafeAreaView>

      {/* Package Selection Modal — Book Puja Full Screen */}
      <Modal visible={pkgModalVisible} animationType="fade" transparent onRequestClose={() => setPkgModalVisible(false)}>
        <View style={styles.pkgModalBackdrop}>
          <View style={styles.pkgModalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setPkgModalVisible(false)} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={BRAND.text} size={20} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.modalTitle}>{t('bookPujaModal')}</ThemedText>
              <ThemedText style={styles.modalSubtitle} numberOfLines={1}>{title}</ThemedText>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            {/* What's included */}
            {pkgInfoItems.length > 0 && (
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalSectionTitle}>{t('whatsIncluded')}</ThemedText>
                <View style={styles.checkList}>
                  {pkgInfoItems.sort((a, b) => a.SerialNo - b.SerialNo).map(item => (
                    <View key={item.Id} style={styles.checkRow}>
                      <View style={styles.checkDot} />
                      <ThemedText style={styles.checkText}>{item.Description}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Info banner */}
            <View style={styles.infoBanner}>
              <ThemedText style={styles.infoBannerIcon}>🎁</ThemedText>
              <ThemedText style={styles.infoBannerText}>{t('additionalOfferings')}</ThemedText>
            </View>

            {/* Select Package */}
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>{t('selectPackage')}</ThemedText>
              <View style={{ gap: 10 }}>
                {translatedPackages.map((pkg) => {
                  const isSelected = selectedPkgId === pkg.id;
                  const imgUri = Platform.OS === 'web'
                    ? (pkg.desktop_image_url || pkg.mobile_image_url)
                    : (pkg.mobile_image_url || pkg.desktop_image_url);
                  return (
                    <Pressable
                      key={pkg.id}
                      onPress={() => setSelectedPkgId(pkg.id)}
                      style={({ pressed }) => [styles.pkgListCard, isSelected && styles.pkgListCardSelected, pressed && styles.pressed]}
                    >
                      {imgUri ? (
                        <Image source={{ uri: resolveUrl(imgUri) }} style={styles.pkgListImg} contentFit="cover" />
                      ) : (
                        <View style={[styles.pkgListImg, { backgroundColor: '#FFF1DE', alignItems: 'center', justifyContent: 'center' }]}>
                          <ThemedText style={{ fontSize: 22 }}>🙏</ThemedText>
                        </View>
                      )}
                      <View style={{ flex: 1, gap: 3 }}>
                        <ThemedText style={[styles.pkgListName, isSelected && { color: BRAND.primary }]}>{pkg.package_title}</ThemedText>
                        {pkg.person_count > 0 && (
                        <ThemedText style={styles.pkgListPersons}>👥 {pkg.person_count} {pkg.person_count === 1 ? t('person') : t('persons')}</ThemedText>
                        )}
                        {!!pkg.person_count_description && (
                          <ThemedText style={styles.pkgListDesc} numberOfLines={2}>{pkg.person_count_description}</ThemedText>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <ThemedText style={styles.pkgListPrice}>₹{pkg.price.toLocaleString()}</ThemedText>
                        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Trust badges */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trustRow}>
              {[t('moneyBack'), t('noHiddenCost'), t('securePayment'), t('officialTemple')].map(badge => (
                <View key={badge} style={styles.trustBadge}>
                  <ThemedText style={styles.trustBadgeText}>{badge}</ThemedText>
                </View>
              ))}
            </ScrollView>
          </ScrollView>

          {/* Proceed CTA */}
          <SafeAreaView edges={['bottom']} style={{ backgroundColor: BRAND.card }}>
          {selectedPkgId && (() => {
            const sel = translatedPackages.find(p => p.id === selectedPkgId);
            if (!sel) return null;
            return (
              <View style={styles.modalFooter}>
                <View style={styles.modalFooterInfo}>
                  <ThemedText style={styles.modalFooterPrice}>₹{sel.price.toLocaleString()}</ThemedText>
                  <ThemedText style={styles.modalFooterPkg} numberOfLines={1}>{sel.package_title}</ThemedText>
                </View>
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
                          Alert.alert('Pending Booking', 'You have a pending payment. Continue?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Continue', onPress: () => { setRazorpayOrder(res.data!); setPkgModalVisible(false); setRazorpayVisible(true); } },
                          ]);
                          return;
                        }
                        setRazorpayOrder(res.data);
                        setPkgModalVisible(false);
                        setRazorpayVisible(true);
                      } else {
                        Alert.alert('Error', res.message || 'Failed to initiate booking.');
                      }
                    } catch {
                      Alert.alert('Error', 'Something went wrong.');
                    } finally {
                      setInitiating(false);
                    }
                  }}
                  disabled={initiating}
                  style={({ pressed }) => [styles.modalProceedBtn, pressed && styles.pressed]}
                >
                  <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalProceedGradient}>
                    {initiating
                      ? <ActivityIndicator color="#FFFFFF" size="small" />
                      : <ThemedText style={styles.modalProceedText}>{t('payNow')}</ThemedText>
                    }
                  </LinearGradient>
                </Pressable>
              </View>
            );
          })()}
          </SafeAreaView>
          </View>
        </View>
      </Modal>
      {/* Razorpay WebView Modal */}
      {razorpayOrder && (
        <Modal visible={razorpayVisible} animationType="slide" transparent onRequestClose={() => setRazorpayVisible(false)}>
          <View style={styles.pkgModalBackdrop}>
          <View style={styles.pkgModalContainer}>
          <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View style={styles.rzpHeader}>
              <Pressable onPress={() => setRazorpayVisible(false)} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={BRAND.text} size={18} />
              </Pressable>
              <ThemedText style={styles.rzpHeaderTitle}>{t('completePayment')}</ThemedText>
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
          </View>
          </View>
        </Modal>
      )}

      {/* Payment Success Modal */}
      <Modal visible={paymentSuccess} animationType="fade" transparent onRequestClose={() => { setPaymentSuccess(false); router.replace('/(tabs)/home'); }}>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} tintColor="#16A34A" size={56} />
            </View>
            <ThemedText style={styles.successTitle}>{t('paymentSuccessful')}</ThemedText>
            <ThemedText style={styles.successMsg}>{t('pujaBookingConfirmed')}</ThemedText>
            {!!transactionId && (
              <View style={styles.txnRow}>
                <ThemedText style={styles.txnLabel}>{t('transactionId')}</ThemedText>
                <ThemedText style={styles.txnValue}>{transactionId}</ThemedText>
              </View>
            )}
            <Pressable
              onPress={() => { setPaymentSuccess(false); router.replace('/(tabs)/home'); }}
              style={({ pressed }) => [styles.successBtn, pressed && styles.pressed]}
            >
              <ThemedText style={styles.successBtnText}>{t('backToHome')}</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ExpandableText({ text, fallback }: { text: string; fallback?: string }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 300;
  const content = text?.trim() || fallback || '';
  const isLong = content.length > LIMIT;
  return (
    <View>
      <ThemedText style={styles.aboutText}>
        {isLong && !expanded ? content.slice(0, LIMIT) + '...' : content}
      </ThemedText>
      {isLong && (
        <Pressable onPress={() => setExpanded(e => !e)} style={({ pressed }) => [styles.readMoreBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.readMoreText}>{expanded ? 'Read Less ▲' : 'Read More ▼'}</ThemedText>
        </Pressable>
      )}
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
  scrollContentWeb: { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' } as any,

  sliderWrap: { position: 'relative' },
  mainImg: {
    width: '100%',
    ...(Platform.OS === 'web' ? { aspectRatio: 16 / 9 } : { height: 220 }),
  },

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

  sectionHeading: { fontSize: 17, fontWeight: '900', color: BRAND.text, marginBottom: 12 },
  pkgSelectedBadge: { backgroundColor: BRAND.green, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  pkgSelectedBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

  tabsSticky: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
    backgroundColor: BRAND.card,
  },
  tabsRow: { paddingHorizontal: Spacing.three, gap: 0 },
  tab: { paddingHorizontal: 14, paddingVertical: 12, position: 'relative' },
  tabText: { fontSize: 14, fontWeight: '600', color: BRAND.textSecondary },
  tabTextActive: { color: BRAND.primary, fontWeight: '800' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 14, right: 14, height: 2.5, backgroundColor: BRAND.primary, borderRadius: 2 },

  tabContent: { padding: Spacing.three },
  aboutHeader: { fontSize: 15, fontWeight: '700', color: BRAND.text, lineHeight: 22 },
  aboutText: { fontSize: 14, color: BRAND.textSecondary, lineHeight: 22 },
  readMoreBtn: { marginTop: 8, alignSelf: 'flex-start' },
  readMoreText: { fontSize: 13, fontWeight: '700', color: BRAND.primary },

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
    backgroundColor: BRAND.card,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Platform.OS === 'android' ? Spacing.two : 4,
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
  pkgModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center' as const,
    justifyContent: Platform.OS === 'web' ? 'center' as const : 'flex-end' as const,
  },
  pkgModalContainer: {
    backgroundColor: BRAND.card,
    width: '100%',
    ...(Platform.OS === 'web' ? {
      maxWidth: 680,
      maxHeight: '92%' as any,
      height: '92%' as any,
      borderRadius: 16,
      overflow: 'hidden' as const,
    } : {
      flex: 1,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden' as const,
    }),
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: BRAND.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...(Platform.OS === 'web' ? { maxWidth: 520, alignSelf: 'center' as const, width: '100%', borderRadius: 24, marginTop: 'auto' as const } : {}),
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0D6C2', alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BRAND.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: BRAND.text },
  modalSubtitle: { fontSize: 12, color: BRAND.textSecondary, marginTop: 2 },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0EAE0', alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  modalSection: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  modalSectionTitle: { fontSize: 14, fontWeight: '800', color: BRAND.text, marginBottom: 4 },
  checkList: { gap: 8 },
  checkRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  checkDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: BRAND.green, marginTop: 6, flexShrink: 0 },
  checkIcon: { fontSize: 15, fontWeight: '900', color: BRAND.green, marginTop: 1 },
  checkText: { flex: 1, fontSize: 13, color: BRAND.text, lineHeight: 20 },
  infoBanner: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#E8F5E9', borderRadius: 10,
    marginHorizontal: 16, marginTop: 12, padding: 12,
  },
  infoBannerIcon: { fontSize: 16 },
  infoBannerText: { flex: 1, fontSize: 12, color: '#2E7D32', lineHeight: 17 },

  // Package list cards (vertical, inside modal)
  pkgListCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: BRAND.border,
    borderRadius: 14, padding: 12,
    backgroundColor: BRAND.card,
  },
  pkgListCardSelected: { borderColor: BRAND.primary, backgroundColor: '#FFF8F0' },
  pkgListImg: { width: 60, height: 60, borderRadius: 10, flexShrink: 0 },
  pkgListName: { fontSize: 14, fontWeight: '800', color: BRAND.text },
  pkgListPersons: { fontSize: 12, color: BRAND.textSecondary },
  pkgListDesc: { fontSize: 11, color: BRAND.textSecondary, lineHeight: 15 },
  pkgListPrice: { fontSize: 16, fontWeight: '900', color: BRAND.primary },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: BRAND.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: BRAND.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.primary },

  // Modal footer with price + pay button
  modalFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: BRAND.border,
    backgroundColor: BRAND.card,
  },
  modalFooterInfo: { flex: 1 },
  modalFooterPrice: { fontSize: 20, fontWeight: '900', color: BRAND.primary },
  modalFooterPkg: { fontSize: 11, color: BRAND.textSecondary, marginTop: 1 },
  modalProceedBtn: { borderRadius: 12, overflow: 'hidden', minWidth: 120 },
  modalProceedGradient: { paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  modalProceedText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },

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
  trustRow: { paddingHorizontal: 16, gap: 8, marginTop: 12, marginBottom: 4 },
  trustBadge: { backgroundColor: '#F5F5F5', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
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
