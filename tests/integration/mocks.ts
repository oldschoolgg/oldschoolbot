import { vi } from 'vitest';

vi.mock('../../src/lib/util/handleMahojiConfirmation.ts', () => ({
	handleMahojiConfirmation: vi.fn()
}));

vi.mock('../../src/lib/util/interactionReply', () => ({
	deferInteraction: vi.fn(),
	interactionReply: vi.fn()
}));
