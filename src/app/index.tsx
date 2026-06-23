import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { LANGUAGES, type Language } from '@/constants/languages';
import { Spacing } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageContext';
import type { LangCode } from '@/i18n/translations';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  cream: '#FFF6E9',
  bg: '#FFFFFF',
  card: '#FFFFFF',
  border: '#EDE3D2',
  borderActive: '#E8731C',
  rowSelectedBg: '#FFF1DE',
  text: '#1F1A14',
  textSecondary: '#6B6258',
};

export default function LanguageScreen() {
  const { lang, setLang, t } = useLanguage();
  const [selected, setSelected] = useState<LangCode>(lang);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setSelected(lang);
  }, [lang]);

  const currentLang = LANGUAGES.find(l => l.code === selected) ?? LANGUAGES[0];

  const handleContinue = async () => {
    await setLang(selected);
    router.push('/register');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <Image
              source={require('@/assets/images/logo1.jpg')}
              style={styles.logo}
              contentFit="contain"
              transition={200}
            />
          </View>

          <ThemedText style={styles.title}>{t('chooseLanguage')}</ThemedText>
          <ThemedText style={styles.subtitle}>{t('chooseLanguagePrompt')}</ThemedText>
          <ThemedText style={styles.subtitleNative}>{t('chooseLanguagePromptNative')}</ThemedText>

          <View style={styles.dropdownWrap}>
            <Pressable
              onPress={() => setOpen(o => !o)}
              style={({ pressed }) => [
                styles.trigger,
                open && styles.triggerOpen,
                pressed && styles.pressed,
              ]}>
              <View style={styles.triggerText}>
                <ThemedText style={styles.triggerNative}>{currentLang.nativeName}</ThemedText>
                <ThemedText style={styles.triggerEnglish}>{currentLang.englishName}</ThemedText>
              </View>
              <SymbolView
                name={
                  open
                    ? { ios: 'chevron.up', android: 'expand_less', web: 'expand_less' }
                    : { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }
                }
                tintColor={BRAND.primary}
                size={18}
              />
            </Pressable>

            {open && (
              <View style={styles.menu}>
                <ScrollView style={styles.menuScroll} nestedScrollEnabled>
                  {LANGUAGES.map((l, i) => (
                    <Row
                      key={l.code}
                      lang={l}
                      selected={selected === l.code}
                      isLast={i === LANGUAGES.length - 1}
                      onPress={() => {
                        setSelected(l.code as LangCode);
                        setOpen(false);
                      }}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
          <LinearGradient
            colors={[BRAND.primary, BRAND.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}>
            <ThemedText style={styles.ctaText}>{t('continue')}</ThemedText>
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function Row({
  lang,
  selected,
  isLast,
  onPress,
}: {
  lang: Language;
  selected: boolean;
  isLast: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        !isLast && styles.rowDivider,
        pressed && styles.pressed,
      ]}>
      <ThemedText style={[styles.rowEnglish, selected && styles.rowEnglishSelected]}>
        {lang.englishName}
      </ThemedText>
      <ThemedText style={styles.rowNative}>{lang.nativeName}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    alignItems: 'center',
  },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  logo: { width: '92%', height: '92%' },
  title: { fontSize: 22, fontWeight: '700', color: BRAND.text, textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    color: BRAND.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitleNative: {
    fontSize: 14,
    color: BRAND.text,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 2,
  },
  dropdownWrap: {
    width: '100%',
    marginTop: Spacing.four,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.card,
    borderWidth: 1.5,
    borderColor: BRAND.borderActive,
    borderRadius: 14,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: 64,
  },
  triggerOpen: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  triggerText: { flex: 1 },
  triggerNative: { fontSize: 16, fontWeight: '600', color: BRAND.text },
  triggerEnglish: { fontSize: 13, color: BRAND.textSecondary, marginTop: 2 },
  menu: {
    marginTop: Spacing.two,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  menuScroll: { maxHeight: 240 },
  row: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: 60,
    justifyContent: 'center',
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#F3EAD7' },
  rowSelected: { backgroundColor: BRAND.rowSelectedBg },
  rowEnglish: { fontSize: 15, fontWeight: '600', color: BRAND.text },
  rowEnglishSelected: { color: BRAND.primary },
  rowNative: { fontSize: 13, color: BRAND.textSecondary, marginTop: 2 },
  pressed: { opacity: 0.85 },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    backgroundColor: BRAND.bg,
  },
  cta: { borderRadius: 14, overflow: 'hidden' },
  ctaPressed: { opacity: 0.9 },
  ctaGradient: { paddingVertical: Spacing.three, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
