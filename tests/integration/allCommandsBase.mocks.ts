import { vi } from 'vitest';

vi.mock('../../src/lib/util/minionIsBusy', async () => {
	const actual = await vi.importActual<typeof import('../../src/lib/util/minionIsBusy')>(
		'../../src/lib/util/minionIsBusy'
	);

	return {
		...actual,
		getActivityOfUser: vi.fn().mockReturnValue(() => {
			console.log('FFFFFFFFFFFFFFFFFFFFFFF');
			return null;
		}),
		minionIsBusy: vi.fn().mockReturnValue(false)
	};
});
vi.mock('../../src/lib/util/handleMahojiConfirmation.ts', () => ({
	handleMahojiConfirmation: vi.fn()
}));

vi.mock('../../src/lib/util/minionIsBusy.js', () => ({
	getActivityOfUser: vi.fn().mockReturnValue(() => {
		console.log(`
		
		
		
		
		
		FFFFFFFFFFFFFFFFFFFFFFF
		
		
		
		
		`);
		return null;
	}),
	minionIsBusy: vi.fn().mockReturnValue(false)
}));
