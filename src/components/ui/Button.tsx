import { ActivityIndicator, Pressable, type PressableProps, View } from 'react-native';

import { MIN_TAP_TARGET, color, radius, typography } from '@/theme';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
};

const variantBg: Record<Variant, string> = {
  primary: color.ink,
  secondary: color.paper,
  ghost: 'transparent',
  danger: color.danger,
};

const variantBorder: Record<Variant, string> = {
  primary: color.ink,
  secondary: color.line,
  ghost: 'transparent',
  danger: color.danger,
};

const variantText: Record<Variant, string> = {
  primary: color.paper,
  secondary: color.ink,
  ghost: color.ink,
  danger: color.paper,
};

const sizePad: Record<Size, { v: number; h: number; font: number }> = {
  md: { v: 12, h: 18, font: 14 },
  lg: { v: 16, h: 22, font: 15 },
};

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const pad = sizePad[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={8}
      style={(state) => [
        {
          minHeight: MIN_TAP_TARGET,
          paddingVertical: pad.v,
          paddingHorizontal: pad.h,
          backgroundColor: variantBg[variant],
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: variantBorder[variant],
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: isDisabled ? 0.5 : state.pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variantText[variant]} />
      ) : (
        <>
          {leftIcon ? <View>{leftIcon}</View> : null}
          <Text
            style={[typography['ui/button'], { color: variantText[variant], fontSize: pad.font }]}
          >
            {label}
          </Text>
          {rightIcon ? <View>{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
}
