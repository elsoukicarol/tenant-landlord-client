import { I18n } from 'i18n-js';

import en from '@/locales/en.json';
import es from '@/locales/es.json';

export const i18n = new I18n(
  { es, en },
  {
    locale: 'en',
    defaultLocale: 'en',
    enableFallback: true,
    missingBehavior: 'guess',
  },
);

export type Language = 'es' | 'en';

export function setLanguage(language: Language): void {
  i18n.locale = language;
}

export function t(key: string, options?: Record<string, string | number>): string {
  return i18n.t(key, options);
}
