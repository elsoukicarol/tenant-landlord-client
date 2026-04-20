import type { Ionicons } from '@expo/vector-icons';

import type { Category, Priority, RequestStatus } from './types';

type IoniconName = keyof typeof Ionicons.glyphMap;

export const categoryIcon: Record<Category, IoniconName> = {
  PLUMBING: 'water-outline',
  ELECTRICAL: 'flash-outline',
  STRUCTURAL: 'hammer-outline',
  APPLIANCES: 'cube-outline',
  OTHER: 'ellipsis-horizontal',
};

export const priorityIcon: Record<Priority, IoniconName> = {
  LOW: 'checkmark-outline',
  MEDIUM: 'alert-outline',
  HIGH: 'alert-outline',
  URGENT: 'alert-circle',
};

export const statusIcon: Record<RequestStatus, IoniconName> = {
  OPEN: 'mail-open-outline',
  ACKNOWLEDGED: 'checkmark-circle-outline',
  IN_PROGRESS: 'pulse',
  RESOLVED: 'time-outline',
  CLOSED: 'checkmark-done',
  DISPUTED: 'warning',
};
