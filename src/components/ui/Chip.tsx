import { Pressable, type PressableProps } from 'react-native';

import { MIN_TAP_TARGET, color, radius } from '@/theme';

import { Text } from './Text';

export type ChipProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
  count?: number;
};

export function Chip({ label, selected = false, count, style, ...rest }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={4}
      style={(state) => [
        {
          minHeight: MIN_TAP_TARGET - 8,
          paddingHorizontal: 14,
          paddingVertical: 8,
          backgroundColor: selected ? color.ink : color.paper,
          borderWidth: 1,
          borderColor: selected ? color.ink : color.line,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: state.pressed ? 0.85 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Text variant="ui/chip" style={{ color: selected ? color.paper : color.inkSoft }}>
        {label}
        {count !== undefined ? ` · ${count}` : ''}
      </Text>
    </Pressable>
  );
}
