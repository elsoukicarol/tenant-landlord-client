import { Pill } from '@/components/ui';
import { t } from '@/lib/i18n';

import { statusTone } from '../statusTone';
import type { RequestStatus } from '../types';

export function StatusPill({ status }: { status: RequestStatus }) {
  return <Pill tone={statusTone(status)} label={t(`requests.status.${status}`)} />;
}
