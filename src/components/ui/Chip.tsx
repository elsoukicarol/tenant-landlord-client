import { Pressable, type PressableProps } from 'react-native';

import { MIN_TAP_TARGET, color, radius } from '@/theme';

import { Text } from './Text';

export type ChipProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
  count?: number;
};

/**
 * Filter pill, matching the Figma pattern:
 *   selected   → ink background, paper text, no border
 *   unselected → paper background, line border, ink-soft text
 */
export function Chip({ label, selected = false, count, style, ...rest }: ChipProps) {
  const bg = selected ? color.ink : color.paper;
  const border = selected ? color.ink : color.line;
  const fg = selected ? color.paper : color.inkSoft;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={4}
      style={(state) => [
        {
          minHeight: MIN_TAP_TARGET - 8,
          paddingHorizontal: 12,
          paddingVertical: 6,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: state.pressed ? 0.85 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Text variant="ui/chip" style={{ color: fg, fontSize: 11 }}>
        {label}
        {count !== undefined ? ` · ${count}` : ''}
      </Text>
    </Pressable>
  );
}
