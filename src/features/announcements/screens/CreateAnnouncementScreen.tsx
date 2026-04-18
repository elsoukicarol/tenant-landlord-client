import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { z } from 'zod';

import { isApiError } from '@/api/errors';
import { Banner, Button, Input, Screen, Text } from '@/components/ui';
import { useBuildingList, useBuildingUnits } from '@/features/buildings/api';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

import { useCreateAnnouncement } from '../api';
import { ANNOUNCEMENT_TYPES } from '../types';

const schema = z.object({
  buildingId: z.string().uuid('announcements.selectBuilding'),
  title: z.string().trim().min(3, 'announcements.titleTooShort'),
  message: z.string().trim().min(10, 'announcements.messageTooShort'),
  type: z.enum(ANNOUNCEMENT_TYPES),
});
type FormInput = z.infer<typeof schema>;

type Audience = 'all' | 'units';

export function CreateAnnouncementScreen() {
  const navigation = useNavigation();
  const create = useCreateAnnouncement();
  const buildings = useBuildingList();
  const [audience, setAudience] = useState<Audience>('all');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  const { control, handleSubmit, watch, setValue } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { buildingId: '', title: '', message: '', type: 'GENERAL' },
    mode: 'onBlur',
  });

  const buildingList = buildings.data?.pages.flatMap((p) => p.data) ?? [];
  const buildingId = watch('buildingId');
  const type = watch('type');
  const unitsQuery = useBuildingUnits(buildingId || undefined);

  const toggleUnit = (id: string) => {
    setSelectedUnits((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onSubmit = handleSubmit((values) => {
    create.mutate(
      {
        ...values,
        unitIds: audience === 'units' ? selectedUnits : undefined,
      },
      { onSuccess: () => navigation.goBack() },
    );
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 40 }}>
          <Text variant="display/screen-title">{t('announcements.new')}</Text>

          {create.isError && isApiError(create.error) ? (
            <Banner tone="danger" message={create.error.message} />
          ) : null}

          <View style={{ gap: 8 }}>
            <Text variant="ui/label-strong">{t('expenses.buildingLabel')}</Text>
            {buildings.isLoading ? (
              <Text variant="body/small">{t('common.loading')}</Text>
            ) : (
              buildingList.map((b) => (
                <Pressable
                  key={b.id}
                  onPress={() => {
                    setValue('buildingId', b.id, { shouldValidate: true });
                    setSelectedUnits([]);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: buildingId === b.id }}
                  style={{
                    minHeight: 48,
                    padding: 12,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: buildingId === b.id ? color.ink : color.line,
                    backgroundColor: buildingId === b.id ? color.ink : color.paper,
                  }}
                >
                  <Text
                    variant="ui/label-strong"
                    style={{ color: buildingId === b.id ? color.paper : color.ink }}
                  >
                    {b.name}
                  </Text>
                </Pressable>
              ))
            )}
          </View>

          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <Input
                label={t('announcements.titleLabel')}
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
            name="message"
            render={({ field, fieldState }) => (
              <Input
                label={t('announcements.messageLabel')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                multiline
                numberOfLines={5}
                style={{ minHeight: 110, textAlignVertical: 'top' }}
                editable={!create.isPending}
                error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
              />
            )}
          />

          <View style={{ gap: 8 }}>
            <Text variant="ui/label-strong">{t('announcements.typeLabel')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ANNOUNCEMENT_TYPES.map((ty) => (
                <Pressable
                  key={ty}
                  onPress={() => setValue('type', ty, { shouldValidate: true })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: type === ty }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: type === ty ? color.ink : color.line,
                    backgroundColor: type === ty ? color.ink : color.paper,
                    minHeight: 44,
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    variant="ui/label-strong"
                    style={{ color: type === ty ? color.paper : color.ink }}
                  >
                    {t(`announcements.type.${ty}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text variant="ui/label-strong">{t('announcements.audienceLabel')}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <AudienceOption
                label={t('announcements.audienceAll')}
                selected={audience === 'all'}
                onPress={() => setAudience('all')}
              />
              <AudienceOption
                label={t('announcements.audienceSpecificUnits')}
                selected={audience === 'units'}
                onPress={() => setAudience('units')}
              />
            </View>
          </View>

          {audience === 'units' && buildingId ? (
            <View style={{ gap: 8 }}>
              <Text variant="eyebrow">{t('buildings.unitsHeader')}</Text>
              {(unitsQuery.data ?? []).map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() => toggleUnit(u.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selectedUnits.includes(u.id) }}
                  style={{
                    minHeight: 48,
                    padding: 12,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: selectedUnits.includes(u.id) ? color.ink : color.line,
                    backgroundColor: selectedUnits.includes(u.id) ? color.accentSoft : color.paper,
                  }}
                >
                  <Text variant="ui/label-strong">
                    {t('buildings.unitNumber', { number: u.number })}
                  </Text>
                  {u.tenant ? <Text variant="body/small">{u.tenant.name}</Text> : null}
                </Pressable>
              ))}
            </View>
          ) : null}

          <Button
            label={t('announcements.publish')}
            onPress={onSubmit}
            loading={create.isPending}
            disabled={audience === 'units' && selectedUnits.length === 0}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function AudienceOption({
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
        flex: 1,
        minHeight: 44,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: selected ? color.ink : color.line,
        backgroundColor: selected ? color.ink : color.paper,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text variant="ui/label-strong" style={{ color: selected ? color.paper : color.ink }}>
        {label}
      </Text>
    </Pressable>
  );
}
