import { Pressable, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { timeAgo } from '@/lib/date';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

import type { RequestListItem } from '../types';

import { PriorityPill } from './PriorityPill';
import { StatusPill } from './StatusPill';

export function RequestCard({
  request,
  onPress,
  locale = 'es',
}: {
  request: RequestListItem;
  onPress: () => void;
  locale?: 'es' | 'en';
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${request.referenceId} — ${request.title}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Card elevated style={{ gap: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text variant="mono/data">
            {request.referenceId} · {timeAgo(request.createdAt, locale).toUpperCase()}
          </Text>
          <StatusPill status={request.status} />
        </View>

        <Text variant="display/card-title">{request.title}</Text>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <PriorityPill priority={request.priority} />
          <Text variant="ui/label" style={{ color: color.inkMute }}>
            {t(`requests.category.${request.category}`)}
          </Text>
        </View>

        {request.scheduledDate ? (
          <Text variant="ui/caption">
            {t('requests.scheduledFor', {
              date: new Date(request.scheduledDate).toLocaleString(
                locale === 'es' ? 'es-ES' : 'en-US',
                { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
              ),
            })}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}
