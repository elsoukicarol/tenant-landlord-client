import { Ionicons } from '@expo/vector-icons';
import { FlatList, Modal, Pressable, View } from 'react-native';

import { color, radius, shadow } from '@/theme';

import { Text } from './Text';

export type PickerOption<T extends string> = {
  value: T;
  label: string;
  sublabel?: string;
};

export type PickerSheetProps<T extends string> = {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  selectedValue?: T;
  onSelect: (value: T) => void;
  onCancel: () => void;
};

/**
 * Bottom-sheet picker used by the "dropdown" field pattern across the app.
 * Tap a field → sheet slides up → user taps an option → sheet closes.
 */
export function PickerSheet<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onCancel,
}: PickerSheetProps<T>) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        accessibilityLabel="Close"
        style={{ flex: 1, backgroundColor: 'rgba(22, 22, 19, 0.4)' }}
      />
      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: color.paper,
            borderTopLeftRadius: radius['3xl'],
            borderTopRightRadius: radius['3xl'],
            paddingTop: 12,
            paddingBottom: 32,
            maxHeight: '80%',
          },
          shadow.card,
        ]}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 36,
            height: 4,
            borderRadius: radius.pill,
            backgroundColor: color.line,
            marginBottom: 12,
          }}
        />
        <Text variant="display/card-title" style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          {title}
        </Text>
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const isSelected = item.value === selectedValue;
            return (
              <Pressable
                onPress={() => onSelect(item.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => ({
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: pressed ? color.paperWarm : 'transparent',
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="body/default" style={{ color: color.ink }}>
                    {item.label}
                  </Text>
                  {item.sublabel ? <Text variant="ui/tiny">{item.sublabel}</Text> : null}
                </View>
                {isSelected ? <Ionicons name="checkmark" size={20} color={color.accent} /> : null}
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: color.lineSoft }} />
          )}
        />
      </View>
    </Modal>
  );
}

/**
 * The visible "dropdown field" — tapping it opens a PickerSheet.
 * Pass `value` as the rendered string; the caller wires the sheet's state.
 */
export type DropdownFieldProps = {
  label?: string;
  value: string;
  placeholder?: string;
  onPress: () => void;
  disabled?: boolean;
};

export function DropdownField({
  label,
  value,
  placeholder,
  onPress,
  disabled,
}: DropdownFieldProps) {
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="eyebrow" style={{ color: color.inkMute }}>
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        style={{
          backgroundColor: color.paperWarm,
          borderWidth: 1,
          borderColor: color.line,
          borderRadius: radius.lg,
          paddingHorizontal: 14,
          minHeight: 46,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text
          variant="body/default"
          style={{
            color: value ? color.ink : color.inkFaint,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {value || placeholder || ''}
        </Text>
        <Ionicons name="chevron-down" size={16} color={color.inkMute} />
      </Pressable>
    </View>
  );
}
