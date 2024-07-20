import { test } from 'vitest';

import { preStartup } from '../../src/lib/preStartup';
import { mockClient } from './util';

test('Random Events', async () => {
	await mockClient();
	await preStartup();
});
