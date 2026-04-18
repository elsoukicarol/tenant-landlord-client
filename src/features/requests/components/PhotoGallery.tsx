import { Image, Pressable, ScrollView, View } from 'react-native';

import { color, radius } from '@/theme';

import type { Photo } from '../types';

type Size = { width: number; height: number };

const DEFAULT_SIZE: Size = { width: 120, height: 120 };

export function PhotoGallery({
  photos,
  size = DEFAULT_SIZE,
  onRemove,
  onPress,
}: {
  photos: Photo[];
  size?: Size;
  onRemove?: (index: number) => void;
  onPress?: (index: number) => void;
}) {
  if (photos.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {photos.map((p, i) => (
        <View key={p.id || p.url}>
          <Pressable
            onPress={() => onPress?.(i)}
            accessibilityRole="image"
            accessibilityLabel={`Photo ${i + 1}`}
          >
            <Image
              source={{ uri: p.thumbnailUrl ?? p.url }}
              style={{
                width: size.width,
                height: size.height,
                borderRadius: radius.lg,
                backgroundColor: color.lineSoft,
              }}
              resizeMode="cover"
            />
          </Pressable>
          {onRemove ? (
            <Pressable
              onPress={() => onRemove(i)}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              hitSlop={8}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: color.ink,
                borderRadius: radius.pill,
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 2,
                  backgroundColor: color.paper,
                  borderRadius: 1,
                }}
              />
            </Pressable>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}
