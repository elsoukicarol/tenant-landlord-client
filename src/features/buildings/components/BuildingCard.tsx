import { Pressable, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

import type { BuildingListItem, Colorway } from '../types';

const colorwayStrip: Record<Colorway, string> = {
  'warm-brown': '#D6A26A',
  'cool-blue': '#6A8FD6',
  'dark-brown': '#6B4A2E',
};

export function BuildingCard({
  building,
  onPress,
}: {
  building: BuildingListItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={building.name}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Card elevated padded={false} style={{ overflow: 'hidden' }}>
        <View
          style={{
            height: 6,
            backgroundColor: colorwayStrip[building.colorway ?? 'warm-brown'],
          }}
        />
        <View style={{ padding: 16, gap: 8 }}>
          <Text variant="display/card-title">{building.name}</Text>
          <Text variant="body/small">{building.address}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <Text variant="ui/label">
              {t('buildings.occupancy', {
                occupied: building.occupiedCount,
                total: building.unitCount,
              })}
            </Text>
            {building.maintainer ? (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: color.lineSoft,
                  borderRadius: radius.pill,
                }}
              >
                <Text variant="ui/tiny">{building.maintainer.name}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
