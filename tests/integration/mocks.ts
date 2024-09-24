import { beforeEach, vi } from 'vitest';

import { BankImageTask } from '../../src/lib/bankImage';
import { PeakTier } from '../../src/lib/constants';
import { CanvasImage } from '../../src/lib/util/canvasUtil';

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
	getItemImage: vi.fn().mockReturnValue(Promise.resolve(new CanvasImage())),
	fetchAndCacheImage: vi.fn().mockReturnValue(Promise.resolve(new CanvasImage()))
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
