import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { Button, Chip, EmptyState, Screen, Text } from '@/components/ui';
import { t } from '@/lib/i18n';
import type { TenantRequestsStackParamList } from '@/navigation/types';
import { color } from '@/theme';

import { useRequestList } from '../api';
import { RequestCard } from '../components/RequestCard';
import { RequestCardSkeletonList } from '../components/RequestCardSkeleton';
import { REQUEST_STATUS, type RequestStatus } from '../types';

type Nav = NativeStackNavigationProp<TenantRequestsStackParamList, 'TenantRequestsList'>;

export function MyRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | null>(null);

  const list = useRequestList(statusFilter ? { status: statusFilter } : {});
  const items = list.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text variant="display/screen-title">{t('requests.title')}</Text>
        <Button
          label={t('requests.new')}
          size="md"
          onPress={() => navigation.navigate('TenantSubmitRequest')}
        />
      </View>

      <FlatList
        data={REQUEST_STATUS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s}
        contentContainerStyle={{ gap: 8, paddingVertical: 4, paddingRight: 20 }}
        style={{ marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 12, flexGrow: 0 }}
        ListHeaderComponent={
          <Chip
            label={t('requests.filterAll')}
            selected={statusFilter === null}
            onPress={() => setStatusFilter(null)}
          />
        }
        renderItem={({ item: s }) => (
          <Chip
            label={t(`requests.status.${s}`)}
            selected={statusFilter === s}
            onPress={() => setStatusFilter(s)}
          />
        )}
      />

      {list.isLoading ? (
        <RequestCardSkeletonList />
      ) : items.length === 0 ? (
        <EmptyState
          title={t('requests.empty')}
          action={
            <Button
              label={t('requests.new')}
              onPress={() => navigation.navigate('TenantSubmitRequest')}
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
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              onPress={() => navigation.navigate('TenantRequestDetail', { id: item.id })}
            />
          )}
          ListFooterComponent={
            list.isFetchingNextPage ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator color={color.inkMute} />
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
}
