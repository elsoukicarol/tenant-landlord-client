import { hasMorePages, unwrap } from '../envelope';

describe('envelope', () => {
  describe('unwrap', () => {
    it('extracts data and forwards pagination/unreadCount', () => {
      const envelope = {
        success: true as const,
        data: { id: 'req-1' },
        pagination: { page: 1, limit: 20, total: 42 },
        unreadCount: 3,
      };
      expect(unwrap(envelope)).toEqual({
        data: { id: 'req-1' },
        pagination: { page: 1, limit: 20, total: 42 },
        unreadCount: 3,
      });
    });
  });

  describe('hasMorePages', () => {
    it('is false when pagination is undefined', () => {
      expect(hasMorePages(undefined)).toBe(false);
    });
    it('is true when current page has not reached total', () => {
      expect(hasMorePages({ page: 1, limit: 20, total: 42 })).toBe(true);
    });
    it('is false when all items have been fetched', () => {
      expect(hasMorePages({ page: 3, limit: 20, total: 42 })).toBe(false);
    });
  });
});
