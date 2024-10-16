import { vi } from 'vitest';

import { PeakTier } from '../../src/lib/constants';

vi.mock('../../src/lib/util/handleMahojiConfirmation.ts', () => ({
	handleMahojiConfirmation: vi.fn()
}));

vi.mock('../../src/lib/util/interactionReply', () => ({
	deferInteraction: vi.fn(),
	interactionReply: vi.fn()
}));

globalClient._peakIntervalCache = [
	{
		startTime: new Date().getTime() - 1000,
		finishTime: new Date().getTime() + 1000,
		peakTier: PeakTier.Medium
	}
];
