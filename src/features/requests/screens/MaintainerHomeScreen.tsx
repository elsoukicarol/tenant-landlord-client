import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { AccentItalic, Button, Card, EmptyState, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { useBuildingList } from '@/features/buildings/api';
import { t } from '@/lib/i18n';
import type { MaintainerHomeStackParamList, MaintainerTabParamList } from '@/navigation/types';
import { color } from '@/theme';

import { useRequestList } from '../api';
import { RequestCard } from '../components/RequestCard';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<MaintainerHomeStackParamList, 'MaintainerHomeIndex'>,
  BottomTabNavigationProp<MaintainerTabParamList>
>;

export function MaintainerHomeScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const locale = user?.language ?? 'es';

  const open = useRequestList({ status: 'OPEN', limit: 5 });
  const inProgress = useRequestList({ status: 'IN_PROGRESS', limit: 1 });
  const resolved = useRequestList({ status: 'RESOLVED', limit: 1 });
  const buildings = useBuildingList();

  const needsAckCount = open.data?.pages[0]?.pagination?.total ?? 0;
  const inProgressCount = inProgress.data?.pages[0]?.pagination?.total ?? 0;
  const pendingSignOffCount = resolved.data?.pages[0]?.pagination?.total ?? 0;
  const buildingCount = buildings.data?.pages[0]?.pagination?.total ?? 0;

  const firstName = user?.name.split(' ')[0] ?? '';
  const openItems = open.data?.pages.flatMap((p) => p.data).slice(0, 5) ?? [];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 40 }}>
        <View style={{ gap: 8 }}>
          <Text variant="display/hero">
            {t('home.greetingPrefix')}
            <AccentItalic>{firstName}</AccentItalic>.
          </Text>
          <Text variant="body/lead">{t('home.maintainerSubtitle', { count: buildingCount })}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard label={t('home.needsAck')} value={needsAckCount} tone="accent" />
          <StatCard label={t('home.inProgress')} value={inProgressCount} />
          <StatCard label={t('home.pendingSignOff')} value={pendingSignOffCount} />
        </View>

        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="eyebrow">{t('home.recentOpen')}</Text>
            <Button
              label={t('common.viewAll')}
              variant="ghost"
              size="md"
              onPress={() =>
                navigation.navigate('MaintainerRequests', {
                  screen: 'MaintainerRequestsList',
                })
              }
            />
          </View>

          {open.isLoading ? (
            <ActivityIndicator color={color.ink} />
          ) : openItems.length === 0 ? (
            <EmptyState title={t('home.allClear')} />
          ) : (
            openItems.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                locale={locale}
                onPress={() =>
                  navigation.navigate('MaintainerHome', {
                    screen: 'MaintainerRequestDetail',
                    params: { id: r.id },
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: 'accent' }) {
  return (
    <Card
      style={{
        flex: 1,
        gap: 6,
        backgroundColor: tone === 'accent' ? color.accentSoft : color.paper,
      }}
    >
      <Text variant="mono/label">{label}</Text>
      <Text
        variant="display/stat-medium"
        style={{ color: tone === 'accent' ? color.accent : color.ink }}
      >
        {value}
      </Text>
    </Card>
  );
}
