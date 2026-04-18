import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { z } from 'zod';

import { isApiError } from '@/api/errors';
import { Banner, Button, Input, Screen, Text } from '@/components/ui';
import { t } from '@/lib/i18n';
import type { TenantRequestsStackParamList } from '@/navigation/types';
import { color, radius } from '@/theme';

import { useCreateRequest } from '../api';
import { MAX_PHOTOS, PhotoPickerField, type PickedPhoto } from '../components/PhotoPickerField';
import { CATEGORIES, PRIORITIES } from '../types';

const submitSchema = z.object({
  title: z.string().trim().min(3, 'requests.titleTooShort').max(140),
  description: z.string().trim().min(10, 'requests.descriptionTooShort').max(2000),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
});
type SubmitInput = z.infer<typeof submitSchema>;

type Nav = NativeStackNavigationProp<TenantRequestsStackParamList, 'TenantSubmitRequest'>;

export function SubmitRequestScreen() {
  const navigation = useNavigation<Nav>();
  const create = useCreateRequest();

  const { control, handleSubmit, watch, setValue } = useForm<SubmitInput>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'PLUMBING',
      priority: 'MEDIUM',
    },
    mode: 'onBlur',
  });

  const [photos, setPhotosState] = useState<PickedPhoto[]>([]);
  const category = watch('category');
  const priority = watch('priority');

  const onSubmit = handleSubmit((values) => {
    create.mutate(
      {
        ...values,
        photos: photos.map((p) => ({ uri: p.uri, name: p.name, type: p.type })),
      },
      {
        onSuccess: (detail) => {
          navigation.replace('TenantRequestDetail', { id: detail.id });
        },
      },
    );
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ gap: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="display/screen-title">{t('requests.new')}</Text>

          {create.isError && isApiError(create.error) ? (
            <Banner tone="danger" message={create.error.message} />
          ) : null}

          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <Input
                label={t('requests.titleLabel')}
                placeholder={t('requests.titlePlaceholder')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!create.isPending}
                error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Input
                label={t('requests.description')}
                placeholder={t('requests.descriptionPlaceholder')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                multiline
                numberOfLines={4}
                style={{ minHeight: 100, textAlignVertical: 'top' }}
                editable={!create.isPending}
                error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
              />
            )}
          />

          <View style={{ gap: 8 }}>
            <Text variant="ui/label-strong">{t('requests.categoryLabel')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map((c) => (
                <SegmentButton
                  key={c}
                  label={t(`requests.category.${c}`)}
                  selected={category === c}
                  onPress={() => setValue('category', c, { shouldValidate: true })}
                />
              ))}
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text variant="ui/label-strong">{t('requests.priorityLabel')}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {PRIORITIES.map((p) => (
                <SegmentButton
                  key={p}
                  label={t(`requests.priority.${p}`)}
                  selected={priority === p}
                  onPress={() => setValue('priority', p, { shouldValidate: true })}
                />
              ))}
            </View>
          </View>

          <PhotoPickerField
            label={t('requests.photosLabel')}
            value={photos}
            onChange={setPhotosState}
          />

          <Button
            label={t('requests.submit')}
            onPress={onSubmit}
            loading={create.isPending}
            disabled={photos.length > MAX_PHOTOS}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SegmentButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: selected ? color.ink : color.line,
        backgroundColor: selected ? color.ink : color.paper,
        minHeight: 44,
        justifyContent: 'center',
      }}
    >
      <Text variant="ui/label-strong" style={{ color: selected ? color.paper : color.ink }}>
        {label}
      </Text>
    </Pressable>
  );
}
