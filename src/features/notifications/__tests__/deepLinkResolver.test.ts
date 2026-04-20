import { extractDeepLink, resolveDeepLink } from '../deepLinkResolver';
import type { Notification } from '../types';

describe('deep link resolver', () => {
  const makeNav = () => {
    const navigate = jest.fn();
    return {
      navigate,
      nav: { navigate } as unknown as Parameters<typeof resolveDeepLink>[1],
    };
  };

  it('routes tenant requestId into TenantRequests > TenantRequestDetail', () => {
    const { nav, navigate } = makeNav();
    resolveDeepLink({ requestId: 'req-1' }, nav, 'tenant');
    expect(navigate).toHaveBeenCalledWith('TenantRoot', {
      screen: 'TenantRequests',
      params: { screen: 'TenantRequestDetail', params: { id: 'req-1' } },
    });
  });

  it('routes tenant announcementId into TenantAnnouncements > detail', () => {
    const { nav, navigate } = makeNav();
    resolveDeepLink({ announcementId: 'ann-1' }, nav, 'tenant');
    expect(navigate).toHaveBeenCalledWith('TenantRoot', {
      screen: 'TenantAnnouncements',
      params: { screen: 'TenantAnnouncementDetail', params: { id: 'ann-1' } },
    });
  });

  it('is a no-op for null / empty deep link', () => {
    const { nav, navigate } = makeNav();
    resolveDeepLink(null, nav, 'tenant');
    resolveDeepLink(undefined, nav, 'tenant');
    resolveDeepLink({}, nav, 'tenant');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('routes maintainer requestId into MaintainerRequests > MaintainerRequestDetail', () => {
    const { nav, navigate } = makeNav();
    resolveDeepLink({ requestId: 'req-1' }, nav, 'maintainer');
    expect(navigate).toHaveBeenCalledWith('MaintainerRoot', {
      screen: 'MaintainerRequests',
      params: { screen: 'MaintainerRequestDetail', params: { id: 'req-1' } },
    });
  });

  it('routes maintainer announcementId into Home > AnnouncementDetail', () => {
    const { nav, navigate } = makeNav();
    resolveDeepLink({ announcementId: 'ann-1' }, nav, 'maintainer');
    expect(navigate).toHaveBeenCalledWith('MaintainerRoot', {
      screen: 'MaintainerHome',
      params: {
        screen: 'MaintainerAnnouncementDetail',
        params: { id: 'ann-1' },
      },
    });
  });

  it('does not navigate for landlord (not yet configured)', () => {
    const { nav, navigate } = makeNav();
    resolveDeepLink({ requestId: 'req-1' }, nav, 'landlord');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('extractDeepLink pulls the deepLink field or null', () => {
    const base = {
      id: 'n',
      type: 'x',
      title: 't',
      message: 'm',
      isRead: false,
      createdAt: '',
    };
    expect(extractDeepLink({ ...base, deepLink: { requestId: 'r' } } as Notification)).toEqual({
      requestId: 'r',
    });
    expect(extractDeepLink(base as Notification)).toBeNull();
  });
});
