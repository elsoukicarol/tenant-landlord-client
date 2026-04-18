import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { EmptyState, Screen, Text } from '@/components/ui';
import { selectRole, useAuthStore } from '@/features/auth/store';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

import { useBuildingList } from '../api';
import { BuildingCard } from '../components/BuildingCard';

export function BuildingsListScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const role = useAuthStore(selectRole);
  const list = useBuildingList();
  const items = list.data?.pages.flatMap((p) => p.data) ?? [];

  const navigateToDetail = (id: string) => {
    const name = role === 'landlord' ? 'LandlordBuildingDetail' : 'MaintainerBuildingDetail';
    navigation.navigate(name, { id });
  };

  return (
    <Screen>
      <Text variant="display/screen-title" style={{ marginBottom: 16 }}>
        {t('buildings.title')}
      </Text>

      {list.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState title={t('buildings.empty')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
          onRefresh={() => list.refetch()}
          refreshing={list.isRefetching}
          onEndReached={() => list.hasNextPage && list.fetchNextPage()}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <BuildingCard building={item} onPress={() => navigateToDetail(item.id)} />
          )}
        />
      )}
    </Screen>
  );
}
