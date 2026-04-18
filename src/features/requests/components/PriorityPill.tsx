import { Pill } from '@/components/ui';
import { t } from '@/lib/i18n';

import { priorityTone } from '../statusTone';
import type { Priority } from '../types';

export function PriorityPill({ priority }: { priority: Priority }) {
  return <Pill tone={priorityTone(priority)} label={t(`requests.priority.${priority}`)} />;
}
