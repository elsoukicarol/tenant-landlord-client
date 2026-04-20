import { View } from 'react-native';

import { Skeleton } from '@/components/ui';
import { color } from '@/theme';

export function RequestCardSkeleton() {
  return (
    <View
      style={{
        paddingVertical: 16,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: color.lineSoft,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Skeleton width="70%" height={18} />
        <Skeleton width={70} height={18} borderRadius={10} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Skeleton width={70} height={12} />
        <Skeleton width={60} height={12} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Skeleton width={180} height={10} />
        <Skeleton width={60} height={10} />
      </View>
    </View>
  );
}

export function RequestCardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <RequestCardSkeleton key={i} />
      ))}
    </View>
  );
}
