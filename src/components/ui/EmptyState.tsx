import { View } from 'react-native';

import { color } from '@/theme';

import { Text } from './Text';

export type EmptyStateProps = {
  title: string;
  body?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 8,
      }}
    >
      <Text variant="display/card-title" style={{ color: color.inkSoft, textAlign: 'center' }}>
        {title}
      </Text>
      {body ? (
        <Text variant="body/small" style={{ textAlign: 'center', maxWidth: 280 }}>
          {body}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: 12 }}>{action}</View> : null}
    </View>
  );
}
