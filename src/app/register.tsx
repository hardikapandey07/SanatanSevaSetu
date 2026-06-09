import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
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
};

export default function RegisterScreen() {
  const t = useT();
  const router = useRouter();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [referral, setReferral] = useState('');

  const mobileValid = mobile.length === 10;
  const nameValid = name.trim().length >= 1;
  const canSendOtp = mobileValid && nameValid;

  const handleSendOtp = () => {
    if (!canSendOtp) return;
    router.push({ pathname: '/otp-verification', params: { mobile } });
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
                source={require('@/assets/images/logo.jpg')}
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

          <ThemedText style={styles.tagline}>{t('registerTagline')}</ThemedText>

          <Field label={t('name')}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('namePlaceholder')}
              placeholderTextColor={BRAND.textSecondary}
              autoCapitalize="words"
              style={styles.input}
            />
          </Field>

          <Field label={t('mobileNumber')}>
            <TextInput
              value={mobile}
              onChangeText={txt => setMobile(txt.replace(/\D/g, '').slice(0, 10))}
              placeholder={t('mobilePlaceholder')}
              placeholderTextColor={BRAND.textSecondary}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={10}
              style={styles.input}
            />
          </Field>

          <Field label={t('referralOptional')}>
            <TextInput
              value={referral}
              onChangeText={setReferral}
              placeholder={t('enterReferral')}
              placeholderTextColor={BRAND.textSecondary}
              autoCapitalize="characters"
              style={styles.input}
            />
          </Field>

          <Pressable
            onPress={handleSendOtp}
            disabled={!canSendOtp}
            style={({ pressed }) => [styles.cta, !canSendOtp && styles.ctaDisabled, pressed && canSendOtp && styles.ctaPressed]}>
            <LinearGradient
              colors={canSendOtp ? [BRAND.primary, BRAND.primaryDark] : ['#D0D0D0', '#B0B0B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}>
              <ThemedText style={styles.ctaText}>{t('sendOtp')}</ThemedText>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
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
  tagline: {
    fontSize: 14,
    color: BRAND.textSecondary,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
