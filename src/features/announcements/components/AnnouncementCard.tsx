import { Pressable, View } from 'react-native';

import { Card, Pill, Text } from '@/components/ui';
import { timeAgo } from '@/lib/date';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

import type { AnnouncementListItem, AnnouncementType } from '../types';

const toneByType: Record<AnnouncementType, 'neutral' | 'info' | 'accent' | 'warn' | 'danger'> = {
  GENERAL: 'neutral',
  MAINTENANCE: 'info',
  RULE_UPDATE: 'info',
  EMERGENCY: 'danger',
};

export function AnnouncementCard({
  announcement,
  onPress,
  locale = 'en',
}: {
  announcement: AnnouncementListItem;
  onPress: () => void;
  locale?: 'es' | 'en';
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={announcement.title}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Card elevated style={{ gap: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Pill
            tone={toneByType[announcement.type]}
            label={t(`announcements.type.${announcement.type}`, {
              defaultValue: announcement.type,
            })}
          />
          {announcement.readAt == null ? (
            <View
              accessibilityLabel="Unread"
              style={{
                width: 8,
                height: 8,
                borderRadius: radius.pill,
                backgroundColor: color.accent,
              }}
            />
          ) : null}
        </View>
        <Text variant="display/card-title">{announcement.title}</Text>
        <Text variant="body/small" numberOfLines={2}>
          {announcement.message}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {announcement.createdBy ? (
            <Text variant="ui/tiny">{announcement.createdBy.name}</Text>
          ) : (
            <View />
          )}
          <Text variant="ui/tiny">{timeAgo(announcement.createdAt, locale)}</Text>
        </View>
      </Card>
    </Pressable>
  );
}
