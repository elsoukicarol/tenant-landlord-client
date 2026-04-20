import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

import { isApiError } from '@/api/errors';
import {
  AccentItalic,
  Banner,
  Button,
  Card,
  EmptyState,
  Input,
  Pill,
  Screen,
  Text,
} from '@/components/ui';
import { selectUser, useAuthStore } from '@/features/auth/store';
import { formatDate } from '@/lib/date';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

import {
  useAcceptProposal,
  useAcknowledgeRequest,
  useAddComment,
  useCloseWithoutResolving,
  useDeclineProposal,
  useDisputeRequest,
  useProposeSchedule,
  useRequest,
  useRequestSchedule,
  useSignOffRequest,
} from '../api';
import { CommentComposer } from '../components/CommentComposer';
import { CommentsList } from '../components/CommentsList';
import { PhotoGallery } from '../components/PhotoGallery';
import { PriorityPill } from '../components/PriorityPill';
import { ScheduleProposalCard } from '../components/ScheduleProposalCard';
import { ScheduleProposalSheet } from '../components/ScheduleProposalSheet';
import { SignOffSection } from '../components/SignOffSection';
import { StatusPill } from '../components/StatusPill';
import { Timeline } from '../components/Timeline';
import { availableActions, buildActionContext } from '../stateMachine';
import type { ScheduleProposal } from '../types';

type DetailRoute = RouteProp<{ Detail: { id: string } }, 'Detail'>;

export function RequestDetailScreen() {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation();
  const { id } = route.params;
  const user = useAuthStore(selectUser);
  const role = user?.role ?? 'tenant';
  const locale = user?.language ?? 'en';

  const detail = useRequest(id);
  const schedule = useRequestSchedule(id);

  const acknowledge = useAcknowledgeRequest();
  const propose = useProposeSchedule();
  const accept = useAcceptProposal();
  const decline = useDeclineProposal();
  const comment = useAddComment();
  const signOff = useSignOffRequest();
  const dispute = useDisputeRequest();
  const closeWithout = useCloseWithoutResolving();

  const [sheetMode, setSheetMode] = useState<null | 'propose' | 'counter'>(null);
  const [closingReason, setClosingReason] = useState('');
  const [closingOpen, setClosingOpen] = useState(false);

  if (detail.isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.ink} />
        </View>
      </Screen>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <Screen>
        <EmptyState
          title={isApiError(detail.error) ? detail.error.message : t('common.unknownError')}
        />
      </Screen>
    );
  }

  const request = detail.data;
  const proposals = schedule.data ?? request.scheduleProposals ?? [];
  const actionCtx = buildActionContext(request.status, role, proposals);
  const allowed = availableActions(actionCtx);
  const latestPending = [...proposals]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .find((p) => p.status === 'PENDING');

  const goResolve = () => {
    // RequestDetailScreen is registered in multiple stacks; navigate by name.
    (navigation.navigate as (name: string, params: { id: string }) => void)(
      'MaintainerResolveRequest',
      { id: request.id },
    );
  };

  const confirmClose = () => {
    Alert.alert(t('requests.closeWithoutResolvingTitle'), t('requests.closeWithoutResolvingBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('requests.closeWithoutResolvingConfirm'),
        style: 'destructive',
        onPress: () =>
          closeWithout.mutate(
            { id: request.id, reason: closingReason },
            {
              onSuccess: () => {
                setClosingOpen(false);
                setClosingReason('');
              },
            },
          ),
      },
    ]);
  };

  const proposalActions = (p: ScheduleProposal): React.ReactNode => {
    if (p.status !== 'PENDING') return null;
    const canRespond =
      (role === 'tenant' && p.createdBy.role === 'maintainer') ||
      (role === 'maintainer' && p.createdBy.role === 'tenant');
    if (!canRespond) return null;
    return (
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button
          label={t('requests.acceptProposal')}
          size="md"
          onPress={() => accept.mutate({ requestId: request.id, proposalId: p.id })}
          loading={accept.isPending}
        />
        <Button
          label={t('requests.counterPropose')}
          size="md"
          variant="secondary"
          onPress={() => setSheetMode('counter')}
        />
        <Button
          label={t('requests.declineProposal')}
          size="md"
          variant="ghost"
          onPress={() => decline.mutate({ requestId: request.id, proposalId: p.id })}
          loading={decline.isPending}
        />
      </View>
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ gap: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: 8 }}>
            <Text variant="mono/data">{request.referenceId}</Text>
            <Text variant="display/screen-title">
              {request.title.split(' ').slice(0, -1).join(' ')}{' '}
              <AccentItalic>{request.title.split(' ').slice(-1)[0]}</AccentItalic>
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <StatusPill status={request.status} />
              <PriorityPill priority={request.priority} />
              <Pill label={t(`requests.category.${request.category}`)} />
            </View>
            {request.building || request.unit ? (
              <Text variant="body/small">
                {request.building?.name ?? ''}
                {request.unit?.number
                  ? ` · ${t('buildings.unitNumber', { number: request.unit.number })}`
                  : ''}
              </Text>
            ) : null}
            {request.tenant && role !== 'tenant' ? (
              <Text variant="ui/caption">{request.tenant.name}</Text>
            ) : null}
            {request.scheduledDate ? (
              <Text variant="ui/caption">
                {t('requests.scheduledFor', {
                  date: formatDate(request.scheduledDate, 'PPPp', locale),
                })}
              </Text>
            ) : null}
          </View>

          {request.photos.length > 0 ? <PhotoGallery photos={request.photos} /> : null}

          <Card>
            <Text variant="body/default">{request.description}</Text>
          </Card>

          <View style={{ gap: 8 }}>
            {allowed.includes('ACKNOWLEDGE') ? (
              <Button
                label={t('requests.acknowledge')}
                onPress={() => acknowledge.mutate(request.id)}
                loading={acknowledge.isPending}
                fullWidth
              />
            ) : null}
            {allowed.includes('RESOLVE') ? (
              <Button label={t('requests.markResolved')} onPress={goResolve} fullWidth />
            ) : null}
            {allowed.includes('CLOSE_WITHOUT_RESOLVING') ? (
              closingOpen ? (
                <Card style={{ gap: 8 }}>
                  <Text variant="ui/label-strong">{t('requests.closeWithoutResolvingTitle')}</Text>
                  <Input
                    label={t('requests.closeReason')}
                    value={closingReason}
                    onChangeText={setClosingReason}
                    editable={!closeWithout.isPending}
                    multiline
                    numberOfLines={3}
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button
                      label={t('common.cancel')}
                      variant="secondary"
                      onPress={() => {
                        setClosingOpen(false);
                        setClosingReason('');
                      }}
                      fullWidth
                    />
                    <View style={{ flex: 1 }}>
                      <Button
                        label={t('requests.closeWithoutResolvingConfirm')}
                        variant="danger"
                        onPress={confirmClose}
                        loading={closeWithout.isPending}
                        disabled={closingReason.trim().length < 5}
                        fullWidth
                      />
                    </View>
                  </View>
                </Card>
              ) : (
                <Button
                  label={t('requests.closeWithoutResolving')}
                  variant="ghost"
                  onPress={() => setClosingOpen(true)}
                  fullWidth
                />
              )
            ) : null}
          </View>

          <View style={{ gap: 12 }}>
            <Text variant="eyebrow">{t('requests.schedule')}</Text>
            {proposals.length === 0 ? (
              <Text variant="body/small">{t('requests.noProposals')}</Text>
            ) : (
              proposals.map((p) => (
                <ScheduleProposalCard
                  key={p.id}
                  proposal={p}
                  locale={locale}
                  actions={proposalActions(p)}
                />
              ))
            )}
            {allowed.includes('PROPOSE_SCHEDULE') && !latestPending ? (
              <Button
                label={t('requests.proposeSchedule')}
                variant="secondary"
                onPress={() => setSheetMode('propose')}
                fullWidth
              />
            ) : null}
          </View>

          {request.status === 'RESOLVED' && role === 'tenant' ? (
            <SignOffSection
              request={request}
              onSignOff={() => signOff.mutate({ id: request.id })}
              onDispute={(reason, notes) => dispute.mutate({ id: request.id, reason, notes })}
              signOffPending={signOff.isPending}
              disputePending={dispute.isPending}
            />
          ) : null}

          <Timeline events={request.timeline ?? []} locale={locale} />

          <View style={{ gap: 12 }}>
            <Text variant="eyebrow">{t('requests.commentsTitle')}</Text>
            <CommentsList comments={request.comments ?? []} locale={locale} />
            <CommentComposer
              onSubmit={(message) => comment.mutate({ id: request.id, message })}
              submitting={comment.isPending}
            />
          </View>

          {isApiError(comment.error) ? (
            <Banner tone="danger" message={comment.error.message} />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <ScheduleProposalSheet
        visible={sheetMode !== null}
        title={
          sheetMode === 'counter' ? t('requests.counterPropose') : t('requests.proposeSchedule')
        }
        onCancel={() => setSheetMode(null)}
        submitting={propose.isPending}
        onSubmit={(iso, notes) => {
          propose.mutate(
            { requestId: request.id, proposedDate: iso, notes },
            { onSuccess: () => setSheetMode(null) },
          );
        }}
      />
    </Screen>
  );
}
