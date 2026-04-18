import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'habitare.authToken';
const PUSH_TOKEN_KEY = 'habitare.pushToken';

export const secureStore = {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clearToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
  async getPushToken(): Promise<string | null> {
    return SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  },
  async setPushToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
  },
  async clearPushToken(): Promise<void> {
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
  },
};
