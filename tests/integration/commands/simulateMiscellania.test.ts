import { describe, test, expect } from 'vitest';

import { simulateCommand } from '../../../src/mahoji/commands/simulate';
import { createTestUser, mockClient } from '../util';


describe('Simulate Miscellania', async () => {
  await mockClient();

  test('returns image', async () => {
    const user = await createTestUser();
    const result: any = await user.runCommand(simulateCommand, { miscellania: { days: 3 } });
    expect(result.files?.length).toBe(1);
  });
});
