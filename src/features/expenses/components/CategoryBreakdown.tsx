import { View } from 'react-native';

import { Text } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

import type { ExpenseSummary } from '../types';

export function CategoryBreakdown({
  summary,
  locale = 'es',
}: {
  summary: ExpenseSummary;
  locale?: 'es' | 'en';
}) {
  const entries = Object.entries(summary.byCategory).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  const max = Math.max(...entries.map(([, v]) => v ?? 0), 1);

  if (entries.length === 0) return null;

  return (
    <View style={{ gap: 10 }}>
      <Text variant="eyebrow">{t('expenses.byCategory')}</Text>
      {entries.map(([cat, amount]) => (
        <View key={cat} style={{ gap: 4 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="ui/label">{t(`requests.category.${cat}`)}</Text>
            <Text variant="ui/label-strong">{formatCurrency(amount ?? 0, locale)}</Text>
          </View>
          <View
            style={{
              height: 4,
              backgroundColor: color.lineSoft,
              borderRadius: radius.pill,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${((amount ?? 0) / max) * 100}%`,
                height: '100%',
                backgroundColor: color.accent,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
