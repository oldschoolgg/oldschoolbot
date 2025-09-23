import { vi } from 'vitest';

vi.mock('../../src/lib/util/handleMahojiConfirmation.ts', () => ({
	handleMahojiConfirmation: vi.fn()
}));
