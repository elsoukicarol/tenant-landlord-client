import type { PillProps } from '@/components/ui';

import type { Priority, RequestStatus } from './types';

export function statusTone(status: RequestStatus): PillProps['tone'] {
  switch (status) {
    case 'OPEN':
      return 'accent';
    case 'ACKNOWLEDGED':
    case 'IN_PROGRESS':
      return 'info';
    case 'RESOLVED':
      return 'ok';
    case 'CLOSED':
      return 'neutral';
    case 'DISPUTED':
      return 'danger';
  }
}

export function priorityTone(priority: Priority): PillProps['tone'] {
  switch (priority) {
    case 'LOW':
      return 'neutral';
    case 'MEDIUM':
      return 'info';
    case 'HIGH':
      return 'warn';
    case 'URGENT':
      return 'danger';
  }
}
