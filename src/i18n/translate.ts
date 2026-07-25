import { ENV_CONFIG } from '@/constants/environment';

// In-memory cache: "text||targetLang" -> translated string
const cache = new Map<string, string>();

function cacheKey(text: string, target: string) {
  return `${target}||${text}`;
}

/**
 * Translate a single string via Google Translate REST API.
 * Returns the original text if lang is 'en', key is missing, or request fails.
 */
export async function translateText(text: string, target: string): Promise<string> {
  if (!text?.trim() || target === 'en') return text;

  const key = cacheKey(text, target);
  if (cache.has(key)) return cache.get(key)!;

  const apiKey = ENV_CONFIG.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return text;

  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target, source: 'en', format: 'text' }),
      }
    );
    if (!res.ok) return text;
    const data = await res.json();
    const translated: string = data?.data?.translations?.[0]?.translatedText ?? text;
    cache.set(key, translated);
    return translated;
  } catch {
    return text;
  }
}

/**
 * Translate multiple strings in one API call (batch).
 * Returns array in same order as input.
 */
export async function translateBatch(texts: string[], target: string): Promise<string[]> {
  if (!texts.length || target === 'en') return texts;

  const apiKey = ENV_CONFIG.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return texts;

  // Split into cached vs uncached
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];
  const results = texts.map((t, i) => {
    const k = cacheKey(t, target);
    if (cache.has(k)) return cache.get(k)!;
    uncachedIndices.push(i);
    uncachedTexts.push(t);
    return t; // placeholder
  });

  if (!uncachedTexts.length) return results;

  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: uncachedTexts, target, source: 'en', format: 'text' }),
      }
    );
    if (!res.ok) return results;
    const data = await res.json();
    const translations: { translatedText: string }[] = data?.data?.translations ?? [];
    translations.forEach((tr, idx) => {
      const origIdx = uncachedIndices[idx];
      const translated = tr.translatedText ?? texts[origIdx];
      cache.set(cacheKey(texts[origIdx], target), translated);
      results[origIdx] = translated;
    });
  } catch {}

  return results;
}

/** Clear the translation cache (e.g. on lang change) */
export function clearTranslateCache() {
  cache.clear();
}
