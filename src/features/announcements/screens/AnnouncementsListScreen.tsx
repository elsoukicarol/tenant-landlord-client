import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { EmptyState, Screen, Text } from '@/components/ui';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { t } from '@/lib/i18n';
import type { TenantAnnouncementsStackParamList } from '@/navigation/types';
import { color } from '@/theme';

import { useAnnouncementList } from '../api';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { AnnouncementCardSkeletonList } from '../components/AnnouncementCardSkeleton';

type Nav = NativeStackNavigationProp<TenantAnnouncementsStackParamList, 'TenantAnnouncementsList'>;

export function AnnouncementsListScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(selectUser);
  const list = useAnnouncementList();
  const items = list.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <Screen>
      <Text variant="display/screen-title" style={{ marginBottom: 16 }}>
        {t('announcements.title')}
      </Text>

      {list.isLoading ? (
        <AnnouncementCardSkeletonList />
      ) : items.length === 0 ? (
        <EmptyState title={t('announcements.empty')} />
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
            <AnnouncementCard
              announcement={item}
              locale={user?.language ?? 'en'}
              onPress={() => navigation.navigate('TenantAnnouncementDetail', { id: item.id })}
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
