import { INVITATION_STATUSES, type InvitationStatus } from '../types';

describe('invitation statuses', () => {
  it('contains the full status enum (lowercase, matching server)', () => {
    expect(INVITATION_STATUSES).toEqual(['pending', 'accepted', 'revoked', 'expired']);
  });
  it('is a frozen tuple at the type level', () => {
    const s: InvitationStatus = 'pending';
    expect(INVITATION_STATUSES.includes(s)).toBe(true);
  });
});
