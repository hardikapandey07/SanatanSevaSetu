import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { MessageModal } from '@/components/message-modal';
import { Spacing } from '@/constants/theme';
import { ApiService } from '@/constants/api';
import { useT } from '@/i18n/LanguageContext';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E6DCC8',
  borderFocus: '#E8731C',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  label: '#3F2A1B',
  inputBg: '#FFFFFF',
  shadow: '#000',
  loginCard: '#FFF8F0',
  loginBorder: '#C084FC',
};

export default function RegisterScreen() {
  const t = useT();
  const router = useRouter();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [referral, setReferral] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const isLogin = mode === 'login';
  const mobileValid = mobile.length === 10 && /^[6-9]\d{9}$/.test(mobile);
  const nameValid = isLogin || name.trim().length >= 1;
  const canSendOtp = mobileValid && nameValid && !loading;

  const switchMode = (next: 'register' | 'login') => {
    setMode(next);
    setName('');
    setMobile('');
    setReferral('');
  };

  const showModal = (title: string, message: string, type: 'success' | 'error') => {
    setModalData({ title, message, type });
    setModalVisible(true);
  };

  const handleSendOtp = async () => {
    if (!canSendOtp) return;
    
    setLoading(true);
    try {
      const result = await ApiService.sendOtp(mobile);
      
      if (result.success) {
        showModal('Success', result.message, 'success');
        setTimeout(() => {
          setModalVisible(false);
          router.push({ 
            pathname: '/otp-verification', 
            params: { 
              mobile,
              name: isLogin ? '' : name.trim(),
              referral: isLogin ? null : (referral.trim() || null),
              mode: isLogin ? 'login' : 'register',
            }
          });
        }, 2000);
      } else {
        showModal('Error', result.message, 'error');
      }
    } catch (error) {
      showModal('Error', 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <View style={styles.logoWrap}>
              <Image
                source={require('@/assets/images/logo1.jpg')}
                style={styles.logo}
                contentFit="contain"
                transition={200}
              />
            </View>
            <View style={styles.headerText}>
              <ThemedText style={styles.title}>{t('registerTitle')}</ThemedText>
              <ThemedText style={styles.subtitle}>{t('registerSubtitle')}</ThemedText>
            </View>
          </View>

          {/* Section heading with orange left bar */}
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionBar} />
            <ThemedText style={styles.sectionHeading}>
              {isLogin ? t('loginWithOtp') : t('newRegistration')}
            </ThemedText>
          </View>

          {!isLogin && (
            <Field label={`${t('name')} *`}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('namePlaceholder')}
                placeholderTextColor={BRAND.textSecondary}
                autoCapitalize="words"
                maxLength={60}
                style={styles.input}
              />
            </Field>
          )}

          <Field label={`${t('mobileNumber')} *`}>
            <View style={styles.mobileRow}>
              <View style={styles.dialCode}>
                <ThemedText style={styles.dialCodeText}>+91</ThemedText>
              </View>
              <View style={styles.mobileDivider} />
              <TextInput
                value={mobile}
                onChangeText={txt => setMobile(txt.replace(/\D/g, '').slice(0, 10))}
                placeholder={t('mobilePlaceholder')}
                placeholderTextColor={BRAND.textSecondary}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={10}
                style={[styles.input, styles.mobileInput]}
              />
            </View>
          </Field>

          {!isLogin && (
            <Field label={`${t('referralOptional')}`}>
              <TextInput
                value={referral}
                onChangeText={setReferral}
                placeholder={t('enterReferral')}
                placeholderTextColor={BRAND.textSecondary}
                autoCapitalize="characters"
                style={styles.input}
              />
            </Field>
          )}

          <Pressable
            onPress={handleSendOtp}
            disabled={!canSendOtp}
            style={({ pressed }) => [styles.cta, !canSendOtp && styles.ctaDisabled, pressed && canSendOtp && styles.ctaPressed]}>
            <LinearGradient
              colors={canSendOtp ? [BRAND.primary, BRAND.primaryDark] : ['#D0D0D0', '#B0B0B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}>
              <ThemedText style={styles.ctaText}>
                {loading ? t('sending') : t('sendOtp')}
              </ThemedText>
              {!loading && (
                <SymbolView
                  name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
                  tintColor="#FFFFFF"
                  size={16}
                />
              )}
            </LinearGradient>
          </Pressable>

          {/* OR divider + login/register toggle card */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <ThemedText style={styles.orText}>{t('or')}</ThemedText>
            <View style={styles.orLine} />
          </View>

          {isLogin ? (
            <Pressable
              onPress={() => switchMode('register')}
              style={({ pressed }) => [styles.toggleCard, pressed && styles.pressed]}>
              <View style={styles.toggleIconWrap}>
                <SymbolView
                  name={{ ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }}
                  tintColor={BRAND.primary}
                  size={22}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.toggleCardTitle}>{t('newUser')}</ThemedText>
                <ThemedText style={styles.toggleCardDesc}>{t('newUserDesc')}</ThemedText>
              </View>
              <Pressable
                onPress={() => switchMode('register')}
                style={({ pressed }) => [styles.toggleBtn, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }}
                  tintColor={BRAND.primary}
                  size={14}
                />
                <ThemedText style={styles.toggleBtnText}>{t('registerNow')}</ThemedText>
              </Pressable>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => switchMode('login')}
              style={({ pressed }) => [styles.toggleCard, pressed && styles.pressed]}>
              <View style={styles.toggleIconWrap}>
                <SymbolView
                  name={{ ios: 'arrow.right.circle.fill', android: 'login', web: 'login' }}
                  tintColor={BRAND.primary}
                  size={22}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.toggleCardTitle}>{t('alreadyRegistered')}</ThemedText>
                <ThemedText style={styles.toggleCardDesc}>{t('alreadyRegisteredDesc')}</ThemedText>
              </View>
              <Pressable
                onPress={() => switchMode('login')}
                style={({ pressed }) => [styles.toggleBtn, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'arrow.right.circle', android: 'login', web: 'login' }}
                  tintColor={BRAND.primary}
                  size={14}
                />
                <ThemedText style={styles.toggleBtnText}>{t('loginWithOtp')}</ThemedText>
              </Pressable>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
      
      <MessageModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalData.title}
        message={modalData.message}
        type={modalData.type}
      />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <View style={styles.inputWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND.shadow,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  logo: { width: '92%', height: '92%' },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: BRAND.text },
  subtitle: { fontSize: 13, color: BRAND.textSecondary, marginTop: 2 },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  sectionBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: BRAND.primary,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: BRAND.text,
  },
  field: { marginTop: Spacing.three },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: BRAND.label,
    marginBottom: 6,
  },
  inputWrap: {
    backgroundColor: BRAND.inputBg,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 14,
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null),
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  dialCode: {
    paddingRight: 8,
    justifyContent: 'center',
  },
  dialCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND.text,
  },
  mobileDivider: {
    width: 1,
    height: 20,
    backgroundColor: BRAND.border,
    marginRight: 10,
  },
  mobileInput: { flex: 1 },
  input: {
    fontSize: 15,
    color: BRAND.text,
    height: '100%',
    width: '100%',
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null),
  },
  pressed: { opacity: 0.85 },
  cta: {
    marginTop: Spacing.four,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaPressed: { opacity: 0.9 },
  ctaDisabled: { opacity: 0.95 },
  ctaGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.three,
  },
  orLine: { flex: 1, height: 1, backgroundColor: '#EDE3D2' },
  orText: { fontSize: 12, fontWeight: '600', color: BRAND.textSecondary },

  toggleCard: {
    marginTop: Spacing.two,
    borderWidth: 1.5,
    borderColor: BRAND.loginBorder,
    borderRadius: 14,
    backgroundColor: BRAND.loginCard,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: BRAND.text,
  },
  toggleCardDesc: {
    fontSize: 11,
    color: BRAND.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.primary,
  },
});
