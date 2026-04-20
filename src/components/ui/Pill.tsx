import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { color, radius } from '@/theme';

import { Text } from './Text';

type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' | 'info';

export type PillProps = {
  label: string;
  tone?: Tone;
  icon?: keyof typeof Ionicons.glyphMap;
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

export function Pill({ label, tone = 'neutral', icon }: PillProps) {
  const fg = toneFg[tone];
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 3,
        backgroundColor: toneBg[tone],
        borderRadius: radius.pill,
      }}
    >
      {icon ? <Ionicons name={icon} size={10} color={fg} /> : null}
      <Text variant="ui/pill" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}
