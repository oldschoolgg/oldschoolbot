import '../src/lib/data/itemAliases';

import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

jest.mock('../src/lib/settings/prisma.ts', () => ({
	__esModule: true,
	prisma: mockDeep<PrismaClient>()
}));

// @ts-ignore Mock
global.globalClient = {} as any;
import('../src/lib/MUser');
