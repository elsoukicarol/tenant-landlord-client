import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { Button, Card, EmptyState, Screen, Text } from '@/components/ui';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { formatCurrency } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { MaintainerExpensesStackParamList } from '@/navigation/types';
import { color } from '@/theme';

import { useExpenseList, useExpenseSummary } from '../api';
import { ExpenseRow } from '../components/ExpenseRow';

type Nav = NativeStackNavigationProp<MaintainerExpensesStackParamList, 'MaintainerExpensesList'>;

export function ExpensesListScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(selectUser);
  const locale = user?.language ?? 'es';

  const { from, to } = useMemo(() => monthRange(), []);

  const list = useExpenseList();
  const summary = useExpenseSummary(from, to);

  const items = list.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text variant="display/screen-title">{t('expenses.title')}</Text>
        <Button
          label={t('expenses.new')}
          size="md"
          onPress={() => navigation.navigate('MaintainerCreateExpense')}
        />
      </View>

      <Card elevated style={{ gap: 6, marginBottom: 16 }}>
        <Text variant="mono/label">{t('expenses.thisMonth')}</Text>
        <Text variant="display/stat-medium">
          {summary.isLoading ? '…' : formatCurrency(summary.data?.totalExpenses ?? 0, locale)}
        </Text>
        {summary.data?.count !== undefined ? (
          <Text variant="ui/caption">
            {t('expenses.entriesCount', { count: summary.data.count })}
          </Text>
        ) : null}
      </Card>

      {list.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title={t('expenses.empty')}
          action={
            <Button
              label={t('expenses.new')}
              onPress={() => navigation.navigate('MaintainerCreateExpense')}
            />
          }
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
          onEndReached={() => list.hasNextPage && list.fetchNextPage()}
          onEndReachedThreshold={0.3}
          onRefresh={() => list.refetch()}
          refreshing={list.isRefetching && !list.isFetchingNextPage}
          renderItem={({ item }) => <ExpenseRow expense={item} locale={locale} />}
        />
      )}
    </Screen>
  );
}

function monthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: ymd(from), to: ymd(to) };
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
