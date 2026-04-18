import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { isApiError } from '@/api/errors';
import { Banner, Button, Input, Screen, Text } from '@/components/ui';
import { t } from '@/lib/i18n';

import { useForgotPassword } from '../api';
import { type ForgotPasswordInput, forgotPasswordSchema } from '../schemas';

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const forgot = useForgotPassword();

  const { control, handleSubmit } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    forgot.mutate(values);
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text variant="display/screen-title">{t('auth.forgotPasswordTitle')}</Text>
            <Text variant="body/default">{t('auth.forgotPasswordSubtitle')}</Text>
          </View>

          {forgot.isSuccess ? <Banner tone="ok" message={t('auth.resetSent')} /> : null}

          {forgot.isError && isApiError(forgot.error) ? (
            <Banner tone="danger" message={forgot.error.message} />
          ) : null}

          <View style={{ gap: 16 }}>
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
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!forgot.isPending && !forgot.isSuccess}
                  accessibilityLabel={t('auth.email')}
                  error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
                />
              )}
            />

            <Button
              label={forgot.isSuccess ? t('common.back') : t('auth.sendInstructions')}
              onPress={() => (forgot.isSuccess ? navigation.goBack() : onSubmit())}
              loading={forgot.isPending}
              fullWidth
            />

            {!forgot.isSuccess ? (
              <Button
                label={t('common.back')}
                onPress={() => navigation.goBack()}
                variant="ghost"
                fullWidth
                style={{ borderColor: 'transparent' }}
                accessibilityLabel={t('common.back')}
              />
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
