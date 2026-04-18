import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { typography, type TypographyToken } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TypographyToken;
};

export function Text({ variant = 'body/default', style, ...rest }: TextProps) {
  return <RNText style={[typography[variant], style]} {...rest} />;
}
