export const color = {
  bg: '#F4F1EC',
  paper: '#FBFAF6',
  paperWarm: '#F8F4EC',
  ink: '#161613',
  inkSoft: '#3A3A35',
  inkMute: '#6B6A62',
  inkFaint: '#9A998F',
  line: '#E2DDD2',
  lineSoft: '#EDE8DE',
  accent: '#E8502A',
  accentSoft: '#FCE8DF',
  ok: '#2F6F4E',
  okSoft: '#DDEAE0',
  warn: '#B8871C',
  warnSoft: '#F5ECD3',
  danger: '#9B2D20',
  dangerSoft: '#F3DBD6',
  info: '#2E4F7A',
  infoSoft: '#DCE5F0',
} as const;

export type ColorToken = keyof typeof color;

export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export type SpaceToken = keyof typeof space;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 14,
  '3xl': 16,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;

export const shadow = {
  card: {
    shadowColor: color.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: color.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  phone: {
    shadowColor: color.ink,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 16,
  },
} as const;

export const MIN_TAP_TARGET = 44;
