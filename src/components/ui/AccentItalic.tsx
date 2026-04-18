import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { accentItalicStyle } from '@/theme';

/**
 * Renders the single italic + accent-colored word/glyph that anchors a hero.
 * Per the Habitare design system: exactly one per hero — never two.
 */
export function AccentItalic({ style, ...rest }: RNTextProps) {
  return <RNText style={[accentItalicStyle, style]} {...rest} />;
}
