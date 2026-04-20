import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { timeAgo } from '@/lib/date';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

import { categoryIcon, priorityIcon } from '../icons';
import type { RequestListItem } from '../types';

import { StatusPill } from './StatusPill';

/**
 * Flat-row representation of a maintenance request (Figma 02.08 / 01.03).
 * Uses a bottom border instead of a card surface so stacks read as a list.
 */
export function RequestCard({
  request,
  onPress,
  locale = 'en',
  showBottomBorder = true,
}: {
  request: RequestListItem;
  onPress: () => void;
  locale?: 'es' | 'en';
  showBottomBorder?: boolean;
}) {
  const footerRight = formatFooterRight(request, locale);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${request.referenceId} — ${request.title}`}
      style={({ pressed }) => ({
        paddingVertical: 16,
        gap: 8,
        borderBottomWidth: showBottomBorder ? 1 : 0,
        borderBottomColor: color.lineSoft,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
        <Text variant="ui/label-strong" style={{ flex: 1 }} numberOfLines={2}>
          {request.title}
        </Text>
        <StatusPill status={request.status} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <MetaChip
          icon={categoryIcon[request.category]}
          label={t(`requests.category.${request.category}`)}
        />
        <MetaChip
          icon={priorityIcon[request.priority]}
          label={t(`requests.priority.${request.priority}`)}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Text variant="mono/data" numberOfLines={1}>
          {buildReference(request)}
        </Text>
        <Text variant="ui/tiny" style={{ color: color.inkMute }} numberOfLines={1}>
          {footerRight}
        </Text>
      </View>
    </Pressable>
  );
}

function MetaChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={10} color={color.inkMute} />
      <Text variant="ui/tiny" style={{ color: color.inkMute }}>
        {label}
      </Text>
    </View>
  );
}

function buildReference(r: RequestListItem): string {
  const parts = [r.referenceId];
  if (r.building?.name) parts.push(r.building.name);
  if (r.unit?.number) parts.push(r.unit.number);
  return parts.join(' · ');
}

function formatFooterRight(r: RequestListItem, locale: 'es' | 'en'): string {
  if (r.status === 'RESOLVED') {
    return t('requests.awaitingSignOff');
  }
  if (r.status === 'IN_PROGRESS' && r.scheduledDate) {
    const d = new Date(r.scheduledDate);
    if (!isNaN(d.getTime())) {
      const formatted = d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
      return t('requests.scheduledOn', { date: formatted });
    }
  }
  return timeAgo(r.createdAt, locale);
}
