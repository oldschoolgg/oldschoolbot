import { Routes } from '@oldschoolgg/discord';
import { MathRNG } from 'node-rng';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { BitField, globalConfig } from '../../../src/lib/constants.js';
import { adminCommand } from '../../../src/mahoji/commands/admin.js';
import { mockInteraction } from '../../test-utils/mockInteraction.js';
import { mockClient } from '../util.js';

describe('Admin desync command', () => {
	const restPutMock = vi.fn();

	beforeEach(() => {
		restPutMock.mockReset();
		restPutMock.mockResolvedValue(null);
	});

	test('keeps only admin/rp and clears global commands in non-production', async () => {
		expect(globalConfig.isProduction).toBe(false);

		const client = await mockClient();
		const user = await client.mockUser();
		await user.update({
			bitfield: {
				push: BitField.isModerator
			}
		});

		const originalAdminUserIDs = [...globalConfig.adminUserIDs];
		globalConfig.adminUserIDs = [...new Set([...globalConfig.adminUserIDs, user.id])];
		try {
			(globalClient as any).applicationId = '123456789012345678';
			(globalClient as any).rest = { put: restPutMock };
			const interaction = mockInteraction({ user });
			const confirmationSpy = vi.spyOn(interaction, 'confirmation');

			const result = await adminCommand.run({
				options: { desync_commands: {} } as any,
				userId: user.id,
				interaction,
				guildId: globalConfig.supportServerID,
				rng: MathRNG
			} as any);

			expect(confirmationSpy).toHaveBeenCalledTimes(1);
			expect(restPutMock).toHaveBeenCalledTimes(2);

			const [firstRoute, firstPayload] = restPutMock.mock.calls[0];
			expect(firstRoute).toBe(
				Routes.applicationGuildCommands(globalClient.applicationId, globalConfig.supportServerID)
			);
			expect(firstPayload.body.map((cmd: any) => cmd.name).sort()).toEqual(['admin', 'rp']);

			const [secondRoute, secondPayload] = restPutMock.mock.calls[1];
			expect(secondRoute).toBe(Routes.applicationCommands(globalClient.applicationId));
			expect(secondPayload.body).toEqual([]);
			expect(result).toContain('kept /admin, /rp');
			expect(result).toContain('up to 1 minute');
		} finally {
			globalConfig.adminUserIDs = originalAdminUserIDs;
		}
	});
});
