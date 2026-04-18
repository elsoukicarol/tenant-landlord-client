import { View } from 'react-native';

import { Card, Skeleton } from '@/components/ui';

export function RequestCardSkeleton() {
  return (
    <Card elevated style={{ gap: 10 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Skeleton width={110} height={10} />
        <Skeleton width={80} height={20} borderRadius={10} />
      </View>
      <Skeleton width="75%" height={20} />
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Skeleton width={60} height={18} borderRadius={10} />
        <Skeleton width={90} height={12} />
      </View>
    </Card>
  );
}

export function RequestCardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <RequestCardSkeleton key={i} />
      ))}
    </View>
  );
}
