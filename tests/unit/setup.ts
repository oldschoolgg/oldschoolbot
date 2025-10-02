import { vi } from 'vitest';
import '../../src/lib/customItems/customItems.js';
import '../../src/lib/data/itemAliases.js';

vi.mock('../../src/lib/postgres.js', { spy: true });

vi.mock('../../src/lib/workers/index.js', { spy: true });

// @ts-expect-error
global.ActivityManager = {
	getActivityOfUser: () => null
};
