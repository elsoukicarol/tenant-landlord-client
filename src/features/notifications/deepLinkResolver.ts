import type { NavigationContainerRef, NavigationProp } from '@react-navigation/native';

import type { RootStackParamList } from '@/navigation/types';

import type { DeepLink, Notification } from './types';

export type Navigator =
  | NavigationProp<RootStackParamList>
  | NavigationContainerRef<RootStackParamList>;

/**
 * Routes a notification's deep link to the correct in-app destination per role.
 *
 * Backend notifications carry a deepLink with at most one of:
 *   { requestId } — maintenance request / sign-off / schedule proposal parent
 *   { announcementId } — announcement detail
 *   { proposalId } — schedule proposal (always accompanied by requestId)
 *
 * Accepts either a NavigationProp (from inside a screen) or a
 * NavigationContainerRef (from App.tsx's push handler). Both expose the same
 * .navigate(name, params) surface even though the types differ structurally.
 */
export function resolveDeepLink(
  link: DeepLink | null | undefined,
  navigation: Navigator,
  role: 'tenant' | 'maintainer' | 'landlord',
): void {
  const nav = navigation as NavigationProp<RootStackParamList>;
  if (!link) return;

  if (link.requestId) {
    if (role === 'tenant') {
      nav.navigate('TenantRoot', {
        screen: 'TenantRequests',
        params: { screen: 'TenantRequestDetail', params: { id: link.requestId } },
      });
    } else if (role === 'maintainer') {
      nav.navigate('MaintainerRoot', {
        screen: 'MaintainerRequests',
        params: {
          screen: 'MaintainerRequestDetail',
          params: { id: link.requestId },
        },
      });
    }
    return;
  }

  if (link.announcementId) {
    if (role === 'tenant') {
      nav.navigate('TenantRoot', {
        screen: 'TenantAnnouncements',
        params: {
          screen: 'TenantAnnouncementDetail',
          params: { id: link.announcementId },
        },
      });
    } else if (role === 'maintainer') {
      // Announcements now live under the Home stack (no dedicated tab).
      nav.navigate('MaintainerRoot', {
        screen: 'MaintainerHome',
        params: {
          screen: 'MaintainerAnnouncementDetail',
          params: { id: link.announcementId },
        },
      });
    }
    return;
  }
}

export function extractDeepLink(notification: Notification): DeepLink | null {
  return notification.deepLink ?? null;
}
