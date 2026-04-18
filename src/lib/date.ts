import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { enUS, es as esLocale } from 'date-fns/locale';

import type { Language } from './i18n';

const locales = { es: esLocale, en: enUS };

export function formatDate(iso: string | Date, pattern: string, language: Language = 'es'): string {
  const date = typeof iso === 'string' ? parseISO(iso) : iso;
  return format(date, pattern, { locale: locales[language] });
}

export function timeAgo(iso: string | Date, language: Language = 'es'): string {
  const date = typeof iso === 'string' ? parseISO(iso) : iso;
  return formatDistanceToNow(date, { addSuffix: true, locale: locales[language] });
}

export function countdownSeconds(targetIso: string): number {
  const target = parseISO(targetIso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((target - now) / 1000));
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
