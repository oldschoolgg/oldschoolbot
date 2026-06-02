import { test } from 'vitest';

import { preStartup } from '../../src/lib/preStartup.js';
import { mockClient } from './util.js';

test('PreStartup', async () => {
	await mockClient();
	await preStartup();
});
