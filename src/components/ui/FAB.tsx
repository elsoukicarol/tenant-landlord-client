import { Ionicons } from '@expo/vector-icons';
import { Pressable, type ViewStyle } from 'react-native';

import { color, radius, shadow } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export type FABProps = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  tone?: 'accent' | 'ink';
  style?: ViewStyle;
};

/**
 * Floating action button. Bottom-right of a screen, above the tab bar.
 * `tone="accent"` uses the brand orange for primary CTAs (create request,
 * invite, etc.); `tone="ink"` is the subtler dark variant.
 */
export function FAB({ icon, onPress, accessibilityLabel, tone = 'accent', style }: FABProps) {
  const bg = tone === 'accent' ? color.accent : color.ink;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        {
          position: 'absolute',
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: radius.pill,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.9 : 1,
        },
        shadow.fab,
        style,
      ]}
    >
      <Ionicons name={icon} size={26} color={color.paper} />
    </Pressable>
  );
}
