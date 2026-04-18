import { View } from 'react-native';

import { color, radius } from '@/theme';

import { Text } from './Text';

type Tone = 'info' | 'ok' | 'warn' | 'danger' | 'accent';

export type BannerProps = {
  tone: Tone;
  title?: string;
  message: string;
};

const toneBg: Record<Tone, string> = {
  info: color.infoSoft,
  ok: color.okSoft,
  warn: color.warnSoft,
  danger: color.dangerSoft,
  accent: color.accentSoft,
};

const toneFg: Record<Tone, string> = {
  info: color.info,
  ok: color.ok,
  warn: color.warn,
  danger: color.danger,
  accent: color.accent,
};

export function Banner({ tone, title, message }: BannerProps) {
  return (
    <View
      style={{
        backgroundColor: toneBg[tone],
        borderRadius: radius.lg,
        padding: 14,
        gap: 4,
      }}
      accessibilityRole="alert"
    >
      {title ? (
        <Text variant="ui/label-strong" style={{ color: toneFg[tone] }}>
          {title}
        </Text>
      ) : null}
      <Text variant="body/small" style={{ color: toneFg[tone] }}>
        {message}
      </Text>
    </View>
  );
}
