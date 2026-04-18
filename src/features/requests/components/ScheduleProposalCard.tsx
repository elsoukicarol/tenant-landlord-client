import { View } from 'react-native';

import { Card, Pill, Text } from '@/components/ui';
import { formatDate, timeAgo } from '@/lib/date';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

import type { ProposalStatus, ScheduleProposal } from '../types';

const toneByStatus: Record<ProposalStatus, 'neutral' | 'ok' | 'danger' | 'warn'> = {
  PENDING: 'warn',
  ACCEPTED: 'ok',
  DECLINED: 'danger',
  COUNTER_PROPOSED: 'neutral',
};

export function ScheduleProposalCard({
  proposal,
  locale = 'es',
  actions,
}: {
  proposal: ScheduleProposal;
  locale?: 'es' | 'en';
  actions?: React.ReactNode;
}) {
  return (
    <Card style={{ gap: 10 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text variant="ui/label" style={{ color: color.inkMute }}>
          {t('requests.proposalBy', { name: proposal.createdBy.name })}
        </Text>
        <Pill
          tone={toneByStatus[proposal.status]}
          label={t(`requests.proposalStatus.${proposal.status}`, {
            defaultValue: proposal.status,
          })}
        />
      </View>

      <Text variant="display/card-title">{formatDate(proposal.proposedDate, 'PPPp', locale)}</Text>

      {proposal.notes ? <Text variant="body/default">{proposal.notes}</Text> : null}

      <Text variant="ui/tiny">{timeAgo(proposal.createdAt, locale)}</Text>

      {actions ? <View style={{ marginTop: 8 }}>{actions}</View> : null}
    </Card>
  );
}
