import '../src/lib/data/itemAliases';

import { PrismaClient } from '@prisma/client';
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
	return mocked ?? mockMUser();
};
