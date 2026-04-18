import { useState } from 'react';
import { View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { t } from '@/lib/i18n';

export function CommentComposer({
  onSubmit,
  submitting,
}: {
  onSubmit: (message: string) => void;
  submitting: boolean;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
      <View style={{ flex: 1 }}>
        <Input
          placeholder={t('requests.commentPlaceholder')}
          value={value}
          onChangeText={setValue}
          multiline
          numberOfLines={2}
          editable={!submitting}
          accessibilityLabel={t('requests.commentPlaceholder')}
        />
      </View>
      <Button
        label={t('requests.send')}
        size="md"
        onPress={handleSubmit}
        loading={submitting}
        disabled={value.trim().length === 0 || submitting}
      />
    </View>
  );
}
