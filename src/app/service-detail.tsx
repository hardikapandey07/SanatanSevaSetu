import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { TokenManager } from '@/constants/api';
import { getApiBaseUrl } from '@/constants/environment';
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
  inputBorder: '#E5DCC8',
  selectedBg: '#FFF1DE',
  disabledBg: '#CFC4B0',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  'Pooja Packages': '🪔',
  'Live Streaming': '📺',
};

const CATEGORY_BENEFITS: Record<string, string[]> = {
  'Pooja Packages': [
    'Experienced & verified Pandit',
    'All puja samagri included',
    'Performed at your home or temple',
    'Certificate of completion provided',
    'Available on auspicious dates',
  ],
  'Live Streaming': [
    'HD live stream from temple',
    'Watch from anywhere',
    'Dedicated puja performed in your name',
    'Prasad delivery available',
    'Recording available after event',
  ],
};

export default function ServiceDetailScreen() {
  const t = useT();
  const params = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
    servicePrice: string;
    serviceCategory: string;
    serviceImage: string;
  }>();

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const imageUri = params.serviceImage ? `${getApiBaseUrl()}/${params.serviceImage}` : null;
  const emoji = CATEGORY_EMOJIS[params.serviceCategory] ?? '🙏';
  const benefits = CATEGORY_BENEFITS[params.serviceCategory] ?? [
    'Experienced & verified Pandit',
    'All puja samagri included',
    'Performed at your home or temple',
  ];
  const price = params.servicePrice ? Number(params.servicePrice) : 0;

  const handleBookService = async () => {
    const profile = await TokenManager.getUserProfile();
    // Check if address is missing (email is optional per requirement)
    const storedAddress = await getStoredAddress();
    if (!storedAddress) {
      setProfileModalVisible(true);
      return;
    }
    navigateToBooking();
  };

  const navigateToBooking = () => {
    router.push({
      pathname: '/book-pooja',
      params: { serviceId: params.serviceId },
    });
  };

  const handleSaveProfile = async () => {
    if (!address.trim()) return;
    setSaving(true);
    try {
      // Store address locally in AsyncStorage via TokenManager storage
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.multiSet([
        ['user_address', address.trim()],
        ['user_email', email.trim()],
      ]);
      setProfileModalVisible(false);
      navigateToBooking();
    } catch {
      // proceed anyway
      setProfileModalVisible(false);
      navigateToBooking();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              tintColor="#FFFFFF"
              size={18}
            />
          </Pressable>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {params.serviceName}
          </ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Service Image */}
        <View style={styles.serviceImgWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.serviceImg} contentFit="cover" />
          ) : (
            <View style={[styles.serviceImg, styles.serviceImgPlaceholder]}>
              <ThemedText style={styles.serviceEmoji}>{emoji}</ThemedText>
            </View>
          )}
          <View style={styles.categoryPill}>
            <ThemedText style={styles.categoryPillText}>{params.serviceCategory}</ThemedText>
          </View>
        </View>

        {/* Title + Price */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.serviceName}>{params.serviceName}</ThemedText>
            <View style={styles.priceBadge}>
              <ThemedText style={styles.priceText}>₹{price.toLocaleString()}</ThemedText>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <ThemedText style={styles.ratingEmoji}>⭐</ThemedText>
            <ThemedText style={styles.ratingText}>4.8 · 200+ bookings</ThemedText>
          </View>
        </View>

        {/* What's Included */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>What's Included</ThemedText>
          {benefits.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.benefitDot} />
              <ThemedText style={styles.benefitText}>{b}</ThemedText>
            </View>
          ))}
        </View>

        {/* How it works */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>How it Works</ThemedText>
          {['Book your preferred date & time', 'Pandit arrives at your location', 'Puja performed with full rituals', 'Receive blessings & prasad'].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <ThemedText style={styles.stepNumText}>{i + 1}</ThemedText>
              </View>
              <ThemedText style={styles.stepText}>{step}</ThemedText>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Book Service CTA */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.footerRow}>
          <View>
            <ThemedText style={styles.footerPriceLabel}>Total Price</ThemedText>
            <ThemedText style={styles.footerPrice}>₹{price.toLocaleString()}</ThemedText>
          </View>
          <Pressable
            onPress={handleBookService}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
            <LinearGradient
              colors={[BRAND.primary, BRAND.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}>
              <ThemedText style={styles.ctaText}>{t('bookService')}</ThemedText>
              <SymbolView
                name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
                tintColor="#FFFFFF"
                size={16}
              />
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Complete Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            {/* Handle bar */}
            <View style={styles.modalHandle} />

            <View style={styles.modalIconWrap}>
              <SymbolView
                name={{ ios: 'person.crop.circle.badge.plus', android: 'person_add', web: 'person_add' }}
                tintColor={BRAND.primary}
                size={32}
              />
            </View>

            <ThemedText style={styles.modalTitle}>Complete Your Profile</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Please add your address to proceed with booking. Email is optional.
            </ThemedText>

            <View style={styles.modalField}>
              <ThemedText style={styles.modalLabel}>Address *</ThemedText>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your full address"
                placeholderTextColor={BRAND.textSecondary}
                multiline
                numberOfLines={3}
                style={[styles.modalInput, styles.modalInputMultiline,
                  Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null
                ]}
              />
            </View>

            <View style={styles.modalField}>
              <ThemedText style={styles.modalLabel}>Email ID (Optional)</ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={BRAND.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.modalInput,
                  Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null
                ]}
              />
            </View>

            <View style={styles.modalBtns}>
              <Pressable
                onPress={() => setProfileModalVisible(false)}
                style={({ pressed }) => [styles.modalBtnCancel, pressed && styles.pressed]}>
                <ThemedText style={styles.modalBtnCancelText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveProfile}
                disabled={!address.trim() || saving}
                style={({ pressed }) => [
                  styles.modalBtnConfirm,
                  (!address.trim() || saving) && styles.modalBtnDisabled,
                  pressed && address.trim() && styles.pressed,
                ]}>
                <ThemedText style={styles.modalBtnConfirmText}>
                  {saving ? 'Saving...' : 'Save & Continue'}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

async function getStoredAddress(): Promise<string> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return (await AsyncStorage.getItem('user_address')) ?? '';
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  header: { paddingBottom: Spacing.three },
  headerInner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: 12,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#FFFFFF' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.five, gap: Spacing.three },

  serviceImgWrap: { position: 'relative' },
  serviceImg: { width: '100%', height: 240 },
  serviceImgPlaceholder: {
    backgroundColor: '#FDE2D0',
    alignItems: 'center', justifyContent: 'center',
  },
  serviceEmoji: { fontSize: 80 },
  categoryPill: {
    position: 'absolute', bottom: 12, left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
  },
  categoryPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1, borderColor: BRAND.border,
    borderRadius: 14, padding: Spacing.three,
    marginHorizontal: Spacing.three,
    gap: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  serviceName: { flex: 1, fontSize: 20, fontWeight: '800', color: BRAND.text },
  priceBadge: {
    backgroundColor: BRAND.selectedBg,
    borderWidth: 1, borderColor: BRAND.primary,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  priceText: { fontSize: 16, fontWeight: '800', color: BRAND.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingEmoji: { fontSize: 14 },
  ratingText: { fontSize: 13, color: BRAND.textSecondary, fontWeight: '600' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },

  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  benefitDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: BRAND.primary, marginTop: 5, flexShrink: 0,
  },
  benefitText: { flex: 1, fontSize: 14, color: BRAND.text, lineHeight: 20 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: BRAND.selectedBg,
    borderWidth: 1.5, borderColor: BRAND.primary,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNumText: { fontSize: 12, fontWeight: '800', color: BRAND.primary },
  stepText: { flex: 1, fontSize: 14, color: BRAND.text, lineHeight: 20, paddingTop: 3 },

  footer: {
    backgroundColor: BRAND.card,
    borderTopWidth: 1, borderTopColor: BRAND.border,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two, paddingBottom: Spacing.two,
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerPriceLabel: { fontSize: 12, color: BRAND.textSecondary },
  footerPrice: { fontSize: 20, fontWeight: '800', color: BRAND.primary },
  cta: { borderRadius: 12, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 14,
  },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  // Profile Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.four,
    gap: 14,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0D6C2',
    alignSelf: 'center', marginBottom: 4,
  },
  modalIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: BRAND.selectedBg,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: BRAND.text, textAlign: 'center' },
  modalSubtitle: { fontSize: 13, color: BRAND.textSecondary, textAlign: 'center', lineHeight: 18 },
  modalField: { gap: 6 },
  modalLabel: { fontSize: 13, fontWeight: '700', color: BRAND.text },
  modalInput: {
    borderWidth: 1.5, borderColor: BRAND.inputBorder,
    borderRadius: 10, paddingHorizontal: 12,
    height: 46, fontSize: 14, color: BRAND.text,
    backgroundColor: '#FFFFFF',
  },
  modalInputMultiline: {
    height: 80, paddingTop: 10, textAlignVertical: 'top',
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalBtnCancel: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: BRAND.border,
    alignItems: 'center',
  },
  modalBtnCancelText: { fontSize: 14, fontWeight: '700', color: BRAND.textSecondary },
  modalBtnConfirm: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    backgroundColor: BRAND.primary, alignItems: 'center',
  },
  modalBtnDisabled: { backgroundColor: BRAND.disabledBg },
  modalBtnConfirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  pressed: { opacity: 0.85 },
});
