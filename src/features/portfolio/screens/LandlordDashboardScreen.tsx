import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { isApiError } from '@/api/errors';
import { AccentItalic, Banner, Card, EmptyState, Screen, Text } from '@/components/ui';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { PLACEHOLDER, formatCurrency } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { LandlordDashboardStackParamList, LandlordTabParamList } from '@/navigation/types';
import { color, radius } from '@/theme';

import { usePortfolioDashboard } from '../api';
import type { PortfolioBuilding } from '../types';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<LandlordDashboardStackParamList, 'LandlordDashboardIndex'>,
  BottomTabNavigationProp<LandlordTabParamList>
>;

export function LandlordDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(selectUser);
  const locale = user?.language ?? 'es';

  const period = useMemo(() => currentYearMonth(), []);
  const dashboard = usePortfolioDashboard(period);

  if (dashboard.isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      </Screen>
    );
  }

  if (dashboard.isError || !dashboard.data) {
    return (
      <Screen>
        <EmptyState
          title={isApiError(dashboard.error) ? dashboard.error.message : t('common.unknownError')}
        />
      </Screen>
    );
  }

  const { buildings, summary } = dashboard.data;
  const firstName = user?.name.split(' ')[0] ?? '';

  const expensesDisplay =
    summary.monthlyExpenses === null || summary.monthlyExpenses === undefined
      ? PLACEHOLDER
      : formatCurrency(summary.monthlyExpenses, locale);
  const netIncomeDisplay =
    summary.netIncome === null || summary.netIncome === undefined
      ? PLACEHOLDER
      : formatCurrency(summary.netIncome, locale);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 40 }}>
        <View style={{ gap: 8 }}>
          <Text variant="display/hero">
            {t('portfolio.heroPrefix')}
            <AccentItalic>{firstName}</AccentItalic>.
          </Text>
          <Text variant="body/lead">
            {t('portfolio.heroSubtitle', { period: formatPeriodLabel(period, locale) })}
          </Text>
        </View>

        {summary.monthlyExpenses === null || summary.monthlyExpenses === undefined ? (
          <Banner tone="info" message={t('portfolio.expensesPlaceholderNote')} />
        ) : null}

        <Card elevated style={{ gap: 12 }}>
          <Text variant="mono/label">{t('portfolio.netIncome')}</Text>
          <Text variant="display/stat-large">{netIncomeDisplay}</Text>
          {summary.netIncomeDeltaPct !== null && summary.netIncomeDeltaPct !== undefined ? (
            <Text variant="ui/caption">
              {t('portfolio.vsLastPeriod', {
                delta: summary.netIncomeDeltaPct.toFixed(1),
              })}
            </Text>
          ) : (
            <Text variant="ui/caption">{PLACEHOLDER}</Text>
          )}
        </Card>

        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <StatCard
            label={t('portfolio.monthlyRent')}
            value={formatCurrency(summary.monthlyRent, locale)}
          />
          <StatCard label={t('portfolio.monthlyExpenses')} value={expensesDisplay} />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard
            label={t('portfolio.occupied')}
            value={`${summary.occupiedUnits}/${summary.totalUnits}`}
          />
          <StatCard label={t('portfolio.vacant')} value={summary.vacantUnits.toString()} />
        </View>

        <View style={{ gap: 12 }}>
          <Text variant="eyebrow">{t('portfolio.byBuilding')}</Text>
          {buildings.length === 0 ? (
            <Text variant="body/small">{t('buildings.empty')}</Text>
          ) : (
            buildings.map((b) => (
              <PortfolioBuildingCard
                key={b.id}
                building={b}
                locale={locale}
                onPress={() =>
                  navigation.navigate('LandlordDashboard', {
                    screen: 'LandlordBuildingDetail',
                    params: { id: b.id },
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

function PortfolioBuildingCard({
  building,
  locale,
  onPress,
}: {
  building: PortfolioBuilding;
  locale: 'es' | 'en';
  onPress: () => void;
}) {
  const expenses =
    building.monthlyExpenses === null || building.monthlyExpenses === undefined
      ? PLACEHOLDER
      : formatCurrency(building.monthlyExpenses, locale);
  const net =
    building.netIncome === null || building.netIncome === undefined
      ? PLACEHOLDER
      : formatCurrency(building.netIncome, locale);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={building.name}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Card elevated padded={false} style={{ overflow: 'hidden' }}>
        <View style={{ padding: 16, gap: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ gap: 2, flex: 1 }}>
              <Text variant="display/card-title">{building.name}</Text>
              <Text variant="body/small">{building.address}</Text>
            </View>
            {building.openRequests !== undefined && building.openRequests > 0 ? (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: color.accentSoft,
                  borderRadius: radius.pill,
                }}
              >
                <Text variant="ui/tiny" style={{ color: color.accent }}>
                  {t('portfolio.openCount', { count: building.openRequests })}
                </Text>
              </View>
            ) : null}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 4,
              gap: 12,
            }}
          >
            <Metric
              label={t('portfolio.rent')}
              value={
                building.monthlyRent !== undefined
                  ? formatCurrency(building.monthlyRent, locale)
                  : PLACEHOLDER
              }
            />
            <Metric label={t('portfolio.exp')} value={expenses} />
            <Metric label={t('portfolio.net')} value={net} strong />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <Text variant="ui/tiny">{label}</Text>
      <Text variant={strong ? 'display/stat-small' : 'ui/label-strong'}>{value}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, minWidth: '45%', gap: 6 }}>
      <Text variant="mono/label">{label}</Text>
      <Text variant="display/stat-medium">{value}</Text>
    </Card>
  );
}

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatPeriodLabel(period: string, locale: 'es' | 'en'): string {
  const [y, m] = period.split('-');
  if (!y || !m) return period;
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
}
