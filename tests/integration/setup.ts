import '../globalSetup';
import '../../src/lib/globals';
import '../../src/lib/util/transactItemsFromBank';
import './mocks';

import { beforeEach, vi } from 'vitest';

import { PrismaClient } from '@prisma/client';
import { noOp } from 'e';
import { BankImageTask, bankImageTask } from '../../src/lib/bankImage';
import { CanvasImage } from '../../src/lib/util/canvasUtil';

if (!roboChimpClient) {
	throw new Error('Robochimp client not found.');
}

export function randomMock(random = 0.1) {
	Math.random = () => random;
}

vi.mock('../../src/lib/util/webhook', async () => {
	const actual: any = await vi.importActual('../../src/lib/util/webhook');
	return {
		...actual,
		sendToChannelID: vi.fn()
	};
});

vi.mock('../../src/lib/gear/functions/generateGearImage', async () => {
	const actual: any = await vi.importActual('../../src/lib/gear/functions/generateGearImage');
	return {
		...actual,
		generateGearImage: vi.fn().mockReturnValue(Promise.resolve(Buffer.from('')))
	};
});

vi.mock('../../src/lib/util/chart', async () => {
	const actual: any = await vi.importActual('../../src/lib/gear/functions/generateGearImage');
	return {
		...actual,
		createChart: vi.fn().mockReturnValue(Promise.resolve(Buffer.from('')))
	};
});

// @ts-ignore mock
globalClient.fetchUser = async (id: string | bigint) => ({
	id: typeof id === 'string' ? id : String(id),
	send: async () => {}
});

const mockBankImageTask = {
	init: vi.fn(),
	run: vi.fn(),
	generateBankImage: vi.fn().mockReturnValue(Promise.resolve({ image: Buffer.from(''), isTransparent: false })),
	getItemImage: vi.fn().mockReturnValue(Promise.resolve(new CanvasImage())),
	fetchAndCacheImage: vi.fn().mockReturnValue(Promise.resolve(new CanvasImage())),
	backgroundImages: []
};

bankImageTask.fetchAndCacheImage = mockBankImageTask.fetchAndCacheImage;
global.bankImageGenerator = mockBankImageTask as any;
BankImageTask.prototype.init = mockBankImageTask.init;
BankImageTask.prototype.run = mockBankImageTask.init;
BankImageTask.prototype.generateBankImage = mockBankImageTask.generateBankImage;
BankImageTask.prototype.getItemImage = mockBankImageTask.getItemImage;
BankImageTask.prototype.fetchAndCacheImage = mockBankImageTask.fetchAndCacheImage;

const __prismaClient = new PrismaClient();
__prismaClient.$queryRawUnsafe('CREATE EXTENSION IF NOT EXISTS intarray;').then(noOp).catch(noOp);

beforeEach(async () => {
	global.prisma = __prismaClient;
	global.bankImageGenerator = mockBankImageTask as any;
	BankImageTask.prototype.init = mockBankImageTask.init;
	BankImageTask.prototype.run = mockBankImageTask.init;
	BankImageTask.prototype.generateBankImage = mockBankImageTask.generateBankImage;
	BankImageTask.prototype.getItemImage = mockBankImageTask.getItemImage;
	BankImageTask.prototype.fetchAndCacheImage = mockBankImageTask.fetchAndCacheImage;
});
