import { zodResolver } from '@hookform/resolvers/zod';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';

import { isApiError } from '@/api/errors';
import { Banner, Button, Card, Input, Pill, Screen, Text } from '@/components/ui';
import { registerPushToken } from '@/features/devices/api';
import { t } from '@/lib/i18n';
import type { UnauthedStackParamList } from '@/navigation/types';
import { color } from '@/theme';

import { useAcceptInvitation, useInvitationByToken } from '../api';
import { type AcceptInvitationInput, acceptInvitationSchema } from '../schemas';

type RouteT = RouteProp<UnauthedStackParamList, 'InvitationAccept'>;

export function InvitationAcceptScreen() {
  const route = useRoute<RouteT>();
  const token = route.params.token;
  const preview = useInvitationByToken(token);
  const accept = useAcceptInvitation(token);
  const [visible, setVisible] = useState(false);

  const { control, handleSubmit } = useForm<AcceptInvitationInput>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { name: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    accept.mutate(values, {
      onSuccess: () => {
        void registerPushToken();
      },
    });
  });

  if (preview.isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      </Screen>
    );
  }

  if (preview.isError) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
          <Banner tone="danger" message={t('auth.invitationInvalid')} />
        </View>
      </Screen>
    );
  }

  const inv = preview.data;
  const buildingName = inv?.building?.name;
  const unitNumber = inv?.unit?.number;
  const inviterName = inv?.inviter?.name;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', gap: 20 }}>
          <Text variant="display/screen-title">{t('auth.invitationTitle')}</Text>

          {inv ? (
            <Card>
              <View style={{ gap: 6 }}>
                {inviterName ? (
                  <Text variant="body/default">
                    {t('auth.invitationFrom', { name: inviterName })}
                  </Text>
                ) : null}
                {buildingName ? (
                  <Text variant="display/card-title">
                    {t('auth.invitationToBuilding', { building: buildingName })}
                  </Text>
                ) : null}
                {unitNumber ? (
                  <Text variant="body/small">
                    {t('auth.invitationToUnit', { unit: unitNumber })}
                  </Text>
                ) : null}
                <View style={{ flexDirection: 'row', marginTop: 6 }}>
                  <Pill
                    tone="accent"
                    label={t('auth.invitationRole', {
                      role: t(`roles.${inv.role}`),
                    })}
                  />
                </View>
              </View>
            </Card>
          ) : null}

          {accept.isError && isApiError(accept.error) ? (
            <Banner tone="danger" message={accept.error.message} />
          ) : null}

          <View style={{ gap: 16 }}>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label={t('auth.fullName')}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  autoComplete="name"
                  textContentType="name"
                  editable={!accept.isPending}
                  accessibilityLabel={t('auth.fullName')}
                  error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Input
                  label={t('auth.newPassword')}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  secureTextEntry={!visible}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  textContentType="newPassword"
                  editable={!accept.isPending}
                  accessibilityLabel={t('auth.newPassword')}
                  error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
                  rightAction={{
                    label: visible ? t('common.hide') : t('common.show'),
                    onPress: () => setVisible((v) => !v),
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Input
                  label={t('auth.confirmPassword')}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  secureTextEntry={!visible}
                  autoCapitalize="none"
                  editable={!accept.isPending}
                  accessibilityLabel={t('auth.confirmPassword')}
                  error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
                />
              )}
            />

            <Button
              label={t('auth.createAccount')}
              onPress={onSubmit}
              loading={accept.isPending}
              fullWidth
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
