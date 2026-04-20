import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { z } from 'zod';

import { isApiError } from '@/api/errors';
import { Banner, Button, Input, Screen, Text } from '@/components/ui';
import { useUpdateMe } from '@/features/auth/api';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

const schema = z.object({
  name: z.string().trim().min(2, 'auth.nameTooShort'),
});
type FormInput = z.infer<typeof schema>;

export function PersonalDetailsScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(selectUser);
  const updateMe = useUpdateMe();

  const { control, handleSubmit, formState } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '' },
    mode: 'onBlur',
  });

  if (!user) return <Screen />;

  const onSubmit = handleSubmit((values) => {
    updateMe.mutate({ name: values.name.trim() }, { onSuccess: () => navigation.goBack() });
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 18, paddingVertical: 12 }}>
        <View style={{ gap: 6 }}>
          <Text variant="display/section">{t('profile.personalDetails')}</Text>
          <Text variant="ui/tiny" style={{ color: color.inkMute }}>
            {t('profile.personalDetailsSubtitle')}
          </Text>
        </View>

        {updateMe.isError && isApiError(updateMe.error) ? (
          <Banner tone="danger" message={updateMe.error.message} />
        ) : null}

        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Input
              label={t('auth.fullName')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              editable={!updateMe.isPending}
              autoCapitalize="words"
              error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
            />
          )}
        />

        <Input
          label={t('auth.email')}
          value={user.email}
          editable={false}
          hint={t('profile.emailImmutable')}
        />

        <Button
          label={t('common.save')}
          variant="primary"
          onPress={onSubmit}
          loading={updateMe.isPending}
          disabled={!formState.isDirty || !formState.isValid}
          fullWidth
        />
      </ScrollView>
    </Screen>
  );
}
