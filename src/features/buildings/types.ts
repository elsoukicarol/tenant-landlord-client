import type { UserRef } from '@/features/requests/types';

export type Colorway = 'warm-brown' | 'cool-blue' | 'dark-brown';

export type UnitStatus = 'occupied' | 'vacant';

export type UnitSummary = {
  id: string;
  label: string;
  floor: number | null;
  rentAmount: number | null;
  status: UnitStatus;
  tenant: UserRef | null;
};

export type BuildingListItem = {
  id: string;
  name: string;
  address: string;
  colorway?: Colorway;
  unitCount: number;
  occupiedCount: number;
  maintainer?: UserRef | null;
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
