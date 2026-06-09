import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { TRANSLATIONS, type LangCode, type TranslationKey } from './translations';

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
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

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
