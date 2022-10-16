import '../src/lib/data/itemAliases';

import { PrismaClient } from '@prisma/client';
import { randInt } from 'e';
import { mockDeep } from 'jest-mock-extended';

import { mockMUser, mockUserMap } from './utils';

jest.mock('../src/lib/settings/prisma.ts', () => ({
	__esModule: true,
	prisma: mockDeep<PrismaClient>()
}));

// @ts-ignore Mock
global.globalClient = {} as any;
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

jest.mock('../src/lib/util.ts', () => ({
	__esModule: true,
	rand: (min: number, max: number) => randInt(min, max)
}));
