import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { AccentItalic, Button, Card, EmptyState, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { t } from '@/lib/i18n';
import type { TenantHomeStackParamList, TenantTabParamList } from '@/navigation/types';
import { color } from '@/theme';

import { useRequestList } from '../api';
import { RequestCard } from '../components/RequestCard';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<TenantHomeStackParamList, 'TenantHomeIndex'>,
  BottomTabNavigationProp<TenantTabParamList>
>;

export function TenantHomeScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);

  const recent = useRequestList({ limit: 3 });
  const items = recent.data?.pages.flatMap((p) => p.data).slice(0, 3) ?? [];

  const openCount = items.filter((r) =>
    ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(r.status),
  ).length;
  const pendingSignOff = items.filter((r) => r.status === 'RESOLVED').length;

  const firstName = user?.name.split(' ')[0] ?? '';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 40 }}>
        <View style={{ gap: 8 }}>
          <Text variant="display/hero">
            {t('home.greetingPrefix')}
            <AccentItalic>{firstName}</AccentItalic>.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard label={t('home.openRequests')} value={openCount} />
          <StatCard label={t('home.pendingSignOff')} value={pendingSignOff} />
        </View>

        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="eyebrow">{t('requests.title')}</Text>
            <Button
              label={t('common.viewAll')}
              variant="ghost"
              size="md"
              onPress={() =>
                navigation.navigate('TenantRequests', { screen: 'TenantRequestsList' })
              }
            />
          </View>

          {recent.isLoading ? (
            <ActivityIndicator color={color.ink} />
          ) : items.length === 0 ? (
            <EmptyState
              title={t('requests.empty')}
              action={
                <Button
                  label={t('requests.new')}
                  onPress={() =>
                    navigation.navigate('TenantRequests', { screen: 'TenantSubmitRequest' })
                  }
                />
              }
            />
          ) : (
            items.map((item) => (
              <RequestCard
                key={item.id}
                request={item}
                onPress={() =>
                  navigation.navigate('TenantHome', {
                    screen: 'TenantRequestDetail',
                    params: { id: item.id },
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card padded style={{ flex: 1, gap: 6 }}>
      <Text variant="mono/label">{label}</Text>
      <Text variant="display/stat-medium">{value}</Text>
    </Card>
  );
}
