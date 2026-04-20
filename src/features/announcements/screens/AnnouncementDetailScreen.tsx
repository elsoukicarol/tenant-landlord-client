import { useRoute, type RouteProp } from '@react-navigation/native';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { isApiError } from '@/api/errors';
import { EmptyState, Pill, Screen, Text } from '@/components/ui';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { formatDate } from '@/lib/date';
import { t } from '@/lib/i18n';
import type { TenantAnnouncementsStackParamList } from '@/navigation/types';
import { color } from '@/theme';

import { useAnnouncement, useMarkAnnouncementRead } from '../api';

type RouteT = RouteProp<TenantAnnouncementsStackParamList, 'TenantAnnouncementDetail'>;

export function AnnouncementDetailScreen() {
  const route = useRoute<RouteT>();
  const { id } = route.params;
  const user = useAuthStore(selectUser);
  const locale = user?.language ?? 'en';

  const detail = useAnnouncement(id);
  const markRead = useMarkAnnouncementRead();

  useEffect(() => {
    if (detail.data && detail.data.readAt == null) {
      markRead.mutate(detail.data.id);
    }
    // Intentionally run once per detail fetch; skip markRead identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.data?.id, detail.data?.readAt]);

  if (detail.isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      </Screen>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <Screen>
        <EmptyState
          title={isApiError(detail.error) ? detail.error.message : t('common.unknownError')}
        />
      </Screen>
    );
  }

  const a = detail.data;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 40 }}>
        <Pill label={t(`announcements.type.${a.type}`, { defaultValue: a.type })} />
        <Text variant="display/hero">{a.title}</Text>
        <Text variant="ui/caption">
          {a.createdBy?.name ? `${a.createdBy.name} · ` : ''}
          {formatDate(a.createdAt, 'PPPp', locale)}
        </Text>
        <Text variant="body/default">{a.message}</Text>
      </ScrollView>
    </Screen>
  );
}
