import type { Language } from './i18n';

export function formatCurrency(
  amount: number,
  language: Language = 'es',
  currency = 'EUR',
): string {
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, language: Language = 'es'): string {
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US').format(value);
}

export const PLACEHOLDER = '—';
