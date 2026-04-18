import { View } from 'react-native';

import { color, radius } from '@/theme';

import { Text } from './Text';

type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' | 'info';

export type PillProps = {
  label: string;
  tone?: Tone;
};

const toneBg: Record<Tone, string> = {
  neutral: color.lineSoft,
  accent: color.accentSoft,
  ok: color.okSoft,
  warn: color.warnSoft,
  danger: color.dangerSoft,
  info: color.infoSoft,
};

const toneFg: Record<Tone, string> = {
  neutral: color.inkSoft,
  accent: color.accent,
  ok: color.ok,
  warn: color.warn,
  danger: color.danger,
  info: color.info,
};

export function Pill({ label, tone = 'neutral' }: PillProps) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: toneBg[tone],
        borderRadius: radius.pill,
      }}
    >
      <Text variant="ui/pill" style={{ color: toneFg[tone] }}>
        {label}
      </Text>
    </View>
  );
}
