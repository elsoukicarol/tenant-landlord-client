import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { isApiError } from '@/api/errors';
import { Banner, Button, Input, Screen, Text } from '@/components/ui';
import { t } from '@/lib/i18n';
import type { UnauthedStackParamList } from '@/navigation/types';

import { useResetPassword } from '../api';
import { type ResetPasswordInput, resetPasswordSchema } from '../schemas';

type RouteT = RouteProp<UnauthedStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen() {
  const route = useRoute<RouteT>();
  const navigation = useNavigation();
  const reset = useResetPassword();
  const [visible, setVisible] = useState(false);

  const { control, handleSubmit } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    reset.mutate({ ...values, token: route.params.token });
  });

  const errorMessage =
    reset.isError && isApiError(reset.error)
      ? reset.error.isValidation || reset.error.isNotFound
        ? t('auth.invalidResetToken')
        : reset.error.message
      : null;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text variant="display/screen-title">{t('auth.resetPasswordTitle')}</Text>
            <Text variant="body/default">{t('auth.resetPasswordSubtitle')}</Text>
          </View>

          {reset.isSuccess ? <Banner tone="ok" message={t('auth.resetSuccess')} /> : null}

          {errorMessage ? <Banner tone="danger" message={errorMessage} /> : null}

          <View style={{ gap: 16 }}>
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
                  editable={!reset.isPending && !reset.isSuccess}
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
                  editable={!reset.isPending && !reset.isSuccess}
                  accessibilityLabel={t('auth.confirmPassword')}
                  error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
                />
              )}
            />

            <Button
              label={reset.isSuccess ? t('auth.signIn') : t('common.save')}
              onPress={() => (reset.isSuccess ? navigation.goBack() : onSubmit())}
              loading={reset.isPending}
              fullWidth
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
