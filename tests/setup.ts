import '../src/lib/data/itemAliases';

import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { KlasaClient } from 'klasa';

jest.mock('../src/lib/settings/prisma.ts', () => ({
	__esModule: true,
	prisma: mockDeep<PrismaClient>()
}));

// @ts-ignore Mock
global.globalClient = { settings: { get: () => ({}) } } as any as KlasaClient;
import('../src/lib/MUser');
