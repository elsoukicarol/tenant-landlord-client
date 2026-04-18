import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

import { isApiError } from '@/api/errors';
import { AccentItalic, Button, Input, Screen, Text } from '@/components/ui';
import { LockoutBanner } from '@/features/auth/components/LockoutBanner';
import { registerPushToken } from '@/features/devices/api';
import { t } from '@/lib/i18n';
import type { UnauthedStackParamList } from '@/navigation/types';
import { color } from '@/theme';

import { useLogin } from '../api';
import { type LoginInput, loginSchema } from '../schemas';

type Nav = NativeStackNavigationProp<UnauthedStackParamList, 'SignIn'>;

export function SignInScreen() {
  const navigation = useNavigation<Nav>();
  const login = useLogin();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    setSubmitError(null);
    login.mutate(values, {
      onSuccess: () => {
        setLockoutUntil(null);
        void registerPushToken();
      },
      onError: (err) => {
        if (isApiError(err) && err.isLocked && err.lockoutUntil) {
          setLockoutUntil(err.lockoutUntil);
          return;
        }
        if (isApiError(err) && err.statusCode === 401) {
          setSubmitError(t('auth.invalidCredentials'));
          return;
        }
        setSubmitError(isApiError(err) ? err.message : t('common.unknownError'));
      },
    });
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text variant="display/hero">
              {t('auth.signInHeroPrefix')}
              <AccentItalic>{t('auth.signInHeroItalic')}</AccentItalic>
              {t('auth.signInHeroSuffix')}
            </Text>
            <Text variant="body/lead">{t('auth.signInSubtitle')}</Text>
          </View>

          {lockoutUntil ? <LockoutBanner lockoutUntil={lockoutUntil} /> : null}

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
                  textContentType="emailAddress"
                  accessibilityLabel={t('auth.email')}
                  editable={!login.isPending}
                  error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Input
                  label={t('auth.password')}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  secureTextEntry={!passwordVisible}
                  autoComplete="password"
                  textContentType="password"
                  accessibilityLabel={t('auth.password')}
                  editable={!login.isPending}
                  error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
                  returnKeyType="go"
                  onSubmitEditing={onSubmit}
                  rightAction={{
                    label: passwordVisible ? t('common.hide') : t('common.show'),
                    onPress: () => setPasswordVisible((v) => !v),
                    accessibilityLabel: passwordVisible ? t('common.hide') : t('common.show'),
                  }}
                />
              )}
            />

            {submitError ? (
              <Text variant="ui/caption" style={{ color: color.danger }}>
                {submitError}
              </Text>
            ) : null}

            <Button
              label={t('auth.signIn')}
              onPress={onSubmit}
              loading={login.isPending}
              disabled={!formState.isValid && formState.submitCount > 0}
              fullWidth
            />

            <Pressable
              onPress={() => navigation.navigate('ForgotPassword')}
              hitSlop={8}
              accessibilityRole="link"
              accessibilityLabel={t('auth.forgotPassword')}
              style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center' }}
            >
              <Text variant="ui/label" style={{ color: color.inkMute }}>
                {t('auth.forgotPassword')}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
