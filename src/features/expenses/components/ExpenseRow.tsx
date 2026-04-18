import { Pressable, View } from 'react-native';

import { Card, Pill, Text } from '@/components/ui';
import { formatDate } from '@/lib/date';
import { formatCurrency } from '@/lib/format';
import { t } from '@/lib/i18n';

import type { ExpenseListItem } from '../types';

export function ExpenseRow({
  expense,
  onPress,
  locale = 'es',
}: {
  expense: ExpenseListItem;
  onPress?: () => void;
  locale?: 'es' | 'en';
}) {
  const body = (
    <Card style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text variant="mono/label">{formatDate(expense.date, 'PP', locale)}</Text>
        <Text variant="display/stat-small">{formatCurrency(expense.amount, locale)}</Text>
      </View>
      <Text variant="body/default">{expense.description}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Pill label={t(`requests.category.${expense.category}`)} />
        {expense.building ? <Text variant="ui/caption">{expense.building.name}</Text> : null}
      </View>
    </Card>
  );

  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={expense.description}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {body}
    </Pressable>
  );
}
