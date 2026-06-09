export type Language = {
  code: string;
  nativeName: string;
  englishName: string;
};

export const LANGUAGES: Language[] = [
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi' },
];

export const LANGUAGE_LABEL: Record<string, string> = {
  en: 'EN',
  hi: 'हि',
  gu: 'ગુ',
  mr: 'म',
};
