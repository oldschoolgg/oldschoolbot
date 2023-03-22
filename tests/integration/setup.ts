import '../globalSetup';
import '../../src/lib/util/transactItemsFromBank';

import { vi } from 'vitest';

import { runStartupScripts } from '../../src/lib/startupScripts';

export async function setup() {
	await runStartupScripts();
}

vi.mock('../../src/lib/util/handleMahojiConfirmation', () => ({
	handleMahojiConfirmation: vi.fn()
}));
