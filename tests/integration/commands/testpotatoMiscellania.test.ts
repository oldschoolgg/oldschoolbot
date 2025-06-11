import { describe, test, expect } from 'vitest';

import { Time } from 'e';
import { testPotatoCommand } from '../../../src/mahoji/commands/testpotato';
import { createTestUser, mockClient } from '../util';

describe('Testpotato Miscellania', async () => {
  await mockClient();

  test('updates miscellania data', async () => {
    const user = await createTestUser();
    await user.runCommand(
      testPotatoCommand!,
      { miscellania: { coffer: 5000, approval: 75, days_ago: 3 } },
      true
    );
    const data: any = user.user.minion_miscellania;
    expect(data.coffer).toBe(5000);
    expect(Math.round(data.approval)).toBe(75);
    const days = Math.round((Date.now() - data.lastCollect) / Time.Day);
    expect(days).toBe(3);
  });
});
