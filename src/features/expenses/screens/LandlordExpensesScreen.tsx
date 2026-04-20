import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { Card, Chip, EmptyState, Screen, Text } from '@/components/ui';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { useBuildingList } from '@/features/buildings/api';
import { formatCurrency } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { LandlordExpensesStackParamList } from '@/navigation/types';
import { color } from '@/theme';

import { useExpenseList, useExpenseSummary } from '../api';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { ExpenseRow } from '../components/ExpenseRow';

type Nav = NavigationProp<LandlordExpensesStackParamList>;

export function LandlordExpensesScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(selectUser);
  const locale = user?.language ?? 'en';
  const [buildingId, setBuildingId] = useState<string | null>(null);

  const { from, to } = useMemo(() => monthRange(), []);
  const buildings = useBuildingList();
  const buildingList = buildings.data?.pages.flatMap((p) => p.data) ?? [];

  const params = buildingId ? { buildingId } : {};
  const list = useExpenseList(params);
  const summary = useExpenseSummary(from, to, buildingId ?? undefined);

  const items = list.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <Screen>
      <Text variant="display/screen-title" style={{ marginBottom: 12 }}>
        {t('expenses.title')}
      </Text>

      {buildingList.length > 1 ? (
        <FlatList
          data={buildingList}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ gap: 8, paddingVertical: 4, paddingRight: 20 }}
          style={{
            marginHorizontal: -20,
            paddingHorizontal: 20,
            marginBottom: 12,
            flexGrow: 0,
          }}
          ListHeaderComponent={
            <Chip
              label={t('requests.allBuildings')}
              selected={buildingId === null}
              onPress={() => setBuildingId(null)}
            />
          }
          renderItem={({ item }) => (
            <Chip
              label={item.name}
              selected={buildingId === item.id}
              onPress={() => setBuildingId(item.id)}
            />
          )}
        />
      ) : null}

      <Card elevated style={{ gap: 6, marginBottom: 16 }}>
        <Text variant="mono/label">{t('expenses.thisMonth')}</Text>
        <Text variant="display/stat-medium">
          {summary.isLoading ? '…' : formatCurrency(summary.data?.totalAmount ?? 0, locale)}
        </Text>
        {summary.data?.entryCount !== undefined ? (
          <Text variant="ui/caption">
            {t('expenses.entriesCount', { count: summary.data.entryCount })}
          </Text>
        ) : null}
      </Card>

      {summary.data ? (
        <View style={{ marginBottom: 16 }}>
          <CategoryBreakdown summary={summary.data} locale={locale} />
        </View>
      ) : null}

      {list.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState title={t('expenses.emptyLandlord')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
          onEndReached={() => list.hasNextPage && list.fetchNextPage()}
          onEndReachedThreshold={0.3}
          onRefresh={() => list.refetch()}
          refreshing={list.isRefetching && !list.isFetchingNextPage}
          renderItem={({ item }) => (
            <ExpenseRow
              expense={item}
              locale={locale}
              onPress={() => navigation.navigate('LandlordExpenseDetail', { id: item.id })}
            />
          )}
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
