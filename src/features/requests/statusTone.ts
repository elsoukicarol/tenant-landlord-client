import type { PillProps } from '@/components/ui';

import type { Priority, RequestStatus } from './types';

/**
 * Status tone map matching Figma:
 *   OPEN         → accent (orange) — needs triage
 *   ACKNOWLEDGED → info (blue)     — received
 *   IN_PROGRESS  → info (blue)     — actively worked
 *   RESOLVED     → warn (amber)    — awaiting tenant sign-off
 *   CLOSED       → neutral
 *   DISPUTED     → danger (red)
 */
export function statusTone(status: RequestStatus): PillProps['tone'] {
  switch (status) {
    case 'OPEN':
      return 'accent';
    case 'ACKNOWLEDGED':
    case 'IN_PROGRESS':
      return 'info';
    case 'RESOLVED':
      return 'warn';
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
