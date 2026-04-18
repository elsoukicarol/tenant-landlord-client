import { availableActions, buildActionContext } from '../stateMachine';
import type { ScheduleProposal } from '../types';

const maintainerProposal = (status: ScheduleProposal['status']): ScheduleProposal => ({
  id: 'p-1',
  proposedDate: '2026-04-20T10:00:00Z',
  status,
  createdBy: { id: 'm-1', name: 'Maintainer', role: 'maintainer' },
  createdAt: '2026-04-19T09:00:00Z',
});

const tenantProposal = (status: ScheduleProposal['status']): ScheduleProposal => ({
  id: 'p-2',
  proposedDate: '2026-04-21T10:00:00Z',
  status,
  createdBy: { id: 't-1', name: 'Tenant', role: 'tenant' },
  createdAt: '2026-04-19T10:00:00Z',
});

describe('request state machine', () => {
  it('maintainer on OPEN can acknowledge and close-without-resolving', () => {
    const ctx = buildActionContext('OPEN', 'maintainer', []);
    const actions = availableActions(ctx);
    expect(actions).toContain('ACKNOWLEDGE');
    expect(actions).toContain('CLOSE_WITHOUT_RESOLVING');
    expect(actions).toContain('COMMENT');
  });

  it('maintainer on ACKNOWLEDGED can propose schedule when no pending', () => {
    const ctx = buildActionContext('ACKNOWLEDGED', 'maintainer', []);
    expect(availableActions(ctx)).toContain('PROPOSE_SCHEDULE');
  });

  it('maintainer on ACKNOWLEDGED cannot propose when they already have a pending', () => {
    const ctx = buildActionContext('ACKNOWLEDGED', 'maintainer', [maintainerProposal('PENDING')]);
    expect(availableActions(ctx)).not.toContain('PROPOSE_SCHEDULE');
  });

  it('tenant can accept / decline / counter maintainer proposal', () => {
    const ctx = buildActionContext('ACKNOWLEDGED', 'tenant', [maintainerProposal('PENDING')]);
    const actions = availableActions(ctx);
    expect(actions).toEqual(
      expect.arrayContaining(['ACCEPT_PROPOSAL', 'DECLINE_PROPOSAL', 'COUNTER_PROPOSE_SCHEDULE']),
    );
  });

  it('maintainer can accept / decline / counter tenant proposal', () => {
    const ctx = buildActionContext('ACKNOWLEDGED', 'maintainer', [tenantProposal('PENDING')]);
    const actions = availableActions(ctx);
    expect(actions).toEqual(
      expect.arrayContaining(['ACCEPT_PROPOSAL', 'DECLINE_PROPOSAL', 'COUNTER_PROPOSE_SCHEDULE']),
    );
  });

  it('tenant on RESOLVED can sign-off or dispute', () => {
    const ctx = buildActionContext('RESOLVED', 'tenant', []);
    const actions = availableActions(ctx);
    expect(actions).toContain('SIGN_OFF');
    expect(actions).toContain('DISPUTE');
  });

  it('maintainer on IN_PROGRESS can resolve', () => {
    const ctx = buildActionContext('IN_PROGRESS', 'maintainer', []);
    expect(availableActions(ctx)).toContain('RESOLVE');
  });

  it('tenant cannot perform maintainer-only actions', () => {
    const ctx = buildActionContext('OPEN', 'tenant', []);
    const actions = availableActions(ctx);
    expect(actions).not.toContain('ACKNOWLEDGE');
    expect(actions).not.toContain('RESOLVE');
    expect(actions).not.toContain('CLOSE_WITHOUT_RESOLVING');
  });

  it('everyone can comment regardless of status', () => {
    for (const role of ['tenant', 'maintainer', 'landlord'] as const) {
      expect(availableActions(buildActionContext('CLOSED', role, []))).toContain('COMMENT');
    }
  });
});
