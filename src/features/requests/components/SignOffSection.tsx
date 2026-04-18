import { useState } from 'react';
import { View } from 'react-native';

import { Banner, Button, Card, Input, Text } from '@/components/ui';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

import type { RequestDetail } from '../types';

export function SignOffSection({
  request,
  onSignOff,
  onDispute,
  signOffPending,
  disputePending,
}: {
  request: RequestDetail;
  onSignOff: () => void;
  onDispute: (reason: string, notes: string) => void;
  signOffPending: boolean;
  disputePending: boolean;
}) {
  const [disputing, setDisputing] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <Card style={{ gap: 12 }}>
      <Text variant="display/card-title">{t('requests.signOffTitle')}</Text>
      <Text variant="body/default">{t('requests.signOffBody')}</Text>

      {request.resolutionNotes ? (
        <Banner tone="info" title={t('requests.notes')} message={request.resolutionNotes} />
      ) : null}

      {!disputing ? (
        <View style={{ gap: 8 }}>
          <Button
            label={t('requests.signOffConfirm')}
            onPress={onSignOff}
            loading={signOffPending}
            fullWidth
          />
          <Button
            label={t('requests.dispute')}
            variant="secondary"
            onPress={() => setDisputing(true)}
            fullWidth
          />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <Text variant="ui/label-strong" style={{ color: color.inkSoft }}>
            {t('requests.disputeTitle')}
          </Text>
          <Input
            label={t('requests.disputeReason')}
            value={reason}
            onChangeText={setReason}
            editable={!disputePending}
          />
          <Input
            label={t('requests.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ minHeight: 72, textAlignVertical: 'top' }}
            editable={!disputePending}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              label={t('common.cancel')}
              variant="secondary"
              onPress={() => setDisputing(false)}
              fullWidth
            />
            <View style={{ flex: 1 }}>
              <Button
                label={t('common.confirm')}
                onPress={() => onDispute(reason, notes)}
                loading={disputePending}
                disabled={reason.trim().length === 0}
                fullWidth
              />
            </View>
          </View>
        </View>
      )}
    </Card>
  );
}
