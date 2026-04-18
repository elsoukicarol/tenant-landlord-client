import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { Chip, EmptyState, Screen, Text } from '@/components/ui';
import { useBuildingList } from '@/features/buildings/api';
import { t } from '@/lib/i18n';
import type { MaintainerRequestsStackParamList } from '@/navigation/types';
import { color } from '@/theme';

import { useRequestList } from '../api';
import { RequestCard } from '../components/RequestCard';
import { RequestCardSkeletonList } from '../components/RequestCardSkeleton';
import { REQUEST_STATUS, type RequestStatus } from '../types';

type Nav = NativeStackNavigationProp<MaintainerRequestsStackParamList, 'MaintainerRequestsList'>;

export function MaintainerRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const [status, setStatus] = useState<RequestStatus | null>(null);
  const [buildingId, setBuildingId] = useState<string | null>(null);

  const buildings = useBuildingList();
  const buildingList = buildings.data?.pages.flatMap((p) => p.data) ?? [];

  const list = useRequestList({
    ...(status ? { status } : {}),
    ...(buildingId ? { buildingId } : {}),
  });
  const items = list.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <Screen>
      <Text variant="display/screen-title" style={{ marginBottom: 12 }}>
        {t('requests.title')}
      </Text>

      <FlatList
        data={REQUEST_STATUS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s}
        contentContainerStyle={{ gap: 8, paddingVertical: 4, paddingRight: 20 }}
        style={{
          marginHorizontal: -20,
          paddingHorizontal: 20,
          marginBottom: 8,
          flexGrow: 0,
        }}
        ListHeaderComponent={
          <Chip
            label={t('requests.filterAll')}
            selected={status === null}
            onPress={() => setStatus(null)}
          />
        }
        renderItem={({ item }) => (
          <Chip
            label={t(`requests.status.${item}`)}
            selected={status === item}
            onPress={() => setStatus(item)}
          />
        )}
      />

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

      {list.isLoading ? (
        <RequestCardSkeletonList />
      ) : items.length === 0 ? (
        <EmptyState title={t('requests.emptyMaintainer')} />
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
              onPress={() => navigation.navigate('MaintainerRequestDetail', { id: item.id })}
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
