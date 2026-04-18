import './global.css';

import { NavigationContainer, type NavigationContainerRef } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessionBootstrapper } from '@/features/auth/SessionBootstrapper';
import { useAuthStore } from '@/features/auth/store';
import { attachPushHandlers } from '@/features/notifications/pushHandler';
import { linking } from '@/navigation/linking';
import { RootNavigator } from '@/navigation/RootNavigator';
import type { RootStackParamList } from '@/navigation/types';
import { FONT_ASSETS } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore — splash already hidden */
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const isReady = isHydrated && (fontsLoaded || fontError !== null);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {
        /* ignore */
      });
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SessionBootstrapper />
          <NavigationContainer
            ref={navigationRef}
            linking={linking}
            onReady={() => {
              if (navigationRef.current) {
                attachPushHandlers(navigationRef.current);
              }
            }}
          >
            <RootNavigator />
          </NavigationContainer>
          <StatusBar style="dark" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
