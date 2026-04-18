import { priorityTone, statusTone } from '../statusTone';

describe('statusTone', () => {
  it('maps OPEN to accent and DISPUTED to danger', () => {
    expect(statusTone('OPEN')).toBe('accent');
    expect(statusTone('DISPUTED')).toBe('danger');
  });
  it('maps RESOLVED to ok and CLOSED to neutral', () => {
    expect(statusTone('RESOLVED')).toBe('ok');
    expect(statusTone('CLOSED')).toBe('neutral');
  });
});

describe('priorityTone', () => {
  it('maps URGENT to danger and LOW to neutral', () => {
    expect(priorityTone('URGENT')).toBe('danger');
    expect(priorityTone('LOW')).toBe('neutral');
  });
});
