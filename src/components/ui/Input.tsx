import { forwardRef, useState } from 'react';
import { Pressable, TextInput, type TextInputProps, View } from 'react-native';

import { color, radius, typography } from '@/theme';

import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  rightAction?: { label: string; onPress: () => void; accessibilityLabel?: string };
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, rightAction, style, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? color.danger : focused ? color.ink : color.line;

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="ui/label-strong" style={{ color: color.inkSoft }}>
          {label}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: color.paper,
          borderWidth: 1,
          borderColor,
          borderRadius: radius.lg,
          paddingHorizontal: 14,
          minHeight: 48,
        }}
      >
        <TextInput
          ref={ref}
          style={[
            typography['body/default'],
            { flex: 1, color: color.ink, paddingVertical: 12 },
            style,
          ]}
          placeholderTextColor={color.inkFaint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightAction ? (
          <Pressable
            onPress={rightAction.onPress}
            accessibilityRole="button"
            accessibilityLabel={rightAction.accessibilityLabel ?? rightAction.label}
            hitSlop={8}
            style={{ paddingLeft: 8, minHeight: 44, justifyContent: 'center' }}
          >
            <Text variant="ui/label" style={{ color: color.inkMute }}>
              {rightAction.label}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text variant="ui/caption" style={{ color: color.danger }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="ui/caption">{hint}</Text>
      ) : null}
    </View>
  );
});
