import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { TRANSLATIONS, type LangCode, type TranslationKey } from './translations';
import { translateText, translateBatch, clearTranslateCache } from './translate';
import { setApiLang } from '@/constants/api';

const STORAGE_KEY = 'sss.lang';
const DEFAULT_LANG: LangCode = 'en';

type LanguageContextValue = {
  lang: LangCode;
  setLang: (lang: LangCode) => Promise<void>;
  t: (key: TranslationKey) => string;
  ready: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && saved in TRANSLATIONS) {
          setLangState(saved as LangCode);
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  const setLang = useCallback(async (next: LangCode) => {
    setLangState(next);
    setApiLang(next);
    clearTranslateCache();
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  // Sync API lang on initial load
  useEffect(() => { setApiLang(lang); }, [lang]);

  const t = useCallback(
    (key: TranslationKey) => TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key,
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t, ready }), [lang, setLang, t, ready]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}

export function useT() {
  return useLanguage().t;
}

/**
 * Translates a single dynamic string (API data) to the current language.
 * Returns the original text immediately, then updates once translation arrives.
 * Usage: const label = useTranslated(item.name);
 */
export function useTranslated(text: string | null | undefined): string {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState<string>(text ?? '');

  useEffect(() => {
    if (!text) { setTranslated(''); return; }
    setTranslated(text); // show original immediately
    if (lang === 'en') return;
    translateText(text, lang).then(setTranslated);
  }, [text, lang]);

  return translated;
}

/**
 * Translates a list of objects by specified keys in one batch call.
 * Usage: const translated = useTranslatedList(items, ['title', 'body']);
 */
export function useTranslatedList<T extends Record<string, any>>(
  items: T[],
  keys: (keyof T)[],
): T[] {
  const { lang } = useLanguage();
  const [results, setResults] = useState<T[]>(items);

  useEffect(() => {
    setResults(items);
    if (lang === 'en' || !items.length) return;
    const allTexts = items.flatMap(item => keys.map(k => String(item[k] ?? '')));
    translateBatch(allTexts, lang).then(translated => {
      const out = items.map((item, i) => {
        const copy = { ...item };
        keys.forEach((k, ki) => { copy[k as string] = translated[i * keys.length + ki] as any; });
        return copy;
      });
      setResults(out);
    });
  }, [items.map(i => keys.map(k => i[k]).join('|')).join('||'), lang]);

  return results;
}

/**
 * Translates multiple dynamic strings in one batch call.
 * Usage: const [name, desc] = useTranslatedBatch([item.name, item.description]);
 */
export function useTranslatedBatch(texts: (string | null | undefined)[]): string[] {
  const { lang } = useLanguage();
  const safeTexts = texts.map(t => t ?? '');
  const [results, setResults] = useState<string[]>(safeTexts);

  useEffect(() => {
    setResults(safeTexts); // show originals immediately
    if (lang === 'en') return;
    const nonEmpty = safeTexts.filter(Boolean);
    if (!nonEmpty.length) return;
    translateBatch(safeTexts, lang).then(setResults);
  }, [texts.join('||'), lang]);

  return results;
}
