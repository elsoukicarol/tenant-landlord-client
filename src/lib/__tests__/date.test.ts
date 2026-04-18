import { countdownSeconds, formatCountdown } from '../date';

describe('date utilities', () => {
  describe('countdownSeconds', () => {
    it('returns 0 when target is in the past', () => {
      const past = new Date(Date.now() - 60_000).toISOString();
      expect(countdownSeconds(past)).toBe(0);
    });
    it('returns positive seconds when target is in the future', () => {
      const future = new Date(Date.now() + 120_000).toISOString();
      const s = countdownSeconds(future);
      expect(s).toBeGreaterThan(100);
      expect(s).toBeLessThanOrEqual(120);
    });
  });

  describe('formatCountdown', () => {
    it('renders mm:ss with zero-padded seconds', () => {
      expect(formatCountdown(0)).toBe('0:00');
      expect(formatCountdown(5)).toBe('0:05');
      expect(formatCountdown(65)).toBe('1:05');
      expect(formatCountdown(125)).toBe('2:05');
      expect(formatCountdown(3599)).toBe('59:59');
    });
  });
});
