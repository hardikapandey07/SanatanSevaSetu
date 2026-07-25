import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ApiService } from '@/constants/api';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/LanguageContext';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  inputBorder: '#E5DCC8',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  disabledBg: '#CFC4B0',
  iconBg: '#FFE7CF',
  successBg: '#F0FFF4',
  successText: '#16A34A',
};

export default function SuggestionScreen() {
  const t = useT();
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [contact, setContact] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canSubmit = name.trim().length > 0 && comment.trim().length > 0;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSending(true);
    setErrorMsg('');
    const result = await ApiService.submitContact({
      Name: name.trim(),
      Email: email.trim() || '',
      Phone: contact.trim() || '',
      Subject: 'Suggestion from Sanatan Seva Setu App',
      Message: comment.trim(),
    });
    setSending(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setErrorMsg(result.message);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.root, styles.successRoot]}>
        <View style={styles.successIconWrap}>
          <SymbolView
            name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
            tintColor={BRAND.successText}
            size={56}
          />
        </View>
        <ThemedText style={styles.successTitle}>{t('suggestionThanksTitle')}</ThemedText>
        <ThemedText style={styles.successMsg}>{t('suggestionThanksMsg')}</ThemedText>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backHomeBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.backHomeBtnText}>Back to Profile</ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
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
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.headerTitle}>{t('suggestionTitle')}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{t('suggestionNative')}</ThemedText>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

<View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconWrap}>
                <SymbolView
                  name={{ ios: 'bubble.left.fill', android: 'chat', web: 'chat' }}
                  tintColor={BRAND.primary}
                  size={20}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.cardTitle}>{t('shareYourSuggestions')}</ThemedText>
                <ThemedText style={styles.cardSubtitle}>{t('helpUsImproveServices')}</ThemedText>
              </View>
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>{t('name')} *</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('namePlaceholder')}
                placeholderTextColor={BRAND.textSecondary}
                style={[styles.input, Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Email (Optional)</ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={BRAND.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>{t('contactNumber')} (Optional)</ThemedText>
              <TextInput
                value={contact}
                onChangeText={setContact}
                placeholder={t('contactNumberPlaceholder')}
                placeholderTextColor={BRAND.textSecondary}
                keyboardType="phone-pad"
                style={[styles.input, Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>{t('suggestionComment')} *</ThemedText>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder={t('suggestionPlaceholder')}
                placeholderTextColor={BRAND.textSecondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={[styles.input, styles.textarea,
                  Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null,
                ]}
              />
            </View>

            {!!errorMsg && (
              <View style={styles.errorBanner}>
                <ThemedText style={styles.errorBannerText}>{errorMsg}</ThemedText>
              </View>
            )}

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit || sending}
              style={({ pressed }) => [
                styles.submitBtn,
                (!canSubmit || sending) && styles.submitBtnDisabled,
                pressed && canSubmit && !sending && styles.pressed,
              ]}>
              <SymbolView
                name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }}
                tintColor="#FFFFFF"
                size={16}
              />
              <ThemedText style={styles.submitBtnText}>
                {sending ? 'Sending...' : t('submitSuggestion')}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  successRoot: { alignItems: 'center', justifyContent: 'center', padding: Spacing.five, gap: 16 },
  successIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: BRAND.successBg,
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 22, fontWeight: '800', color: BRAND.text, textAlign: 'center' },
  successMsg: { fontSize: 14, color: BRAND.textSecondary, textAlign: 'center', lineHeight: 20 },
  successEmail: { fontSize: 13, color: BRAND.primary, fontWeight: '700' },
  backHomeBtn: {
    marginTop: 8, backgroundColor: BRAND.primary,
    borderRadius: 12, paddingHorizontal: 32, paddingVertical: 13,
  },
  backHomeBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  header: { paddingBottom: Spacing.three },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: 12 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#FFE7CF', marginTop: 2 },

scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.two },

  card: { backgroundColor: BRAND.card, borderWidth: 1, borderColor: BRAND.border, borderRadius: 14, padding: 16, gap: 14 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: BRAND.iconBg, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },
  cardSubtitle: { fontSize: 12, color: BRAND.textSecondary, marginTop: 2 },

  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: BRAND.text },
  input: {
    borderWidth: 1, borderColor: BRAND.inputBorder,
    borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14, color: BRAND.text, backgroundColor: BRAND.card,
  },
  textarea: { minHeight: 110, paddingTop: 10 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 4, backgroundColor: BRAND.primary,
    borderRadius: 12, paddingVertical: 14,
  },
  submitBtnDisabled: { backgroundColor: BRAND.disabledBg },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
  },
  errorBannerText: { fontSize: 13, color: '#DC2626', fontWeight: '600' },

  pressed: { opacity: 0.9 },
});
