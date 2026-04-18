import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { z } from 'zod';

import { isApiError } from '@/api/errors';
import { Banner, Button, Input, Screen, Text } from '@/components/ui';
import { selectRole, useAuthStore } from '@/features/auth/store';
import { useBuildingList, useBuildingUnits } from '@/features/buildings/api';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

import { useCreateInvitation } from '../api';

const schema = z.object({
  email: z.string().trim().email('auth.invalidEmail'),
  role: z.enum(['TENANT', 'MAINTAINER']),
  buildingId: z.string().uuid('invitations.selectBuilding'),
  unitId: z.string().uuid().optional(),
});
type FormInput = z.infer<typeof schema>;

export function NewInvitationScreen() {
  const navigation = useNavigation();
  const create = useCreateInvitation();
  const buildings = useBuildingList();
  const callerRole = useAuthStore(selectRole);

  const { control, handleSubmit, watch, setValue } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'TENANT', buildingId: '', unitId: undefined },
    mode: 'onBlur',
  });

  const buildingList = buildings.data?.pages.flatMap((p) => p.data) ?? [];
  const role = watch('role');
  const buildingId = watch('buildingId');
  const unitId = watch('unitId');
  const unitsQuery = useBuildingUnits(buildingId || undefined);

  const onSubmit = handleSubmit((values) => {
    create.mutate(values, { onSuccess: () => navigation.goBack() });
  });

  const rolesAllowed: ('TENANT' | 'MAINTAINER')[] =
    callerRole === 'maintainer' ? ['TENANT'] : ['TENANT', 'MAINTAINER'];

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 40 }}>
          <Text variant="display/screen-title">{t('invitations.new')}</Text>

          {create.isError && isApiError(create.error) ? (
            <Banner tone="danger" message={create.error.message} />
          ) : null}

          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Input
                label={t('auth.email')}
                placeholder={t('auth.emailPlaceholder')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!create.isPending}
                error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
              />
            )}
          />

          {rolesAllowed.length > 1 ? (
            <View style={{ gap: 8 }}>
              <Text variant="ui/label-strong">{t('invitations.roleLabel')}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {rolesAllowed.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setValue('role', r, { shouldValidate: true })}
                    accessibilityRole="button"
                    accessibilityState={{ selected: role === r }}
                    style={{
                      flex: 1,
                      minHeight: 44,
                      paddingVertical: 10,
                      borderRadius: radius.lg,
                      borderWidth: 1,
                      borderColor: role === r ? color.ink : color.line,
                      backgroundColor: role === r ? color.ink : color.paper,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      variant="ui/label-strong"
                      style={{ color: role === r ? color.paper : color.ink }}
                    >
                      {t(`roles.${r.toLowerCase()}`, { defaultValue: r })}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
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
                    setValue('unitId', undefined);
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

          {role === 'TENANT' && buildingId ? (
            <View style={{ gap: 8 }}>
              <Text variant="ui/label-strong">{t('invitations.unitLabel')}</Text>
              {(unitsQuery.data ?? []).map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() =>
                    setValue('unitId', unitId === u.id ? undefined : u.id, {
                      shouldValidate: true,
                    })
                  }
                  accessibilityRole="button"
                  accessibilityState={{ selected: unitId === u.id }}
                  style={{
                    minHeight: 48,
                    padding: 12,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: unitId === u.id ? color.ink : color.line,
                    backgroundColor: unitId === u.id ? color.accentSoft : color.paper,
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
            label={t('invitations.send')}
            onPress={onSubmit}
            loading={create.isPending}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
