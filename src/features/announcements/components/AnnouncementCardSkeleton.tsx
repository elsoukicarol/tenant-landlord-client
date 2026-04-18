import { View } from 'react-native';

import { Card, Skeleton } from '@/components/ui';

export function AnnouncementCardSkeleton() {
  return (
    <Card elevated style={{ gap: 10 }}>
      <Skeleton width={80} height={16} borderRadius={10} />
      <Skeleton width="70%" height={20} />
      <Skeleton width="95%" height={14} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Skeleton width={90} height={10} />
        <Skeleton width={60} height={10} />
      </View>
    </Card>
  );
}

export function AnnouncementCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <AnnouncementCardSkeleton key={i} />
      ))}
    </View>
  );
}
