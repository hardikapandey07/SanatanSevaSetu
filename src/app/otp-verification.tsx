import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/LanguageContext';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#FFF6E9',
  card: '#FFFFFF',
  border: '#E6DCC8',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  inputBg: '#FFFFFF',
  buttonBg: '#D4C4A8',
};

const RESEND_SECONDS = 30;

export default function OtpVerificationScreen() {
  const t = useT();
  const params = useLocalSearchParams();
  const mobileNumber = (params.mobile as string) || '9253536663';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [remaining, setRemaining] = useState(RESEND_SECONDS);
  const [agreed, setAgreed] = useState(false);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const otpValue = otp.join('');
  const canVerify = otpValue.length === 6 && agreed;

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining(r => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const handleOtpChange = (value: string, index: number) => {
    const numValue = value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = numValue;
    setOtp(newOtp);

    // Auto-move to next field when digit is entered
    if (numValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    setRemaining(RESEND_SECONDS);
    setOtp(['', '', '', '', '', '']);
    otpInputRefs.current[0]?.focus();
  };

  const handleVerify = () => {
    if (!canVerify) return;
    router.replace('/(tabs)/home');
  };

  const maskedPhone = `+91 ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5)}`;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerSection}>
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image
              source={require('@/assets/images/logo.jpg')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <ThemedText style={styles.brandTitle}>{t('brand')}</ThemedText>
          <ThemedText style={styles.brandSubtitle}>{t('brandTagline')}</ThemedText>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.otpInfoRow}>
          <View style={styles.shieldIcon}>
            <SymbolView
              name={{ ios: 'shield.fill', android: 'security', web: 'security' }}
              tintColor={BRAND.primary}
              size={20}
            />
          </View>
          <View style={styles.otpInfo}>
            <ThemedText style={styles.otpSentText}>{t('otpSentTo')} {maskedPhone}</ThemedText>
            <Pressable>
              <ThemedText style={styles.changeNumberLink}>{t('changeNumber')}</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.otpSection}>
          <ThemedText style={styles.otpLabel}>{t('enterOtp')}</ThemedText>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  otpInputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={val => handleOtpChange(val, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                placeholderTextColor={BRAND.textSecondary}
              />
            ))}
          </View>
        </View>

        <View style={styles.resendSection}>
          <ThemedText style={styles.resendLabel}>
            {remaining > 0
              ? `${t('resendOtpInSeconds')} ${timerText}`
              : t('resendOtp')
            }
          </ThemedText>
          {remaining === 0 && (
            <Pressable onPress={handleResendOtp}>
              <ThemedText style={styles.resendButton}>{t('resendOtp')}</ThemedText>
            </Pressable>
          )}
        </View>

        <View style={styles.agreementRow}>
          <Pressable
            onPress={() => setAgreed(!agreed)}
            style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && (
              <SymbolView
                name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                tintColor={BRAND.primary}
                size={14}
              />
            )}
          </Pressable>
          <ThemedText style={styles.agreementText}>
            {t('iAgree')} <ThemedText style={styles.linkText}>{t('termsAndConditions')}</ThemedText> {t('and')}{' '}
            <ThemedText style={styles.linkText}>{t('privacyPolicy')}</ThemedText>
          </ThemedText>
        </View>

        <Pressable
          onPress={handleVerify}
          disabled={!canVerify}
          style={({ pressed }) => [
            styles.verifyBtn,
            !canVerify && styles.verifyBtnDisabled,
            pressed && canVerify && styles.verifyBtnPressed,
          ]}>
          <ThemedText style={styles.verifyBtnText}>
            {t('verifyContinue')} <ThemedText style={styles.arrow}>→</ThemedText>
          </ThemedText>
        </Pressable>

        <ThemedText style={styles.sanskritFooter}>{t('sanskritFooter')}</ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  headerSection: { backgroundColor: BRAND.bg },
  header: { alignItems: 'center', paddingVertical: Spacing.four, paddingHorizontal: Spacing.three },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  logo: { width: '85%', height: '85%' },
  brandTitle: { fontSize: 20, fontWeight: '800', color: BRAND.primary, marginBottom: 4 },
  brandSubtitle: { fontSize: 13, color: BRAND.textSecondary, textAlign: 'center' },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  otpInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: Spacing.four,
  },
  shieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(232, 115, 28, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  otpInfo: { flex: 1 },
  otpSentText: { fontSize: 14, fontWeight: '600', color: BRAND.text, marginBottom: 6 },
  changeNumberLink: { fontSize: 13, fontWeight: '600', color: BRAND.primary },
  otpSection: { marginBottom: Spacing.three, gap: 12 },
  otpLabel: { fontSize: 14, fontWeight: '600', color: BRAND.text },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.two,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: BRAND.border,
    borderRadius: 12,
    backgroundColor: BRAND.inputBg,
    fontSize: 18,
    fontWeight: '700',
    color: BRAND.text,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: BRAND.primary,
    backgroundColor: 'rgba(232, 115, 28, 0.05)',
  },
  resendSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: Spacing.four,
  },
  resendLabel: { fontSize: 13, color: BRAND.textSecondary },
  resendButton: { fontSize: 13, fontWeight: '600', color: BRAND.primary },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: Spacing.four,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: BRAND.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: 'rgba(232, 115, 28, 0.1)',
    borderColor: BRAND.primary,
  },
  agreementText: { flex: 1, fontSize: 13, color: BRAND.text, lineHeight: 18 },
  linkText: { color: BRAND.primary, fontWeight: '600' },
  verifyBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.three,
    backgroundColor: BRAND.buttonBg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnDisabled: { opacity: 0.5 },
  verifyBtnPressed: { opacity: 0.85 },
  verifyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  arrow: { marginLeft: 8 },
  sanskritFooter: {
    fontSize: 12,
    color: BRAND.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  pressed: { opacity: 0.9 },
});
