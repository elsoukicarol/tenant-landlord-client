import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { ActivityIndicator, Alert, FlatList, View } from 'react-native';

import { Button, Card, EmptyState, Pill, Screen, Text } from '@/components/ui';
import { selectRole, useAuthStore } from '@/features/auth/store';
import { timeAgo } from '@/lib/date';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

import { useInvitationList, useResendInvitation, useRevokeInvitation } from '../api';
import type { InvitationListItem, InvitationStatus } from '../types';

const toneByStatus: Record<InvitationStatus, 'warn' | 'ok' | 'danger' | 'neutral'> = {
  PENDING: 'warn',
  ACCEPTED: 'ok',
  REVOKED: 'danger',
  EXPIRED: 'neutral',
};

export function InvitationsScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const role = useAuthStore(selectRole);
  const list = useInvitationList();
  const resend = useResendInvitation();
  const revoke = useRevokeInvitation();

  const newInvitationScreen =
    role === 'landlord' ? 'LandlordNewInvitation' : 'MaintainerNewInvitation';

  const items = list.data?.pages.flatMap((p) => p.data) ?? [];
  const counts = list.data?.pages[0]?.counts;

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
        <Text variant="display/screen-title">{t('invitations.title')}</Text>
        <Button
          label={t('invitations.new')}
          size="md"
          onPress={() => navigation.navigate(newInvitationScreen)}
        />
      </View>

      {counts ? (
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <Pill tone="warn" label={t('invitations.countsPending', { count: counts.PENDING })} />
          <Pill tone="ok" label={t('invitations.countsAccepted', { count: counts.ACCEPTED })} />
        </View>
      ) : null}

      {list.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title={t('invitations.empty')}
          action={
            <Button
              label={t('invitations.new')}
              onPress={() => navigation.navigate(newInvitationScreen)}
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
            <Card style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text variant="ui/label-strong">{item.email}</Text>
                <Pill
                  tone={toneByStatus[item.status]}
                  label={t(`invitations.status.${item.status}`)}
                />
              </View>
              <Text variant="body/small">
                {t(`roles.${item.role.toLowerCase()}`, { defaultValue: item.role })}
                {item.building ? ` · ${item.building.name}` : ''}
                {item.unit ? ` · ${item.unit.number}` : ''}
              </Text>
              <Text variant="ui/tiny">{timeAgo(item.createdAt)}</Text>

              {item.status === 'PENDING' ? (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Button
                    label={t('invitations.resend')}
                    size="md"
                    variant="secondary"
                    onPress={() => resend.mutate(item.id)}
                    loading={resend.isPending}
                  />
                  <Button
                    label={t('invitations.revoke')}
                    size="md"
                    variant="ghost"
                    onPress={() => confirmRevoke(item)}
                    loading={revoke.isPending}
                  />
                </View>
              ) : null}
            </Card>
          )}
        />
      )}
    </Screen>
  );
}
