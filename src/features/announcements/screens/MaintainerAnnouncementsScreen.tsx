import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, View } from 'react-native';

import { Button, EmptyState, Screen, Text } from '@/components/ui';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { t } from '@/lib/i18n';
import type { MaintainerHomeStackParamList } from '@/navigation/types';

import { useAnnouncementList } from '../api';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { AnnouncementCardSkeletonList } from '../components/AnnouncementCardSkeleton';

type Nav = NativeStackNavigationProp<MaintainerHomeStackParamList, 'MaintainerAnnouncementsList'>;

export function MaintainerAnnouncementsScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(selectUser);
  const list = useAnnouncementList();
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
        <Text variant="display/screen-title">{t('announcements.title')}</Text>
        <Button
          label={t('announcements.new')}
          size="md"
          onPress={() => navigation.navigate('MaintainerCreateAnnouncement')}
        />
      </View>

      {list.isLoading ? (
        <AnnouncementCardSkeletonList />
      ) : items.length === 0 ? (
        <EmptyState
          title={t('announcements.empty')}
          action={
            <Button
              label={t('announcements.new')}
              onPress={() => navigation.navigate('MaintainerCreateAnnouncement')}
            />
          }
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
          onRefresh={() => list.refetch()}
          refreshing={list.isRefetching}
          renderItem={({ item }) => (
            <AnnouncementCard
              announcement={item}
              locale={user?.language ?? 'en'}
              onPress={() => navigation.navigate('MaintainerAnnouncementDetail', { id: item.id })}
            />
          )}
        />
      )}
    </Screen>
  );
}
