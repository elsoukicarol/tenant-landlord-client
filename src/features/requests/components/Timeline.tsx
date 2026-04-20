import { View } from 'react-native';

import { Text } from '@/components/ui';
import { timeAgo } from '@/lib/date';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

import type { TimelineEvent } from '../types';

export function Timeline({
  events,
  locale = 'en',
}: {
  events: TimelineEvent[];
  locale?: 'es' | 'en';
}) {
  if (events.length === 0) return null;

  return (
    <View style={{ gap: 12 }}>
      <Text variant="eyebrow">{t('requests.timeline')}</Text>
      {events.map((event, i) => (
        <View key={event.id} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: radius.pill,
                backgroundColor: i === 0 ? color.accent : color.inkFaint,
                marginTop: 4,
              }}
            />
            {i < events.length - 1 ? (
              <View
                style={{
                  flex: 1,
                  width: 1,
                  backgroundColor: color.line,
                  marginTop: 2,
                }}
              />
            ) : null}
          </View>
          <View style={{ flex: 1, gap: 2, paddingBottom: 12 }}>
            <Text variant="ui/label-strong">
              {event.message ??
                t(`requests.timelineType.${event.type}`, { defaultValue: event.type })}
            </Text>
            <Text variant="ui/caption">
              {event.actor ? `${event.actor.name} · ` : ''}
              {timeAgo(event.createdAt, locale)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
