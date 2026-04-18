import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { z } from 'zod';

import { isApiError } from '@/api/errors';
import { Banner, Button, Input, Screen, Text } from '@/components/ui';
import { useBuildingList } from '@/features/buildings/api';
import { CATEGORIES } from '@/features/requests/types';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

import { useCreateExpense } from '../api';

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

const schema = z.object({
  buildingId: z.string().uuid('expenses.selectBuilding'),
  description: z.string().trim().min(2, 'expenses.descriptionRequired'),
  amount: z
    .string()
    .refine(
      (v) => Number.isFinite(Number(v.replace(',', '.'))) && Number(v.replace(',', '.')) > 0,
      'expenses.amountInvalid',
    ),
  category: z.enum(CATEGORIES),
});
type FormInput = z.infer<typeof schema>;

type Receipt = { uri: string; name: string; type: string; size: number };

export function CreateExpenseScreen() {
  const navigation = useNavigation();
  const create = useCreateExpense();
  const buildings = useBuildingList();
  const [date, setDate] = useState(() => new Date());
  const [pickerOpen, setPickerOpen] = useState(Platform.OS === 'ios');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const { control, handleSubmit, watch, setValue } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { buildingId: '', description: '', amount: '', category: 'PLUMBING' },
    mode: 'onBlur',
  });

  const buildingList = buildings.data?.pages.flatMap((p) => p.data) ?? [];
  const buildingId = watch('buildingId');
  const category = watch('category');

  const pickReceipt = async () => {
    setReceiptError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    if (asset.size && asset.size > MAX_RECEIPT_BYTES) {
      setReceiptError(t('expenses.receiptTooLarge'));
      return;
    }
    setReceipt({
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? 'application/octet-stream',
      size: asset.size ?? 0,
    });
  };

  const onSubmit = handleSubmit((values) => {
    create.mutate(
      {
        buildingId: values.buildingId,
        description: values.description,
        amount: Number(values.amount.replace(',', '.')),
        category: values.category,
        date: isoDate(date),
        receipt: receipt ?? undefined,
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
          <Text variant="display/screen-title">{t('expenses.new')}</Text>

          {create.isError && isApiError(create.error) ? (
            <Banner tone="danger" message={create.error.message} />
          ) : null}

          <View style={{ gap: 8 }}>
            <Text variant="ui/label-strong">{t('expenses.buildingLabel')}</Text>
            {buildings.isLoading ? (
              <Text variant="body/small">{t('common.loading')}</Text>
            ) : (
              <View style={{ gap: 8 }}>
                {buildingList.map((b) => (
                  <Pressable
                    key={b.id}
                    onPress={() => setValue('buildingId', b.id, { shouldValidate: true })}
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
                    <Text
                      variant="body/small"
                      style={{ color: buildingId === b.id ? color.paper : color.inkMute }}
                    >
                      {b.address}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Input
                label={t('expenses.descriptionLabel')}
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
            name="amount"
            render={({ field, fieldState }) => (
              <Input
                label={t('expenses.amountLabel')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="decimal-pad"
                editable={!create.isPending}
                error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
              />
            )}
          />

          <View style={{ gap: 8 }}>
            <Text variant="ui/label-strong">{t('requests.categoryLabel')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setValue('category', c, { shouldValidate: true })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: category === c }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: category === c ? color.ink : color.line,
                    backgroundColor: category === c ? color.ink : color.paper,
                    minHeight: 44,
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    variant="ui/label-strong"
                    style={{ color: category === c ? color.paper : color.ink }}
                  >
                    {t(`requests.category.${c}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text variant="ui/label-strong">{t('expenses.dateLabel')}</Text>
            {Platform.OS === 'android' && !pickerOpen ? (
              <Pressable
                onPress={() => setPickerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={t('expenses.dateLabel')}
                style={{
                  minHeight: 48,
                  borderWidth: 1,
                  borderColor: color.line,
                  borderRadius: radius.lg,
                  paddingHorizontal: 14,
                  justifyContent: 'center',
                }}
              >
                <Text variant="body/default">{date.toLocaleDateString()}</Text>
              </Pressable>
            ) : null}
            {pickerOpen ? (
              <DateTimePicker
                value={date}
                mode="date"
                onChange={(event, selected) => {
                  if (Platform.OS === 'android') setPickerOpen(false);
                  if (event.type === 'set' && selected) setDate(selected);
                }}
                maximumDate={new Date()}
              />
            ) : null}
          </View>

          <View style={{ gap: 8 }}>
            <Text variant="ui/label-strong">{t('expenses.receiptOptional')}</Text>
            <Pressable
              onPress={pickReceipt}
              accessibilityRole="button"
              accessibilityLabel={t('expenses.attachReceipt')}
              style={{
                borderRadius: radius.lg,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: color.line,
                padding: 16,
                alignItems: 'center',
                minHeight: 56,
                justifyContent: 'center',
              }}
            >
              <Text variant="ui/label">{receipt ? receipt.name : t('expenses.attachReceipt')}</Text>
            </Pressable>
            {receiptError ? (
              <Text variant="ui/caption" style={{ color: color.danger }}>
                {receiptError}
              </Text>
            ) : null}
          </View>

          <Button
            label={t('expenses.submit')}
            onPress={onSubmit}
            loading={create.isPending}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
