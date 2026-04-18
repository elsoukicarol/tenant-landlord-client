import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { Button, EmptyState, Screen, Text } from '@/components/ui';
import { selectRole, useAuthStore } from '@/features/auth/store';
import { timeAgo } from '@/lib/date';
import { t } from '@/lib/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { color, radius } from '@/theme';

import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationList } from '../api';
import { resolveDeepLink } from '../deepLinkResolver';
import type { Notification } from '../types';

export function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const role = useAuthStore(selectRole);
  const list = useNotificationList();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = list.data?.pages.flatMap((p) => p.data) ?? [];
  const unread = items.some((n) => !n.isRead);

  const handlePress = (n: Notification) => {
    if (!n.isRead) {
      markRead.mutate(n.id);
    }
    if (role && role !== 'super_admin') {
      resolveDeepLink(n.deepLink ?? null, navigation, role);
    }
  };

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
        <Text variant="display/screen-title">{t('notifications.title')}</Text>
        {unread ? (
          <Button
            label={t('notifications.markAllRead')}
            variant="ghost"
            size="md"
            onPress={() => markAll.mutate()}
            loading={markAll.isPending}
          />
        ) : null}
      </View>

      {list.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState title={t('notifications.empty')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 40 }}
          onEndReached={() => list.hasNextPage && list.fetchNextPage()}
          onEndReachedThreshold={0.3}
          onRefresh={() => list.refetch()}
          refreshing={list.isRefetching && !list.isFetchingNextPage}
          renderItem={({ item }) => (
            <NotificationRow notification={item} onPress={() => handlePress(item)} />
          )}
        />
      )}
    </Screen>
  );
}

function NotificationRow({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={notification.title}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        backgroundColor: notification.isRead ? color.paper : color.accentSoft,
        padding: 14,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: color.line,
        gap: 4,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text variant="ui/label-strong">{notification.title}</Text>
        <Text variant="ui/tiny">{timeAgo(notification.createdAt)}</Text>
      </View>
      <Text variant="body/small" numberOfLines={2}>
        {notification.message}
      </Text>
    </Pressable>
  );
}
