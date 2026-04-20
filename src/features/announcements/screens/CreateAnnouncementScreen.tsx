import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { z } from 'zod';

import { isApiError } from '@/api/errors';
import {
  AccentItalic,
  Banner,
  DropdownField,
  Input,
  PickerSheet,
  Screen,
  Text,
} from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { useBuildingList, useBuildingUnits } from '@/features/buildings/api';
import { formatDate } from '@/lib/date';
import { t } from '@/lib/i18n';
import { color, radius, shadow } from '@/theme';

import { useCreateAnnouncement } from '../api';
import { ANNOUNCEMENT_TYPES, type AnnouncementType } from '../types';

const schema = z.object({
  buildingId: z.string().uuid('announcements.selectBuilding'),
  title: z.string().trim().min(3, 'announcements.titleTooShort'),
  message: z.string().trim().min(10, 'announcements.messageTooShort'),
  type: z.enum(ANNOUNCEMENT_TYPES),
});
type FormInput = z.infer<typeof schema>;

type Audience = 'all' | 'units';

const TYPE_LABEL_KEYS: Record<AnnouncementType, string> = {
  GENERAL: 'announcements.typeShort.GENERAL',
  MAINTENANCE: 'announcements.typeShort.MAINTENANCE',
  EMERGENCY: 'announcements.typeShort.EMERGENCY',
  RULE_UPDATE: 'announcements.typeShort.RULE_UPDATE',
};

const TYPE_SELECTED_BG: Record<AnnouncementType, string> = {
  GENERAL: color.ink,
  MAINTENANCE: color.info,
  EMERGENCY: color.danger,
  RULE_UPDATE: color.ink,
};

export function CreateAnnouncementScreen() {
  const navigation = useNavigation();
  const create = useCreateAnnouncement();
  const buildings = useBuildingList();
  const locale = useAuthStore((s) => s.user?.language) ?? 'en';

  const [audience, setAudience] = useState<Audience>('all');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [buildingSheetOpen, setBuildingSheetOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { buildingId: '', title: '', message: '', type: 'GENERAL' },
    mode: 'onBlur',
  });

  const buildingList = useMemo(
    () => buildings.data?.pages.flatMap((p) => p.data) ?? [],
    [buildings.data],
  );
  const buildingId = watch('buildingId');
  const currentType = watch('type');
  const unitsQuery = useBuildingUnits(buildingId || undefined);
  const selectedBuilding = buildingList.find((b) => b.id === buildingId);
  const unitCount = unitsQuery.data?.length ?? selectedBuilding?.unitCount ?? 0;

  const buildingOptions = useMemo(
    () =>
      buildingList.map((b) => ({
        value: b.id,
        label: b.name,
        sublabel: b.address,
      })),
    [buildingList],
  );

  const toggleUnit = (id: string) =>
    setSelectedUnits((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onSubmit = handleSubmit((values) => {
    create.mutate(
      {
        ...values,
        scheduledDate: scheduledDate ? scheduledDate.toISOString() : undefined,
        unitIds: audience === 'units' ? selectedUnits : undefined,
      },
      { onSuccess: () => navigation.goBack() },
    );
  });

  const heroSubtitle = t('announcements.heroSubtitle');

  return (
    <Screen edges={['top', 'bottom']} padding={0}>
      <CloseBar title={t('announcements.new')} onClose={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 20,
              gap: 6,
              backgroundColor: color.paperWarm,
              borderBottomWidth: 1,
              borderBottomColor: color.lineSoft,
            }}
          >
            <Text variant="display/section">
              {t('announcements.heroPrefix')}
              <AccentItalic>{t('announcements.heroItalic')}</AccentItalic>
            </Text>
            <Text variant="ui/tiny" style={{ color: color.inkMute }}>
              {heroSubtitle}
            </Text>
          </View>

          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 18,
              gap: 14,
            }}
          >
            {create.isError && isApiError(create.error) ? (
              <Banner tone="danger" message={create.error.message} />
            ) : null}

            <DropdownField
              label={t('announcements.buildingLabel')}
              value={selectedBuilding?.name ?? ''}
              placeholder={
                buildings.isLoading ? t('common.loading') : t('announcements.selectBuilding')
              }
              onPress={() => setBuildingSheetOpen(true)}
              disabled={buildings.isLoading || buildingList.length === 0}
            />

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
                  numberOfLines={4}
                  style={{ minHeight: 90, textAlignVertical: 'top' }}
                  editable={!create.isPending}
                  error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
                />
              )}
            />

            <View style={{ gap: 6 }}>
              <Text variant="eyebrow" style={{ color: color.inkMute }}>
                {t('announcements.typeLabel')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 5 }}>
                {ANNOUNCEMENT_TYPES.map((ty) => {
                  const selected = currentType === ty;
                  const bg = selected ? TYPE_SELECTED_BG[ty] : color.paper;
                  const border = selected ? TYPE_SELECTED_BG[ty] : color.line;
                  const fg = selected ? color.paper : color.inkSoft;
                  return (
                    <Pressable
                      key={ty}
                      onPress={() => setValue('type', ty, { shouldValidate: true })}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      hitSlop={4}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 4,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: border,
                        backgroundColor: bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <Text
                        variant="ui/pill"
                        style={{
                          color: fg,
                          fontSize: 9,
                          letterSpacing: 0.18,
                          textTransform: 'uppercase',
                        }}
                      >
                        {t(TYPE_LABEL_KEYS[ty])}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <DropdownField
              label={t('announcements.scheduledFor')}
              value={scheduledDate ? formatDate(scheduledDate, 'EEE, MMM d · HH:mm', locale) : ''}
              placeholder={t('announcements.scheduledPlaceholder')}
              onPress={() => setDatePickerOpen(true)}
            />
            {datePickerOpen ? (
              <DateTimePicker
                value={scheduledDate ?? new Date()}
                mode="datetime"
                onChange={(event, selected) => {
                  if (Platform.OS === 'android') setDatePickerOpen(false);
                  if (event.type === 'set' && selected) {
                    setScheduledDate(selected);
                  }
                  if (event.type === 'dismissed') setDatePickerOpen(false);
                }}
                minimumDate={new Date()}
              />
            ) : null}
            {scheduledDate ? (
              <Pressable
                onPress={() => setScheduledDate(null)}
                accessibilityRole="button"
                hitSlop={6}
                style={{ alignSelf: 'flex-start' }}
              >
                <Text variant="ui/caption" style={{ color: color.inkMute }}>
                  {t('common.clear')}
                </Text>
              </Pressable>
            ) : null}

            <View style={{ gap: 6 }}>
              <Text variant="eyebrow" style={{ color: color.inkMute }}>
                {t('announcements.audienceLabel')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 2,
                  padding: 4,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: color.line,
                  backgroundColor: color.paperWarm,
                }}
              >
                <SegmentOption
                  label={t('announcements.audienceAllWithCount', { count: pad(unitCount) })}
                  selected={audience === 'all'}
                  onPress={() => setAudience('all')}
                />
                <SegmentOption
                  label={t('announcements.audienceSpecificUnits')}
                  selected={audience === 'units'}
                  onPress={() => setAudience('units')}
                />
              </View>
            </View>

            {audience === 'units' && buildingId ? (
              <View style={{ gap: 8 }}>
                {(unitsQuery.data ?? []).map((u) => (
                  <Pressable
                    key={u.id}
                    onPress={() => toggleUnit(u.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selectedUnits.includes(u.id) }}
                    style={{
                      minHeight: 46,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: radius.lg,
                      borderWidth: 1,
                      borderColor: selectedUnits.includes(u.id) ? color.ink : color.line,
                      backgroundColor: selectedUnits.includes(u.id)
                        ? color.accentSoft
                        : color.paperWarm,
                    }}
                  >
                    <Text variant="ui/label-strong">
                      {t('buildings.unitNumber', { number: u.label })}
                    </Text>
                    {u.tenant ? <Text variant="body/small">{u.tenant.name}</Text> : null}
                  </Pressable>
                ))}
              </View>
            ) : null}

            <SendButton
              label={t('announcements.send')}
              onPress={onSubmit}
              loading={create.isPending}
              disabled={audience === 'units' && selectedUnits.length === 0}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerSheet
        visible={buildingSheetOpen}
        title={t('announcements.buildingLabel')}
        options={buildingOptions}
        selectedValue={buildingId || undefined}
        onSelect={(v) => {
          setValue('buildingId', v, { shouldValidate: true });
          setSelectedUnits([]);
          setBuildingSheetOpen(false);
        }}
        onCancel={() => setBuildingSheetOpen(false)}
      />
    </Screen>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function CloseBar({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: color.lineSoft,
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        hitSlop={8}
      >
        <Ionicons name="close" size={20} color={color.ink} />
      </Pressable>
      <Text variant="ui/label" style={{ flex: 1, color: color.ink }}>
        {title}
      </Text>
    </View>
  );
}

function SegmentOption({
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
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 9,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? color.ink : 'transparent',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        variant="ui/pill"
        style={{
          color: selected ? color.paper : color.inkMute,
          fontSize: 10,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SendButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        {
          marginTop: 8,
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: radius.xl,
          backgroundColor: color.accent,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
        },
        shadow.fab,
      ]}
    >
      <Text
        variant="ui/button"
        style={{
          color: color.paper,
          fontSize: 13,
          letterSpacing: 0.26,
        }}
      >
        {label}
      </Text>
      <Ionicons name="checkmark" size={14} color={color.paper} />
    </Pressable>
  );
}
