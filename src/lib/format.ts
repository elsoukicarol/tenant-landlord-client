import type { Language } from './i18n';

export function formatCurrency(
  amount: number,
  language: Language = 'en',
  currency = 'EUR',
): string {
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, language: Language = 'en'): string {
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US').format(value);
}

export const PLACEHOLDER = '—';
