import { useMutation } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform as RNPlatform } from 'react-native';

import { api } from '@/api/client';
import { secureStore } from '@/lib/secureStore';

type DevicePlatform = 'IOS' | 'ANDROID';

function devicePlatform(): DevicePlatform {
  return RNPlatform.OS === 'ios' ? 'IOS' : 'ANDROID';
}

async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const result = await Notifications.requestPermissionsAsync();
    status = result.status;
  }
  if (status !== 'granted') return null;

  const projectId =
    (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId ||
    (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;

  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  return tokenResponse.data;
}

export async function registerPushToken(): Promise<void> {
  try {
    const pushToken = await getExpoPushToken();
    if (!pushToken) return;
    await api.post<null>('/devices', {
      token: pushToken,
      platform: devicePlatform(),
    });
    await secureStore.setPushToken(pushToken);
  } catch {
    // Registration is best-effort — we never block sign-in on push.
  }
}

export async function unregisterPushToken(): Promise<void> {
  try {
    const token = await secureStore.getPushToken();
    if (!token) return;
    await api.delete<null>(`/devices/${encodeURIComponent(token)}`);
    await secureStore.clearPushToken();
  } catch {
    // Ignore — token may already be invalid.
  }
}

export function useRegisterPushToken() {
  return useMutation({ mutationFn: registerPushToken });
}
