import { View } from 'react-native';

import { Text } from '@/components/ui';
import { timeAgo } from '@/lib/date';
import { color, radius } from '@/theme';

import type { Comment } from '../types';

export function CommentsList({
  comments,
  locale = 'es',
}: {
  comments: Comment[];
  locale?: 'es' | 'en';
}) {
  if (comments.length === 0) return null;
  return (
    <View style={{ gap: 10 }}>
      {comments.map((c) => (
        <View
          key={c.id}
          style={{
            backgroundColor: color.paper,
            borderRadius: radius.lg,
            padding: 12,
            borderWidth: 1,
            borderColor: color.line,
            gap: 4,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="ui/label-strong">{c.author.name}</Text>
            <Text variant="ui/tiny">{timeAgo(c.createdAt, locale)}</Text>
          </View>
          <Text variant="body/default">{c.message}</Text>
        </View>
      ))}
    </View>
  );
}
