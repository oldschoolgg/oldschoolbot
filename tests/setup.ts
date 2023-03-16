import '../src/lib/customItems/customItems';
import '../src/lib/data/itemAliases';
import '../src/lib/util/logger';

import { vi } from 'vitest';

import { globalConfig } from '../src/lib/constants';
import { mockMUser, mockUserMap } from './utils';

vi.mock('../src/lib/settings/prisma.ts', () => ({
	__esModule: true,
	prisma: {}
}));

// @ts-ignore Mock
global.globalClient = {
	guilds: { cache: new Map() },
	mahojiClient: {
		commands: {
			values: [
				{
					name: 'test',
					description: 'test description',
					attributes: { description: 'test description' },
					options: []
				}
			]
		}
	}
} as any;
import('../src/lib/MUser');

// @ts-ignore Mock
global.mUserFetch = (id: string) => {
	const mocked = mockUserMap.get(id);
	return mocked ?? mockMUser({ id });
};

vi.mock('../src/lib/util/addSubTaskToActivityTask.ts', () => ({
	__esModule: true,
	default: () => {}
}));

async function mockTransactItems() {
	return { newUser: {} };
}

vi.mock('../src/mahoji/mahojiSettings.ts', async () => {
	const actual: any = await vi.importActual('../src/mahoji/mahojiSettings.ts');
	return {
		...actual,
		transactItems: mockTransactItems
	};
});

// @ts-ignore Mock
global.transactItems = mockTransactItems;

vi.mock('../src/lib/patreon', async () => {
	const actual: any = await vi.importActual('../src/lib/patreon');
	return {
		...actual,
		patreonTask: {
			run: () => {}
		}
	};
});

export const mockPatreonWebhookSecret = 'test';
globalConfig.patreonWebhookSecret = mockPatreonWebhookSecret;
