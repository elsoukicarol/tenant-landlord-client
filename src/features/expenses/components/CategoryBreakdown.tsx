import { View } from 'react-native';

import { Text } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

import type { ExpenseSummary } from '../types';

export function CategoryBreakdown({
  summary,
  locale = 'en',
}: {
  summary: ExpenseSummary;
  locale?: 'es' | 'en';
}) {
  const entries = [...summary.byCategory].sort((a, b) => b.amount - a.amount);
  const max = Math.max(...entries.map((e) => e.amount), 1);

  if (entries.length === 0) return null;

  return (
    <View style={{ gap: 10 }}>
      <Text variant="eyebrow">{t('expenses.byCategory')}</Text>
      {entries.map((entry) => (
        <View key={entry.category} style={{ gap: 4 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="ui/label">{t(`requests.category.${entry.category}`)}</Text>
            <Text variant="ui/label-strong">{formatCurrency(entry.amount, locale)}</Text>
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
                width: `${(entry.amount / max) * 100}%`,
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
