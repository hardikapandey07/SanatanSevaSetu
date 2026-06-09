import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Alert,
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
};

export default function SuggestionScreen() {
  const t = useT();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [comment, setComment] = useState('');

  const canSubmit = name.trim().length > 0 && comment.trim().length > 0;

  const onSubmit = () => {
    if (!canSubmit) return;
    Alert.alert(t('suggestionThanksTitle'), t('suggestionThanksMsg'), [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

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
            accessibilityLabel="Back"
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                <ThemedText style={styles.cardSubtitle}>
                  {t('helpUsImproveServices')}
                </ThemedText>
              </View>
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>{t('name')}</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('namePlaceholder')}
                placeholderTextColor={BRAND.textSecondary}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>{t('contactNumber')}</ThemedText>
              <TextInput
                value={contact}
                onChangeText={setContact}
                placeholder={t('contactNumberPlaceholder')}
                placeholderTextColor={BRAND.textSecondary}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>{t('suggestionComment')}</ThemedText>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder={t('suggestionPlaceholder')}
                placeholderTextColor={BRAND.textSecondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={[styles.input, styles.textarea]}
              />
            </View>

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.submitBtn,
                !canSubmit && styles.submitBtnDisabled,
                pressed && canSubmit && styles.pressed,
              ]}>
              <ThemedText style={styles.submitBtnText}>{t('submitSuggestion')}</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.three },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#FFE7CF', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five },
  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: BRAND.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },
  cardSubtitle: { fontSize: 12, color: BRAND.textSecondary, marginTop: 2 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: BRAND.text },
  input: {
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: BRAND.text,
    backgroundColor: BRAND.card,
  },
  textarea: { minHeight: 110, paddingTop: 10 },
  submitBtn: {
    marginTop: 4,
    backgroundColor: BRAND.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: BRAND.disabledBg },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.9 },
});
