import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { runRolesTask } from '../../src/lib/rolesTask';
import type { MinigameName } from '../../src/lib/settings/minigames';
import { Minigames } from '../../src/lib/settings/minigames';
import { userStatsBankUpdate } from '../../src/mahoji/mahojiSettings';
import { createTestUser, mockedId, unMockedCyptoRand } from './util';

describe.skip('Roles Task', async () => {
	test('Should not throw', async () => {
		const user = await createTestUser();
		await userStatsBankUpdate(user, 'sacrificed_bank', new Bank().add('Coal', 10_000));
		const ironUser = await createTestUser();
		await ironUser.update({ minion_ironman: true, sacrificedValue: 1_000_000 });
		await userStatsBankUpdate(ironUser, 'sacrificed_bank', new Bank().add('Coal', 10_000));

		// Create minigame scores:
		const minigames = Minigames.map(game => game.column).filter(i => i !== 'tithe_farm');
		const minigameUpdate: { [K in MinigameName]?: number } = {};
		for (const minigame of minigames) {
			minigameUpdate[minigame] = 1000;
		}
		await global.prisma!.minigame.upsert({
			where: { user_id: ironUser.id },
			update: minigameUpdate,
			create: { user_id: ironUser.id, ...minigameUpdate }
		});

		await global.prisma!.giveaway.create({
			data: {
				user_id: user.id,
				loot: { 995: 10_000 },
				start_date: new Date(),
				finish_date: new Date(Date.now() + Time.Hour),
				channel_id: '792691343284764693',
				message_id: mockedId(),
				reaction_id: mockedId(),
				users_entered: [],
				id: unMockedCyptoRand(1, 10_000_000),
				completed: false,
				duration: 10_000
			}
		});
		const result = await runRolesTask(true);
		expect(result).toBeTruthy();
		expect(result).includes('Roles');
	});
});
