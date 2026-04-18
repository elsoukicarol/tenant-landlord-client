import type { UserRef } from '@/features/requests/types';

export type Colorway = 'warm-brown' | 'cool-blue' | 'dark-brown';

export type UnitSummary = {
  id: string;
  number: string;
  floor?: number | string;
  status?: 'OCCUPIED' | 'VACANT';
  monthlyRent?: number;
  tenant?: UserRef;
};

export type BuildingListItem = {
  id: string;
  name: string;
  address: string;
  colorway?: Colorway;
  unitCount: number;
  occupiedCount: number;
  maintainer?: UserRef;
};

export type BuildingStats = {
  monthlyRent?: number;
  monthlyExpenses?: number;
  netIncome?: number;
};

export type Building = BuildingListItem & {
  units?: UnitSummary[];
  stats?: BuildingStats;
};
