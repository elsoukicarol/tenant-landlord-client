import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { AccentItalic, EmptyState, PickerSheet, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { useBuildingList } from '@/features/buildings/api';
import { t } from '@/lib/i18n';
import type { MaintainerRequestsStackParamList } from '@/navigation/types';
import { color, radius } from '@/theme';

import { useRequestList } from '../api';
import { RequestCard } from '../components/RequestCard';
import { RequestCardSkeletonList } from '../components/RequestCardSkeleton';
import type { RequestStatus } from '../types';

type Nav = NativeStackNavigationProp<MaintainerRequestsStackParamList, 'MaintainerRequestsList'>;

type StatusFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
const STATUS_FILTERS: StatusFilter[] = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

export function MaintainerRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const locale = user?.language ?? 'en';

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const buildings = useBuildingList();
  const buildingList = useMemo(
    () => buildings.data?.pages.flatMap((p) => p.data) ?? [],
    [buildings.data],
  );

  const apiStatus: RequestStatus | undefined = statusFilter === 'ALL' ? undefined : statusFilter;

  const list = useRequestList({
    ...(apiStatus ? { status: apiStatus } : {}),
    ...(buildingId ? { buildingId } : {}),
  });
  const items = list.data?.pages.flatMap((p) => p.data) ?? [];

  const allCount = useAllCount(buildingId);
  const { openCount, inProgressCount } = useHeroCounts(buildingId);
  const buildingCount = buildings.data?.pages[0]?.pagination?.total ?? buildingList.length;

  const selectedBuilding = buildingList.find((b) => b.id === buildingId);
  const buildingOptions = useMemo(
    () => [
      { value: 'ALL', label: t('requests.allBuildings') },
      ...buildingList.map((b) => ({ value: b.id, label: b.name })),
    ],
    [buildingList],
  );

  return (
    <Screen edges={['top']} padding={0}>
      <TopBar
        title={t('requests.title')}
        onFilter={() => setSheetOpen(true)}
        filterActive={buildingId !== null}
      />

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 8 }}>
        <Text variant="eyebrow">
          {selectedBuilding
            ? t('requests.heroEyebrowBuilding', { building: selectedBuilding.name.toUpperCase() })
            : t('requests.heroEyebrow', { count: buildingCount })}
        </Text>
        <Text variant="display/section">
          <AccentItalic>{pad(openCount)}</AccentItalic>
          {t('requests.heroCounts', { inProgress: pad(inProgressCount) })}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 6,
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: color.lineSoft,
        }}
      >
        {STATUS_FILTERS.map((s) => {
          const selected = statusFilter === s;
          const label = s === 'ALL' ? t('requests.filterAll') : t(`requests.status.${s}`);
          const countNumber = s === 'ALL' ? allCount : undefined;
          return (
            <FilterChip
              key={s}
              label={label}
              count={countNumber}
              selected={selected}
              onPress={() => setStatusFilter(s)}
            />
          );
        })}
      </View>

      {list.isLoading ? (
        <View style={{ paddingHorizontal: 20 }}>
          <RequestCardSkeletonList />
        </View>
      ) : items.length === 0 ? (
        <EmptyState title={t('requests.emptyMaintainer')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          onEndReached={() => list.hasNextPage && list.fetchNextPage()}
          onEndReachedThreshold={0.3}
          onRefresh={() => list.refetch()}
          refreshing={list.isRefetching && !list.isFetchingNextPage}
          renderItem={({ item, index }) => (
            <RequestCard
              request={item}
              locale={locale}
              showBottomBorder={index < items.length - 1}
              onPress={() => navigation.navigate('MaintainerRequestDetail', { id: item.id })}
            />
          )}
          ListFooterComponent={
            list.isFetchingNextPage ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator color={color.inkMute} />
              </View>
            ) : null
          }
        />
      )}

      <PickerSheet
        visible={sheetOpen}
        title={t('requests.filterByBuilding')}
        options={buildingOptions}
        selectedValue={buildingId ?? 'ALL'}
        onSelect={(v) => {
          setBuildingId(v === 'ALL' ? null : v);
          setSheetOpen(false);
        }}
        onCancel={() => setSheetOpen(false)}
      />
    </Screen>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
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

function TopBar({
  title,
  onFilter,
  filterActive,
}: {
  title: string;
  onFilter: () => void;
  filterActive: boolean;
}) {
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
        onPress={onFilter}
        accessibilityRole="button"
        accessibilityLabel={t('requests.filter')}
        hitSlop={8}
        style={{
          width: 34,
          height: 34,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: filterActive ? color.ink : color.paperWarm,
          borderRadius: radius.pill,
        }}
      >
        <Ionicons name="options-outline" size={16} color={filterActive ? color.paper : color.ink} />
      </Pressable>
    </View>
  );
}

function useHeroCounts(buildingId: string | null) {
  const openList = useRequestList({
    status: 'OPEN',
    limit: 1,
    ...(buildingId ? { buildingId } : {}),
  });
  const inProgressList = useRequestList({
    status: 'IN_PROGRESS',
    limit: 1,
    ...(buildingId ? { buildingId } : {}),
  });

  return {
    openCount: openList.data?.pages[0]?.pagination?.total ?? 0,
    inProgressCount: inProgressList.data?.pages[0]?.pagination?.total ?? 0,
  };
}

function useAllCount(buildingId: string | null) {
  const all = useRequestList({
    limit: 1,
    ...(buildingId ? { buildingId } : {}),
  });
  return all.data?.pages[0]?.pagination?.total ?? 0;
}
