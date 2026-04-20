import { useRoute, type RouteProp } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { isApiError } from '@/api/errors';
import { Banner, Button, Card, EmptyState, Input, Pill, Screen, Text } from '@/components/ui';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { formatDate } from '@/lib/date';
import { env } from '@/lib/env';
import { formatCurrency } from '@/lib/format';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

import { useExpense, useFlagExpense } from '../api';

type DetailRoute = RouteProp<{ Detail: { id: string } }, 'Detail'>;

export function LandlordExpenseDetailScreen() {
  const route = useRoute<DetailRoute>();
  const { id } = route.params;
  const user = useAuthStore(selectUser);
  const locale = user?.language ?? 'en';

  const expense = useExpense(id);
  const flag = useFlagExpense();

  const [flagging, setFlagging] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  if (expense.isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      </Screen>
    );
  }

  if (expense.isError || !expense.data) {
    return (
      <Screen>
        <EmptyState
          title={isApiError(expense.error) ? expense.error.message : t('common.unknownError')}
        />
      </Screen>
    );
  }

  const e = expense.data;

  const openReceipt = () => {
    // The backend serves receipts at /expenses/:id/receipt with a JWT-protected
    // redirect to S3. Since Linking.openURL can't pass the bearer token, we
    // fall back to an in-app viewer in a later phase; for now surface the URL
    // so QA can verify the path.
    const url = `${env.apiUrl}/expenses/${e.id}/receipt`;
    Linking.openURL(url).catch(() => {
      /* ignore */
    });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pill label={t(`requests.category.${e.category}`)} />
            <Text variant="ui/caption">{formatDate(e.date, 'PPP', locale)}</Text>
          </View>

          <Text variant="display/hero">{formatCurrency(e.amount, locale)}</Text>
          <Text variant="body/lead">{e.description}</Text>

          {e.building || e.recordedBy ? (
            <Card style={{ gap: 6 }}>
              {e.building ? (
                <View>
                  <Text variant="mono/label">{t('expenses.buildingLabel')}</Text>
                  <Text variant="body/default">{e.building.name}</Text>
                </View>
              ) : null}
              {e.recordedBy ? (
                <View>
                  <Text variant="mono/label">{t('expenses.recordedBy')}</Text>
                  <Text variant="body/default">{e.recordedBy.name}</Text>
                </View>
              ) : null}
              {e.requestId ? (
                <View>
                  <Text variant="mono/label">{t('expenses.linkedRequest')}</Text>
                  <Text variant="body/default">{e.requestId}</Text>
                </View>
              ) : null}
            </Card>
          ) : null}

          {e.receiptUrl ? (
            <Button
              label={t('expenses.viewReceipt')}
              variant="secondary"
              onPress={openReceipt}
              fullWidth
            />
          ) : null}

          {flag.isSuccess ? <Banner tone="ok" message={t('expenses.flagSuccess')} /> : null}

          {flag.isError && isApiError(flag.error) ? (
            <Banner tone="danger" message={flag.error.message} />
          ) : null}

          {!flagging && !flag.isSuccess ? (
            <Button
              label={t('expenses.flag')}
              variant="ghost"
              onPress={() => setFlagging(true)}
              fullWidth
            />
          ) : null}

          {flagging && !flag.isSuccess ? (
            <Card style={{ gap: 12 }}>
              <Text variant="ui/label-strong">{t('expenses.flagTitle')}</Text>
              <Input
                label={t('expenses.flagReason')}
                value={reason}
                onChangeText={setReason}
                editable={!flag.isPending}
              />
              <Input
                label={t('expenses.flagNotes')}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={{ minHeight: 72, textAlignVertical: 'top' }}
                editable={!flag.isPending}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button
                  label={t('common.cancel')}
                  variant="secondary"
                  onPress={() => setFlagging(false)}
                  fullWidth
                />
                <View style={{ flex: 1 }}>
                  <Button
                    label={t('expenses.flagConfirm')}
                    onPress={() =>
                      flag.mutate(
                        { id: e.id, reason, notes },
                        { onSuccess: () => setFlagging(false) },
                      )
                    }
                    loading={flag.isPending}
                    disabled={reason.trim().length < 3}
                    fullWidth
                  />
                </View>
              </View>
            </Card>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
