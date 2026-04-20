import { Ionicons } from '@expo/vector-icons';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { useLogout } from '@/features/auth/api';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { unregisterPushToken } from '@/features/devices/api';
import { i18n, t } from '@/lib/i18n';
import { color, radius } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const user = useAuthStore(selectUser);
  const logout = useLogout();

  if (!user) return <Screen />;

  const initials = getInitials(user.name);
  const prefs = user.notificationPrefs;
  const notificationSummary = prefs
    ? prefs.urgentOnly
      ? t('profile.urgentOnly')
      : prefs.pushEnabled
        ? t('profile.allEnabled')
        : t('profile.muted')
    : undefined;
  const languageLabel = user.language === 'es' ? 'Español' : 'English';

  const confirmSignOut = () => {
    Alert.alert(t('auth.signOut'), t('profile.signOutConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.signOut'),
        style: 'destructive',
        onPress: async () => {
          await unregisterPushToken();
          logout.mutate();
        },
      },
    ]);
  };

  return (
    <Screen edges={['top']} padding={0}>
      <TopBar
        title={t('profile.title')}
        onEdit={() => navigation.navigate('ProfilePersonalDetails')}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View
          style={{
            paddingVertical: 32,
            paddingHorizontal: 20,
            gap: 12,
            alignItems: 'center',
            backgroundColor: color.paperWarm,
            borderBottomWidth: 1,
            borderBottomColor: color.lineSoft,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: color.line,
              backgroundColor: color.paperWarm,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="display/stat-medium" style={{ color: color.inkSoft, fontSize: 26 }}>
              {initials}
            </Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text variant="display/card-title">{user.name}</Text>
            <Text variant="ui/tiny" style={{ color: color.inkMute }}>
              {user.email}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: color.ink,
              borderRadius: radius.pill,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <Text variant="ui/pill" style={{ color: color.paper }}>
              {capitalize(t(`roles.${user.role}`, { defaultValue: user.role }))}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 24 }}>
          <Section title={t('profile.sectionAccount')}>
            <NavRow
              icon="person-outline"
              label={t('profile.personalDetails')}
              onPress={() => navigation.navigate('ProfilePersonalDetails')}
            />
            <NavRow
              icon="notifications-outline"
              label={t('profile.notifications')}
              trailing={notificationSummary}
              onPress={() => navigation.navigate('ProfileNotifications')}
            />
            <NavRow
              icon="globe-outline"
              label={t('profile.language')}
              trailing={languageLabel}
              onPress={() => navigation.navigate('ProfileLanguage')}
              isLast
            />
          </Section>

          <Section title={t('profile.sectionSecurity')}>
            <NavRow
              icon="shield-outline"
              label={t('profile.passwordSignIn')}
              onPress={() => Alert.alert(t('profile.comingSoonTitle'), t('profile.comingSoonBody'))}
              isLast
            />
          </Section>

          <Section title={t('profile.sectionHelp')}>
            <NavRow
              icon="help-circle-outline"
              label={t('profile.supportFaqs')}
              onPress={() => Alert.alert(t('profile.comingSoonTitle'), t('profile.comingSoonBody'))}
            />
            <NavRow
              icon="log-out-outline"
              iconBackground={color.dangerSoft}
              iconColor={color.danger}
              label={t('auth.signOut')}
              labelColor={color.danger}
              onPress={confirmSignOut}
              hideChevron
              isLast
            />
          </Section>

          <Text variant="ui/tiny" style={{ textAlign: 'center', marginTop: 12 }}>
            {t('common.appName')} · v0.1.0 · {i18n.locale.toUpperCase()}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function TopBar({ title, onEdit }: { title: string; onEdit: () => void }) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: color.lineSoft,
      }}
    >
      <Text variant="title/app">{title}</Text>
      <Pressable
        onPress={onEdit}
        accessibilityRole="button"
        accessibilityLabel={t('profile.edit')}
        hitSlop={8}
        style={{
          width: 34,
          height: 34,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color.paperWarm,
          borderRadius: radius.pill,
        }}
      >
        <Ionicons name="create-outline" size={16} color={color.ink} />
      </Pressable>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <View style={{ paddingBottom: 8 }}>
        <Text variant="eyebrow">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function NavRow({
  icon,
  label,
  trailing,
  onPress,
  isLast,
  hideChevron,
  iconBackground,
  iconColor,
  labelColor,
}: {
  icon: IconName;
  label: string;
  trailing?: string;
  onPress: () => void;
  isLast?: boolean;
  hideChevron?: boolean;
  iconBackground?: string;
  iconColor?: string;
  labelColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: color.lineSoft,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.lg,
          backgroundColor: iconBackground ?? color.paperWarm,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={16} color={iconColor ?? color.ink} />
      </View>
      <Text
        variant="ui/label"
        style={{ flex: 1, color: labelColor ?? color.ink }}
        numberOfLines={1}
      >
        {label}
      </Text>
      {trailing ? (
        <Text variant="ui/tiny" style={{ color: color.inkMute }}>
          {trailing}
        </Text>
      ) : null}
      {hideChevron ? null : <Ionicons name="chevron-forward" size={14} color={color.inkMute} />}
    </Pressable>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase();
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}
