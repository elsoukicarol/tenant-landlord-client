import { useRoute, type RouteProp } from '@react-navigation/native';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { isApiError } from '@/api/errors';
import { Card, EmptyState, Screen, Text } from '@/components/ui';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { formatCurrency, PLACEHOLDER } from '@/lib/format';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

import { useBuilding, useBuildingUnits } from '../api';

type DetailRoute = RouteProp<{ Detail: { id: string } }, 'Detail'>;

export function BuildingDetailScreen() {
  const route = useRoute<DetailRoute>();
  const { id } = route.params;
  const user = useAuthStore(selectUser);
  const locale = user?.language ?? 'es';

  const building = useBuilding(id);
  const units = useBuildingUnits(id);

  if (building.isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      </Screen>
    );
  }

  if (building.isError || !building.data) {
    return (
      <Screen>
        <EmptyState
          title={isApiError(building.error) ? building.error.message : t('common.unknownError')}
        />
      </Screen>
    );
  }

  const b = building.data;
  const unitList = units.data ?? b.units ?? [];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 40 }}>
        <View style={{ gap: 8 }}>
          <Text variant="display/screen-title">{b.name}</Text>
          <Text variant="body/default">{b.address}</Text>
          {b.maintainer ? (
            <Text variant="ui/caption">
              {t('buildings.assignedTo', { name: b.maintainer.name })}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard
            label={t('buildings.occupiedUnits')}
            value={`${b.occupiedCount}/${b.unitCount}`}
          />
          <StatCard
            label={t('buildings.monthlyRent')}
            value={
              b.stats?.monthlyRent !== undefined
                ? formatCurrency(b.stats.monthlyRent, locale)
                : PLACEHOLDER
            }
          />
        </View>

        <View style={{ gap: 12 }}>
          <Text variant="eyebrow">{t('buildings.unitsHeader')}</Text>
          {unitList.length === 0 ? (
            <Text variant="body/small">{t('buildings.noUnits')}</Text>
          ) : (
            unitList.map((u) => (
              <Card key={u.id} style={{ gap: 4 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text variant="ui/label-strong">
                    {t('buildings.unitNumber', { number: u.number })}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: radius.pill,
                      backgroundColor: u.status === 'OCCUPIED' ? color.okSoft : color.lineSoft,
                    }}
                  >
                    <Text
                      variant="ui/tiny"
                      style={{
                        color: u.status === 'OCCUPIED' ? color.ok : color.inkMute,
                        textTransform: 'uppercase',
                      }}
                    >
                      {u.status === 'OCCUPIED' ? t('buildings.occupied') : t('buildings.vacant')}
                    </Text>
                  </View>
                </View>
                {u.tenant ? <Text variant="body/small">{u.tenant.name}</Text> : null}
                {u.monthlyRent !== undefined ? (
                  <Text variant="ui/caption">{formatCurrency(u.monthlyRent, locale)} / mo</Text>
                ) : null}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, gap: 6 }}>
      <Text variant="mono/label">{label}</Text>
      <Text variant="display/stat-medium">{value}</Text>
    </Card>
  );
}
