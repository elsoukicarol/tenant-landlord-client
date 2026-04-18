import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { selectRole, useAuthStore } from '@/features/auth/store';

import { LandlordTabs } from './LandlordTabs';
import { MaintainerTabs } from './MaintainerTabs';
import { TenantTabs } from './TenantTabs';
import type { RootStackParamList } from './types';
import { UnauthedStack } from './UnauthedStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const role = useAuthStore(selectRole);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === 'tenant' ? (
        <Stack.Screen name="TenantRoot" component={TenantTabs} />
      ) : role === 'maintainer' ? (
        <Stack.Screen name="MaintainerRoot" component={MaintainerTabs} />
      ) : role === 'landlord' ? (
        <Stack.Screen name="LandlordRoot" component={LandlordTabs} />
      ) : (
        <Stack.Screen name="Unauthed" component={UnauthedStack} />
      )}
    </Stack.Navigator>
  );
}
