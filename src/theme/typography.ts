import { Fraunces_400Regular_Italic, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import type { TextStyle } from 'react-native';

import { color } from './tokens';

const FRAUNCES = 'Fraunces';
const FRAUNCES_ITALIC = 'Fraunces-Italic';
const INTER = 'Inter';
const INTER_MEDIUM = 'Inter-Medium';
const INTER_SEMIBOLD = 'Inter-SemiBold';
const MONO = 'JetBrainsMono';

export const FONT_ASSETS = {
  [FRAUNCES]: Fraunces_600SemiBold,
  [FRAUNCES_ITALIC]: Fraunces_400Regular_Italic,
  [INTER]: Inter_400Regular,
  [INTER_MEDIUM]: Inter_500Medium,
  [INTER_SEMIBOLD]: Inter_600SemiBold,
  [MONO]: JetBrainsMono_500Medium,
} as const;

export const typography = {
  'display/hero': {
    fontFamily: FRAUNCES,
    fontSize: 32,
    lineHeight: 38,
    color: color.ink,
    letterSpacing: -0.5,
  },
  'display/section': {
    fontFamily: FRAUNCES,
    fontSize: 24,
    lineHeight: 28,
    color: color.ink,
    letterSpacing: -0.3,
  },
  'display/greeting': {
    fontFamily: FRAUNCES,
    fontSize: 26,
    lineHeight: 30,
    color: color.ink,
  },
  'display/screen-title': {
    fontFamily: FRAUNCES,
    fontSize: 22,
    lineHeight: 26,
    color: color.ink,
  },
  'display/card-title': {
    fontFamily: FRAUNCES,
    fontSize: 18,
    lineHeight: 20,
    color: color.ink,
  },
  'display/stat-large': {
    fontFamily: FRAUNCES,
    fontSize: 36,
    lineHeight: 44,
    color: color.ink,
    letterSpacing: -0.5,
  },
  'display/stat-medium': {
    fontFamily: FRAUNCES,
    fontSize: 30,
    lineHeight: 36,
    color: color.ink,
  },
  'display/stat-small': {
    fontFamily: FRAUNCES,
    fontSize: 20,
    lineHeight: 22,
    color: color.ink,
  },
  'title/app': {
    fontFamily: INTER_SEMIBOLD,
    fontSize: 20,
    lineHeight: 24,
    color: color.ink,
  },
  'body/lead': {
    fontFamily: INTER,
    fontSize: 18,
    lineHeight: 26,
    color: color.inkSoft,
  },
  'body/default': {
    fontFamily: INTER,
    fontSize: 15,
    lineHeight: 20,
    color: color.inkSoft,
  },
  'body/small': {
    fontFamily: INTER,
    fontSize: 13,
    lineHeight: 17,
    color: color.inkMute,
  },
  'ui/label-strong': {
    fontFamily: INTER_SEMIBOLD,
    fontSize: 14,
    lineHeight: 18,
    color: color.ink,
  },
  'ui/label': {
    fontFamily: INTER_MEDIUM,
    fontSize: 13,
    lineHeight: 17,
    color: color.inkSoft,
  },
  'ui/button': {
    fontFamily: INTER_SEMIBOLD,
    fontSize: 15,
    lineHeight: 18,
    color: color.ink,
    letterSpacing: 0.1,
  },
  'ui/chip': {
    fontFamily: INTER_MEDIUM,
    fontSize: 13,
    lineHeight: 14,
    color: color.inkSoft,
  },
  'ui/pill': {
    fontFamily: INTER_SEMIBOLD,
    fontSize: 11,
    lineHeight: 12,
    color: color.ink,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  'ui/tab': {
    fontFamily: INTER_MEDIUM,
    fontSize: 11,
    lineHeight: 14,
    color: color.inkMute,
  },
  'ui/caption': {
    fontFamily: INTER_MEDIUM,
    fontSize: 12,
    lineHeight: 16,
    color: color.inkMute,
  },
  'ui/tiny': {
    fontFamily: INTER_MEDIUM,
    fontSize: 11,
    lineHeight: 14,
    color: color.inkFaint,
  },
  eyebrow: {
    fontFamily: INTER_SEMIBOLD,
    fontSize: 10,
    lineHeight: 12,
    color: color.inkMute,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  'eyebrow/accent': {
    fontFamily: INTER_SEMIBOLD,
    fontSize: 10,
    lineHeight: 12,
    color: color.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  'mono/data': {
    fontFamily: MONO,
    fontSize: 11,
    lineHeight: 12,
    color: color.inkMute,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  'mono/label': {
    fontFamily: MONO,
    fontSize: 11,
    lineHeight: 14,
    color: color.inkMute,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  'mono/tag': {
    fontFamily: MONO,
    fontSize: 10,
    lineHeight: 12,
    color: color.inkFaint,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;

export const accentItalicStyle: TextStyle = {
  fontFamily: FRAUNCES_ITALIC,
  color: color.accent,
};
