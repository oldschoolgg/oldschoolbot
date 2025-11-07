import { beforeEach, describe, expect, it, vi } from 'vitest';

const rawCommandHandlerInner = vi.fn(async () => 'ok');

vi.mock('@/lib/discord/commandHandler.js', () => ({
	rawCommandHandlerInner
}));
vi.mock('@/lib/discord/commandHandler.ts', () => ({
	rawCommandHandlerInner
}));
vi.mock('src/lib/discord/commandHandler.js', () => ({
	rawCommandHandlerInner
}));
vi.mock('src/lib/discord/commandHandler.ts', () => ({
	rawCommandHandlerInner
}));

const fakeUpdateUserLastCommandDate = vi.fn(() => ({
	catch: () => {}
}));

vi.mock('src/lib/rawSql.js', () => ({
	RawSQL: {
		updateUserLastCommandDate: fakeUpdateUserLastCommandDate
	}
}));
vi.mock('src/lib/rawSql.ts', () => ({
	RawSQL: {
		updateUserLastCommandDate: fakeUpdateUserLastCommandDate
	}
}));
vi.mock('@/lib/rawSql.js', () => ({
	RawSQL: {
		updateUserLastCommandDate: fakeUpdateUserLastCommandDate
	}
}));
vi.mock('@/lib/rawSql.ts', () => ({
	RawSQL: {
		updateUserLastCommandDate: fakeUpdateUserLastCommandDate
	}
}));

(global as any).mUserFetch = vi.fn(async () => ({
	id: '1',
	user: {
		completed_achievement_diaries: []
	}
}));

(global as any).prisma = {
	$executeRawUnsafe: vi.fn()
};

const { runCommand } = await import('@/lib/settings/settings.js');

describe('runCommand', () => {
	beforeEach(() => {
		(global as any).globalClient = {
			allCommands: [{ name: 'test-command' }]
		};
		rawCommandHandlerInner.mockClear();
		fakeUpdateUserLastCommandDate.mockClear();
	});

	it('ignores busy checks when continuing a command', async () => {
		await runCommand({
			commandName: 'test-command',
			args: {} as any,
			user: {} as any,
			interaction: { user: { id: '1' } } as any,
			continueDeltaMillis: null,
			isContinue: true
		});

		expect(rawCommandHandlerInner).toHaveBeenCalledWith(
			expect.objectContaining({
				ignoreUserIsBusy: true
			})
		);
	});

	it('respects explicit ignore flag when provided', async () => {
		await runCommand({
			commandName: 'test-command',
			args: {} as any,
			user: {} as any,
			interaction: { user: { id: '1' } } as any,
			continueDeltaMillis: null,
			ignoreUserIsBusy: true
		});

		expect(rawCommandHandlerInner).toHaveBeenCalledWith(
			expect.objectContaining({
				ignoreUserIsBusy: true
			})
		);
	});

	it('keeps busy checks enabled for normal invocations', async () => {
		await runCommand({
			commandName: 'test-command',
			args: {} as any,
			user: {} as any,
			interaction: { user: { id: '1' } } as any,
			continueDeltaMillis: null
		});

		const calls = rawCommandHandlerInner.mock.calls as any[];
		expect(calls.length).toBeGreaterThan(0);

		const lastCall = calls[calls.length - 1] as any[];
		const callArgs = lastCall[0] as any;

		expect(callArgs.ignoreUserIsBusy).toBeUndefined();
	});
});
