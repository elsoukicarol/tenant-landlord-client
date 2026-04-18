import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

import type { Photo } from '../types';

import { PhotoGallery } from './PhotoGallery';

export type PickedPhoto = { uri: string; name: string; type: string; size: number };

export const MAX_PHOTOS = 10;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export function PhotoPickerField({
  value,
  onChange,
  label,
}: {
  value: PickedPhoto[];
  onChange: (next: PickedPhoto[]) => void;
  label?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  const add = async () => {
    setError(null);
    if (value.length >= MAX_PHOTOS) {
      setError(t('requests.photoMaxCount', { max: MAX_PHOTOS }));
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        t('requests.photoPermissionNeededTitle'),
        t('requests.photoPermissionNeededBody'),
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - value.length,
      quality: 0.85,
    });
    if (result.canceled) return;

    const accepted: PickedPhoto[] = [];
    const rejected: string[] = [];
    for (const asset of result.assets) {
      const size = asset.fileSize ?? 0;
      if (size > MAX_PHOTO_BYTES) {
        rejected.push(asset.fileName ?? 'photo');
        continue;
      }
      const name = asset.fileName ?? `photo-${Date.now()}.jpg`;
      const type = asset.mimeType ?? 'image/jpeg';
      accepted.push({ uri: asset.uri, name, type, size });
    }

    if (rejected.length > 0) {
      setError(t('requests.photoTooLarge', { count: rejected.length }));
    }
    if (accepted.length > 0) {
      onChange([...value, ...accepted]);
    }
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const previewPhotos: Photo[] = value.map((p, i) => ({
    id: String(i),
    url: p.uri,
  }));

  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Text variant="ui/label-strong" style={{ color: color.inkSoft }}>
          {label}
        </Text>
      ) : null}

      <PhotoGallery photos={previewPhotos} onRemove={remove} />

      <Pressable
        onPress={add}
        accessibilityRole="button"
        accessibilityLabel={t('requests.addPhoto')}
        style={{
          borderRadius: radius.lg,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: color.line,
          padding: 16,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 56,
        }}
      >
        <Text variant="ui/label">
          {value.length === 0
            ? t('requests.addPhotosCta')
            : t('requests.addMorePhotos', { remaining: MAX_PHOTOS - value.length })}
        </Text>
      </Pressable>

      {error ? (
        <Text variant="ui/caption" style={{ color: color.danger }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
