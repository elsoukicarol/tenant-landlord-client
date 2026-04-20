import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { enUS, es as esLocale } from 'date-fns/locale';

import type { Language } from './i18n';

const locales = { es: esLocale, en: enUS };

/**
 * Normalize an incoming value (string | Date | null | undefined) to a Date,
 * or null if the input can't be parsed. Keeps UI paths crash-free when the
 * backend omits a timestamp or returns something unexpected.
 */
function toDate(input: string | Date | null | undefined): Date | null {
  if (input == null) return null;
  const date = typeof input === 'string' ? parseISO(input) : input;
  return isValid(date) ? date : null;
}

export function formatDate(
  iso: string | Date | null | undefined,
  pattern: string,
  language: Language = 'en',
): string {
  const date = toDate(iso);
  if (!date) return '';
  return format(date, pattern, { locale: locales[language] });
}

export function timeAgo(iso: string | Date | null | undefined, language: Language = 'en'): string {
  const date = toDate(iso);
  if (!date) return '';
  return formatDistanceToNow(date, { addSuffix: true, locale: locales[language] });
}

export function countdownSeconds(targetIso: string | null | undefined): number {
  const date = toDate(targetIso);
  if (!date) return 0;
  return Math.max(0, Math.floor((date.getTime() - Date.now()) / 1000));
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
