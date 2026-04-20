import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, View } from 'react-native';

import { isApiError } from '@/api/errors';
import { Banner, Screen, Text } from '@/components/ui';
import { useUpdateMe } from '@/features/auth/api';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { type Language, setLanguage, t } from '@/lib/i18n';
import { color, radius } from '@/theme';

const OPTIONS: { value: Language; label: string; sublabel: string }[] = [
  { value: 'en', label: 'English', sublabel: 'English (US)' },
  { value: 'es', label: 'Español', sublabel: 'Spanish' },
];

export function LanguagePickerScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(selectUser);
  const updateMe = useUpdateMe();

  if (!user) return <Screen />;

  const onSelect = (language: Language) => {
    if (language === user.language) {
      navigation.goBack();
      return;
    }
    updateMe.mutate(
      { language },
      {
        onSuccess: () => {
          setLanguage(language);
          navigation.goBack();
        },
      },
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 18, paddingVertical: 12 }}>
        <View style={{ gap: 6 }}>
          <Text variant="display/section">{t('profile.language')}</Text>
          <Text variant="ui/tiny" style={{ color: color.inkMute }}>
            {t('profile.languageSubtitle')}
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
            overflow: 'hidden',
          }}
        >
          {OPTIONS.map((opt, index) => {
            const isSelected = opt.value === user.language;
            const isLast = index === OPTIONS.length - 1;
            return (
              <Pressable
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                disabled={updateMe.isPending}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: color.lineSoft,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="ui/label" style={{ color: color.ink }}>
                    {opt.label}
                  </Text>
                  <Text variant="ui/tiny" style={{ color: color.inkMute }}>
                    {opt.sublabel}
                  </Text>
                </View>
                {isSelected ? <Ionicons name="checkmark" size={18} color={color.accent} /> : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}
