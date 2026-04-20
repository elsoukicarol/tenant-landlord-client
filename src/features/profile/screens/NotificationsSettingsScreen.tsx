import { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';

import { isApiError } from '@/api/errors';
import { Banner, Button, Screen, Text } from '@/components/ui';
import { useUpdateMe } from '@/features/auth/api';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { t } from '@/lib/i18n';
import { color, radius } from '@/theme';

const DEFAULT_PREFS = {
  pushEnabled: true,
  urgentOnly: false,
  emailEnabled: true,
};

export function NotificationsSettingsScreen() {
  const user = useAuthStore(selectUser);
  const updateMe = useUpdateMe();
  const [prefs, setPrefs] = useState(user?.notificationPrefs ?? DEFAULT_PREFS);

  if (!user) return <Screen />;

  const dirty = JSON.stringify(prefs) !== JSON.stringify(user.notificationPrefs ?? DEFAULT_PREFS);

  const save = () => updateMe.mutate({ notificationPrefs: prefs });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 18, paddingVertical: 12 }}>
        <View style={{ gap: 6 }}>
          <Text variant="display/section">{t('profile.notifications')}</Text>
          <Text variant="ui/tiny" style={{ color: color.inkMute }}>
            {t('profile.notificationsSubtitle')}
          </Text>
        </View>

        {updateMe.isError && isApiError(updateMe.error) ? (
          <Banner tone="danger" message={updateMe.error.message} />
        ) : null}

        <View
          style={{
            borderWidth: 1,
            borderColor: color.line,
            borderRadius: radius.lg,
            backgroundColor: color.paperWarm,
          }}
        >
          <PrefRow
            label={t('profile.pushEnabled')}
            description={t('profile.pushEnabledHint')}
            value={prefs.pushEnabled}
            onValueChange={(v) => setPrefs({ ...prefs, pushEnabled: v })}
          />
          <Divider />
          <PrefRow
            label={t('profile.urgentOnly')}
            description={t('profile.urgentOnlyHint')}
            value={prefs.urgentOnly}
            onValueChange={(v) => setPrefs({ ...prefs, urgentOnly: v })}
            disabled={!prefs.pushEnabled}
          />
          <Divider />
          <PrefRow
            label={t('profile.emailEnabled')}
            description={t('profile.emailEnabledHint')}
            value={prefs.emailEnabled}
            onValueChange={(v) => setPrefs({ ...prefs, emailEnabled: v })}
            isLast
          />
        </View>

        <Button
          label={t('common.save')}
          variant="primary"
          onPress={save}
          loading={updateMe.isPending}
          disabled={!dirty}
          fullWidth
        />
      </ScrollView>
    </Screen>
  );
}

function PrefRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
  isLast,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="ui/label" style={{ color: color.ink }}>
          {label}
        </Text>
        {description ? (
          <Text variant="ui/tiny" style={{ color: color.inkMute }}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
        trackColor={{ false: color.line, true: color.accent }}
      />
      {isLast ? null : null}
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: color.lineSoft }} />;
}
