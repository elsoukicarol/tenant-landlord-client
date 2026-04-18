import { useEffect, useRef } from 'react';
import { Animated, View, type ViewStyle } from 'react-native';

import { color, radius } from '@/theme';

export type SkeletonProps = {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius: br = radius.sm,
  style,
}: SkeletonProps) {
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => {
      anim.stop();
    };
  }, [pulse]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      style={[
        {
          width,
          height,
          backgroundColor: color.lineSoft,
          borderRadius: br,
          opacity: pulse,
        },
        style,
      ]}
    >
      <View />
    </Animated.View>
  );
}
