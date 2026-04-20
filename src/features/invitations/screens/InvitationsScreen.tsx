import { Ionicons } from '@expo/vector-icons';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, View } from 'react-native';

import { AccentItalic, EmptyState, Pill, Screen, Text } from '@/components/ui';
import { selectRole, useAuthStore } from '@/features/auth/store';
import { useBuildingList } from '@/features/buildings/api';
import { timeAgo } from '@/lib/date';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

import { useInvitationList, useResendInvitation, useRevokeInvitation } from '../api';
import type { InvitationListItem, InvitationStatus } from '../types';

const toneByStatus: Record<InvitationStatus, 'warn' | 'ok' | 'danger' | 'neutral'> = {
  pending: 'warn',
  accepted: 'ok',
  revoked: 'danger',
  expired: 'neutral',
};

const iconByStatus: Record<InvitationStatus, keyof typeof Ionicons.glyphMap> = {
  pending: 'time-outline',
  accepted: 'checkmark',
  revoked: 'close',
  expired: 'close',
};

type StatusFilter = 'ALL' | InvitationStatus;

const STATUS_FILTERS: StatusFilter[] = ['ALL', 'pending', 'accepted', 'expired'];

export function InvitationsScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const role = useAuthStore(selectRole);
  const locale = useAuthStore((s) => s.user?.language) ?? 'en';

  const list = useInvitationList();
  const resend = useResendInvitation();
  const revoke = useRevokeInvitation();
  const buildings = useBuildingList();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const newInvitationScreen =
    role === 'landlord' ? 'LandlordNewInvitation' : 'MaintainerNewInvitation';

  const items = useMemo(() => list.data?.pages.flatMap((p) => p.data) ?? [], [list.data]);
  const counts = list.data?.pages[0]?.counts;
  const total = list.data?.pages[0]?.pagination?.total ?? items.length;

  const buildingMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const page of buildings.data?.pages ?? []) {
      for (const b of page.data) m.set(b.id, b.name);
    }
    return m;
  }, [buildings.data]);

  const filtered = useMemo(
    () => (statusFilter === 'ALL' ? items : items.filter((i) => i.status === statusFilter)),
    [items, statusFilter],
  );

  const confirmRevoke = (inv: InvitationListItem) => {
    Alert.alert(t('invitations.revokeTitle'), t('invitations.revokeBody', { email: inv.email }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('invitations.revokeConfirm'),
        style: 'destructive',
        onPress: () => revoke.mutate(inv.id),
      },
    ]);
  };

  const countForFilter = (f: StatusFilter): number => {
    if (f === 'ALL') return total;
    return counts?.[f] ?? 0;
  };

  return (
    <Screen edges={['top']} padding={0}>
      <TopBar
        title={t('invitations.title')}
        onNew={() => navigation.navigate(newInvitationScreen)}
      />

      {counts ? (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 8,
            gap: 8,
          }}
        >
          <Text variant="eyebrow">{t('invitations.heroEyebrow')}</Text>
          <Text variant="display/section">
            <AccentItalic>{pad(counts.pending)}</AccentItalic>
            {t('invitations.heroCounts', { accepted: counts.accepted })}
          </Text>
        </View>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          gap: 6,
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 14,
        }}
      >
        {STATUS_FILTERS.map((s) => {
          const selected = statusFilter === s;
          const label = s === 'ALL' ? t('invitations.filterAll') : t(`invitations.status.${s}`);
          const c = countForFilter(s);
          return (
            <FilterChip
              key={s}
              label={label}
              count={s === 'ALL' ? c : undefined}
              selected={selected}
              onPress={() => setStatusFilter(s)}
            />
          );
        })}
      </View>

      {list.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState title={t('invitations.empty')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          onRefresh={() => list.refetch()}
          refreshing={list.isRefetching}
          renderItem={({ item }) => (
            <InvitationRow
              item={item}
              buildingName={item.buildingId ? buildingMap.get(item.buildingId) : undefined}
              locale={locale}
              onResend={() => resend.mutate(item.id)}
              onRevoke={() => confirmRevoke(item)}
            />
          )}
        />
      )}
    </Screen>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function InvitationRow({
  item,
  buildingName,
  locale,
  onResend,
  onRevoke,
}: {
  item: InvitationListItem;
  buildingName?: string;
  locale: 'en' | 'es';
  onResend: () => void;
  onRevoke: () => void;
}) {
  const footer = buildFooterText(item, locale);
  const locationText = buildLocationText(item, buildingName);
  const canAct = item.status === 'pending';

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 4,
        borderBottomWidth: 1,
        borderBottomColor: color.lineSoft,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Text variant="ui/label-strong" style={{ flex: 1 }} numberOfLines={1}>
          {item.email}
        </Text>
        <Pill
          tone={toneByStatus[item.status]}
          icon={iconByStatus[item.status]}
          label={t(`invitations.status.${item.status}`, { defaultValue: item.status })}
        />
      </View>

      {locationText ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Ionicons name="home-outline" size={10} color={color.inkMute} />
          <Text variant="ui/tiny" style={{ color: color.inkMute }}>
            {locationText}
          </Text>
        </View>
      ) : null}

      <Text variant="ui/tiny" style={{ color: color.inkMute, paddingTop: 2 }}>
        {footer}
      </Text>

      {canAct ? (
        <View style={{ flexDirection: 'row', gap: 16, paddingTop: 6 }}>
          <Pressable onPress={onResend} accessibilityRole="button" hitSlop={6}>
            <Text variant="ui/caption" style={{ color: color.accent }}>
              {t('invitations.resend')}
            </Text>
          </Pressable>
          <Pressable onPress={onRevoke} accessibilityRole="button" hitSlop={6}>
            <Text variant="ui/caption" style={{ color: color.danger }}>
              {t('invitations.revoke')}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function buildLocationText(item: InvitationListItem, buildingName?: string): string | null {
  const role = t(`roles.${item.role}`, { defaultValue: item.role });
  if (buildingName) {
    return `${capitalize(role)} · ${buildingName}`;
  }
  return capitalize(role);
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

function buildFooterText(item: InvitationListItem, locale: 'en' | 'es'): string {
  if (item.status === 'accepted' && item.acceptedAt) {
    return t('invitations.acceptedAgo', { time: timeAgo(item.acceptedAt, locale) });
  }
  if (item.status === 'revoked' && item.revokedAt) {
    return t('invitations.revokedAgo', { time: timeAgo(item.revokedAt, locale) });
  }
  if (item.status === 'expired') {
    return t('invitations.expiredAgo', { time: timeAgo(item.expiresAt, locale) });
  }
  // pending
  const sent = timeAgo(item.sentAt, locale);
  const expiresIn = futureDistance(item.expiresAt, locale);
  return t('invitations.pendingLine', { sent, expires: expiresIn });
}

function futureDistance(isoDate: string, _locale: 'en' | 'es'): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '';
  const deltaMs = d.getTime() - Date.now();
  const days = Math.round(deltaMs / (1000 * 60 * 60 * 24));
  if (days > 1) {
    return t('invitations.inDays', { count: days });
  }
  if (days === 1) {
    return t('invitations.inOneDay');
  }
  if (days === 0) {
    return t('invitations.today');
  }
  return t('invitations.past');
}

function FilterChip({
  label,
  count,
  selected,
  onPress,
}: {
  label: string;
  count?: number;
  selected: boolean;
  onPress: () => void;
}) {
  const bg = selected ? color.ink : color.paper;
  const border = selected ? color.ink : color.line;
  const fg = selected ? color.paper : color.inkSoft;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={4}
      style={({ pressed }) => ({
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        borderRadius: radius.pill,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text variant="ui/chip" style={{ color: fg, fontSize: 11 }}>
        {label}
        {count !== undefined ? ` · ${count}` : ''}
      </Text>
    </Pressable>
  );
}

function TopBar({ title, onNew }: { title: string; onNew: () => void }) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: color.lineSoft,
      }}
    >
      <Text variant="title/app">{title}</Text>
      <Pressable
        onPress={onNew}
        accessibilityRole="button"
        accessibilityLabel={t('invitations.new')}
        hitSlop={8}
        style={{
          width: 34,
          height: 34,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color.ink,
          borderRadius: radius.pill,
        }}
      >
        <Ionicons name="add" size={16} color={color.paper} />
      </Pressable>
    </View>
  );
}
