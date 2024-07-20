import { test } from 'vitest';

import { preStartup } from '../../src/lib/preStartup';
import { mockClient } from './util';

test.skip('PreStartup', async () => {
	await mockClient();
	await preStartup();
});
