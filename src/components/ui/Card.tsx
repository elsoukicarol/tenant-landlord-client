import { View, type ViewProps } from 'react-native';

import { color, radius, shadow } from '@/theme';

export type CardProps = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
};

export function Card({ padded = true, elevated = false, style, ...rest }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: color.paper,
          borderRadius: radius['2xl'],
          borderWidth: 1,
          borderColor: color.line,
          padding: padded ? 16 : 0,
        },
        elevated ? shadow.card : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
