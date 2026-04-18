import { useMe } from './api';
import { useAuthStore } from './store';

/**
 * Mounted once at the top of the authenticated tree. When there's a token but
 * no user in memory yet (fresh launch after rehydration from SecureStore), it
 * fetches /auth/me to populate the user. A 401 is caught by the axios
 * interceptor, which globally signs the user out.
 */
export function SessionBootstrapper() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  useMe(Boolean(token) && user === null);
  return null;
}
