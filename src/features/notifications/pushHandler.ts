import type { NavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { selectRole, useAuthStore } from '@/features/auth/store';
import type { RootStackParamList } from '@/navigation/types';

import { resolveDeepLink } from './deepLinkResolver';
import type { DeepLink } from './types';

/**
 * Foreground presentation — show a banner + play the sound even while the app
 * is open. Without this, iOS delivers nothing visible while foregrounded and
 * users miss notifications they'd expect to see.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#E8502A',
  });
}

function readDeepLink(data: Record<string, unknown> | null | undefined): DeepLink | null {
  if (!data) return null;
  // FCM/APNs payloads put our deepLink at the top level. It may arrive as an
  // object or as a JSON-encoded string depending on the backend serializer.
  const raw = data.deepLink ?? data;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as DeepLink;
      return parsed;
    } catch {
      return null;
    }
  }
  if (typeof raw === 'object' && raw !== null) {
    const link = raw as Record<string, unknown>;
    const pick = (k: string) => (typeof link[k] === 'string' ? (link[k] as string) : undefined);
    return {
      requestId: pick('requestId'),
      announcementId: pick('announcementId'),
      proposalId: pick('proposalId'),
    };
  }
  return null;
}

/**
 * Wires the notification-response listeners. Call once from App.tsx after the
 * navigation container ref is ready. Returns a cleanup function.
 *
 * Covers three scenarios:
 *   - Foreground tap → addNotificationResponseReceivedListener
 *   - Background tap → addNotificationResponseReceivedListener (same API)
 *   - Cold launch from notification → getLastNotificationResponseAsync
 */
export function attachPushHandlers(
  navigationRef: NavigationContainerRef<RootStackParamList>,
): () => void {
  void ensureAndroidChannel();

  const handle = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as Record<string, unknown> | undefined;
    const link = readDeepLink(data);
    const role = selectRole(useAuthStore.getState());
    if (!link || !role || role === 'super_admin') return;
    if (!navigationRef.isReady()) {
      // Navigation tree not mounted yet — very rare; defer to next tick.
      setTimeout(() => {
        if (navigationRef.isReady()) resolveDeepLink(link, navigationRef, role);
      }, 100);
      return;
    }
    resolveDeepLink(link, navigationRef, role);
  };

  const sub = Notifications.addNotificationResponseReceivedListener(handle);

  // Handle cold-start tap.
  void Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) handle(response);
  });

  return () => sub.remove();
}
