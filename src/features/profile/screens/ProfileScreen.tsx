import { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';

import { Button, Card, Chip, Input, Screen, Text } from '@/components/ui';
import { useLogout, useUpdateMe } from '@/features/auth/api';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { unregisterPushToken } from '@/features/devices/api';
import { type Language, setLanguage, t } from '@/lib/i18n';
import { color, radius } from '@/theme';

export function ProfileScreen() {
  const user = useAuthStore(selectUser);
  const updateMe = useUpdateMe();
  const logout = useLogout();

  const [name, setName] = useState(user?.name ?? '');
  const [language, setLang] = useState<Language>(user?.language ?? 'es');
  const [prefs, setPrefs] = useState(
    user?.notificationPrefs ?? {
      pushEnabled: true,
      urgentOnly: false,
      emailEnabled: true,
    },
  );

  if (!user) return <Screen />;

  const hasChanges =
    name.trim() !== user.name ||
    language !== user.language ||
    JSON.stringify(prefs) !== JSON.stringify(user.notificationPrefs ?? {});

  const save = () => {
    updateMe.mutate(
      {
        name: name.trim(),
        language,
        notificationPrefs: prefs,
      },
      {
        onSuccess: () => {
          setLanguage(language);
        },
      },
    );
  };

  const signOut = async () => {
    await unregisterPushToken();
    logout.mutate();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 40 }}>
        <Text variant="display/screen-title">{t('profile.title')}</Text>

        <Card style={{ gap: 12 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.pill,
              backgroundColor: color.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="display/card-title" style={{ color: color.accent }}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text variant="ui/label">{user.email}</Text>
          <Text variant="ui/tiny" style={{ textTransform: 'uppercase' }}>
            {t(`roles.${user.role}`, { defaultValue: user.role })}
          </Text>
        </Card>

        <Input
          label={t('auth.fullName')}
          value={name}
          onChangeText={setName}
          editable={!updateMe.isPending}
          accessibilityLabel={t('auth.fullName')}
        />

        <View style={{ gap: 8 }}>
          <Text variant="ui/label-strong">{t('profile.language')}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="Español" selected={language === 'es'} onPress={() => setLang('es')} />
            <Chip label="English" selected={language === 'en'} onPress={() => setLang('en')} />
          </View>
        </View>

        <Card style={{ gap: 16 }}>
          <Text variant="ui/label-strong">{t('profile.notifications')}</Text>
          <PrefRow
            label={t('profile.pushEnabled')}
            value={prefs.pushEnabled}
            onValueChange={(v) => setPrefs({ ...prefs, pushEnabled: v })}
          />
          <PrefRow
            label={t('profile.urgentOnly')}
            value={prefs.urgentOnly}
            onValueChange={(v) => setPrefs({ ...prefs, urgentOnly: v })}
          />
          <PrefRow
            label={t('profile.emailEnabled')}
            value={prefs.emailEnabled}
            onValueChange={(v) => setPrefs({ ...prefs, emailEnabled: v })}
          />
        </Card>

        <Button
          label={t('common.save')}
          onPress={save}
          loading={updateMe.isPending}
          disabled={!hasChanges}
          fullWidth
        />

        <Button
          label={t('auth.signOut')}
          variant="secondary"
          onPress={signOut}
          loading={logout.isPending}
          fullWidth
        />
      </ScrollView>
    </Screen>
  );
}

function PrefRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
      }}
    >
      <Text variant="body/default" style={{ flex: 1 }}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        trackColor={{ false: color.line, true: color.accent }}
      />
    </View>
  );
}
