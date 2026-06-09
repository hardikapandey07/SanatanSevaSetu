import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageContext';
import type { LangCode } from '@/i18n/translations';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  selectedBg: '#FFF1DE',
};

const LANGUAGES: { code: LangCode; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English',  nativeName: 'English' },
  { code: 'hi', name: 'Hindi',    nativeName: 'हिंदी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi',  nativeName: 'मराठी' },
];

export default function LanguageSettingsScreen() {
  const { lang, setLang, t } = useLanguage();
  const [pendingLang, setPendingLang] = useState<LangCode | null>(null);

  const pendingInfo = LANGUAGES.find(l => l.code === pendingLang);

  const handleSelect = (code: LangCode) => {
    if (code === lang) return;   // already selected — do nothing
    setPendingLang(code);        // open confirmation modal
  };

  const handleConfirm = () => {
    if (pendingLang) setLang(pendingLang);
    setPendingLang(null);
  };

  const handleCancel = () => setPendingLang(null);

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
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
          <ThemedText style={styles.headerTitle}>{t('languageSettings')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Language list ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <View style={styles.descriptionSection}>
          <ThemedText style={styles.description}>{t('chooseLanguagePrompt')}</ThemedText>
        </View>

        <View style={styles.languagesGrid}>
          {LANGUAGES.map(lng => {
            const selected = lang === lng.code;
            return (
              <Pressable
                key={lng.code}
                onPress={() => handleSelect(lng.code)}
                style={({ pressed }) => [
                  styles.languageCard,
                  selected && styles.languageCardSelected,
                  pressed && styles.pressed,
                ]}>
                {/* Radio circle */}
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                  {selected && <View style={styles.radioInner} />}
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.languageName, selected && styles.languageNameSelected]}>
                    {lng.name}
                  </ThemedText>
                  <ThemedText style={styles.languageNativeName}>{lng.nativeName}</ThemedText>
                </View>

                {selected && (
                  <SymbolView
                    name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                    tintColor={BRAND.primary}
                    size={22}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.infoTitle}>{t('languageInfo')}</ThemedText>
          <ThemedText style={styles.infoText}>
            Your selected language preference will be saved and applied across the entire app.
          </ThemedText>
        </View>
      </ScrollView>

      {/* ── Confirmation Modal ── */}
      <Modal
        visible={pendingLang !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* Icon */}
            <View style={styles.modalIconWrap}>
              <SymbolView
                name={{ ios: 'character.bubble.fill', android: 'translate', web: 'translate' }}
                tintColor={BRAND.primary}
                size={32}
              />
            </View>

            <ThemedText style={styles.modalTitle}>{t('langChangeTitle')}</ThemedText>
            <ThemedText style={styles.modalMsg}>{t('langChangeMsg')}</ThemedText>

            {/* Language name highlight */}
            {pendingInfo && (
              <View style={styles.modalLangBadge}>
                <ThemedText style={styles.modalLangName}>{pendingInfo.name}</ThemedText>
                <ThemedText style={styles.modalLangNative}>{pendingInfo.nativeName}</ThemedText>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.modalBtns}>
              <Pressable
                onPress={handleCancel}
                style={({ pressed }) => [styles.modalBtnCancel, pressed && styles.pressed]}>
                <ThemedText style={styles.modalBtnCancelText}>{t('langCancel')}</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={({ pressed }) => [styles.modalBtnConfirm, pressed && styles.pressed]}>
                <ThemedText style={styles.modalBtnConfirmText}>{t('langYes')}</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', flex: 1 },

  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },

  descriptionSection: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: Spacing.three,
  },
  description: { fontSize: 14, fontWeight: '600', color: BRAND.text, textAlign: 'center' },

  languagesGrid: { gap: 12 },

  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.card,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  languageCardSelected: {
    borderColor: BRAND.primary,
    backgroundColor: BRAND.selectedBg,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: BRAND.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: BRAND.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND.primary,
  },

  languageName: { fontSize: 16, fontWeight: '700', color: BRAND.text },
  languageNameSelected: { color: BRAND.primary },
  languageNativeName: { fontSize: 13, color: BRAND.textSecondary, marginTop: 2 },

  infoSection: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: Spacing.three,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: BRAND.text, marginBottom: 8 },
  infoText: { fontSize: 13, color: BRAND.textSecondary, lineHeight: 18 },

  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 16,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BRAND.selectedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: BRAND.text, textAlign: 'center' },
  modalMsg: { fontSize: 14, color: BRAND.textSecondary, textAlign: 'center', lineHeight: 20 },
  modalLangBadge: {
    alignItems: 'center',
    backgroundColor: BRAND.selectedBg,
    borderWidth: 1,
    borderColor: BRAND.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginVertical: 4,
  },
  modalLangName: { fontSize: 16, fontWeight: '800', color: BRAND.primary },
  modalLangNative: { fontSize: 13, color: BRAND.primaryDark, marginTop: 2 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    alignItems: 'center',
  },
  modalBtnCancelText: { fontSize: 15, fontWeight: '700', color: BRAND.textSecondary },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
  },
  modalBtnConfirmText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  pressed: { opacity: 0.82 },
});
