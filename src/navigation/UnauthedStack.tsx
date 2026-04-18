import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { InvitationAcceptScreen } from '@/features/auth/screens/InvitationAcceptScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { SignInScreen } from '@/features/auth/screens/SignInScreen';

import type { UnauthedStackParamList } from './types';

const Stack = createNativeStackNavigator<UnauthedStackParamList>();

export function UnauthedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="InvitationAccept" component={InvitationAcceptScreen} />
    </Stack.Navigator>
  );
}
