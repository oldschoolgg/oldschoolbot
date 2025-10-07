import { Routes } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ICommand } from '@/lib/discord/commandOptions.js';
import { bulkUpdateCommands } from '@/lib/discord/utils.js';

describe('bulkUpdateCommands', () => {
	const baseCommand: Pick<ICommand, 'description' | 'options' | 'run'> = {
		description: 'test command',
		options: [],
		run: vi.fn()
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not include guild-specific commands when syncing globally', async () => {
		const commands: ICommand[] = [
			{
				name: 'global-command',
				...baseCommand
			},
			{
				name: 'guild-command',
				guildID: '123',
				...baseCommand
			}
		];
		const mockPut = vi.fn().mockResolvedValue(null);
		const mockRest = { put: mockPut };

		await bulkUpdateCommands({
			commands: commands as any,
			guildID: null,
			rest: mockRest as any,
			applicationID: 'app-id'
		});

		expect(mockPut).toHaveBeenCalledTimes(1);
		expect(mockPut.mock.calls[0][0]).toBe(Routes.applicationCommands('app-id'));
		const body = mockPut.mock.calls[0][1].body as Array<{ name: string }>;
		expect(body).toHaveLength(1);
		expect(body[0]?.name).toBe('global-command');
	});
});
