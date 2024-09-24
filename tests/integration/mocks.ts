import { Image } from '@napi-rs/canvas';
import { beforeEach, vi } from 'vitest';

import { BankImageTask } from '../../src/lib/bankImage';
import { PeakTier } from '../../src/lib/constants';

vi.mock('../../src/lib/util/handleMahojiConfirmation.ts', () => ({
	handleMahojiConfirmation: vi.fn()
}));

vi.mock('../../src/lib/util/interactionReply', () => ({
	deferInteraction: vi.fn(),
	interactionReply: vi.fn()
}));

const mockBankImageTask = {
	init: vi.fn(),
	run: vi.fn(),
	generateBankImage: vi.fn().mockReturnValue(Promise.resolve({ image: Buffer.from(''), isTransparent: false })),
	getItemImage: vi.fn().mockReturnValue(Promise.resolve(new Image())),
	fetchAndCacheImage: vi.fn().mockReturnValue(Promise.resolve(new Image()))
};

global.bankImageGenerator = mockBankImageTask as any;
BankImageTask.prototype.init = mockBankImageTask.init;
BankImageTask.prototype.run = mockBankImageTask.init;
BankImageTask.prototype.generateBankImage = mockBankImageTask.generateBankImage;
BankImageTask.prototype.getItemImage = mockBankImageTask.getItemImage;
BankImageTask.prototype.fetchAndCacheImage = mockBankImageTask.fetchAndCacheImage;

beforeEach(async () => {
	global.bankImageGenerator = mockBankImageTask as any;
	BankImageTask.prototype.init = mockBankImageTask.init;
	BankImageTask.prototype.run = mockBankImageTask.init;
	BankImageTask.prototype.generateBankImage = mockBankImageTask.generateBankImage;
	BankImageTask.prototype.getItemImage = mockBankImageTask.getItemImage;
	BankImageTask.prototype.fetchAndCacheImage = mockBankImageTask.fetchAndCacheImage;
});

globalClient._peakIntervalCache = [
	{
		startTime: new Date().getTime() - 1000,
		finishTime: new Date().getTime() + 1000,
		peakTier: PeakTier.Medium
	}
];

// @ts-ignore
globalClient.channels.cache.get = () => ({ id: '1234', isTextBased: () => true, isDMBased: () => true, send: vi.fn() });
