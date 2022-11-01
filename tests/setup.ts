import '../src/lib/customItems/customItems';
import '../src/lib/data/itemAliases';

import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { mockMUser, mockUserMap } from './utils';

jest.mock('../src/lib/settings/prisma.ts', () => ({
	__esModule: true,
	prisma: mockDeep<PrismaClient>()
}));

// @ts-ignore Mock
global.globalClient = { guilds: { cache: new Map() } } as any;
import('../src/lib/MUser');

// @ts-ignore Mock
global.mUserFetch = (id: string) => {
	const mocked = mockUserMap.get(id);
	return mocked ?? mockMUser({ id });
};

jest.mock('../src/lib/util/addSubTaskToActivityTask.ts', () => ({
	__esModule: true,
	default: () => {}
}));

jest.mock('../src/lib/util.ts', () => {
	const originalModule = jest.requireActual('../src/lib/util.ts');
	return {
		__esModule: true,
		...originalModule
	};
});

async function mockTransactItems() {
	return { newUser: {} };
}

jest.mock('../src/mahoji/mahojiSettings.ts', () => {
	const originalModule = jest.requireActual('../src/lib/util.ts');
	return {
		__esModule: true,
		...originalModule,
		transactItems: mockTransactItems
	};
});

// @ts-ignore Mock
global.transactItems = mockTransactItems;
