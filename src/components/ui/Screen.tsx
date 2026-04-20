import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { color } from '@/theme';

export type ScreenProps = ViewProps & {
  edges?: Edge[];
  scroll?: boolean;
  background?: string;
  /** Horizontal padding; default 20. Pass 0 for full-bleed screens. */
  padding?: number;
};

export function Screen({
  edges = ['top', 'bottom'],
  background = color.bg,
  padding = 20,
  style,
  children,
  ...rest
}: ScreenProps) {
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: background }]} edges={edges}>
      <View style={[styles.flex, { paddingHorizontal: padding }, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
