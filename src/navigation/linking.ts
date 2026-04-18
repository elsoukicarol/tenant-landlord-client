import type { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import type { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'habitare://', 'https://habitare.app'],
  config: {
    screens: {
      Unauthed: {
        screens: {
          SignIn: 'sign-in',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset/:token',
          InvitationAccept: 'invite/:token',
        },
      },
    },
  },
};
