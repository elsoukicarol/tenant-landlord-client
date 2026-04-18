import { INVITATION_STATUSES, type InvitationStatus } from '../types';

describe('invitation statuses', () => {
  it('contains the full status enum', () => {
    expect(INVITATION_STATUSES).toEqual(['PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED']);
  });
  it('is a frozen tuple at the type level', () => {
    const s: InvitationStatus = 'PENDING';
    expect(INVITATION_STATUSES.includes(s)).toBe(true);
  });
});
