import { useEffect, useState } from 'react';

import { Banner } from '@/components/ui';
import { countdownSeconds, formatCountdown } from '@/lib/date';
import { t } from '@/lib/i18n';

export function LockoutBanner({ lockoutUntil }: { lockoutUntil: string }) {
  const [remaining, setRemaining] = useState(() => countdownSeconds(lockoutUntil));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(countdownSeconds(lockoutUntil));
    }, 1000);
    return () => clearInterval(id);
  }, [lockoutUntil]);

  if (remaining <= 0) return null;

  return (
    <Banner
      tone="danger"
      title={t('auth.lockedTitle')}
      message={t('auth.lockedBody', { countdown: formatCountdown(remaining) })}
    />
  );
}
