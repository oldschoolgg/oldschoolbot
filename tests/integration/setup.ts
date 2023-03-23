import '../globalSetup';
import '../../src/lib/util/transactItemsFromBank';
import '../../src/lib/bankImage';

import { vi } from 'vitest';

import { runStartupScripts } from '../../src/lib/startupScripts';

export async function setup() {
	await runStartupScripts();
}

vi.mock('../../src/lib/util/handleMahojiConfirmation', () => ({
	handleMahojiConfirmation: vi.fn()
}));

export function randomMock(random = 0.1) {
	Math.random = () => random;
}
