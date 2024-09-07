import { activity_type_enum } from '@prisma/client';
import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import { expect, test } from 'vitest';

import { minionKCommand } from '../../src/mahoji/commands/k';
import { createTestUser, mockClient, mockMathRandom } from './util';

test('Random Events', async () => {
	const unmock = mockMathRandom(0.03);
	const client = await mockClient();
	const user = await createTestUser();
	await user.runCommand(minionKCommand, { name: 'man' });
	await prisma.activity.updateMany({
		where: {
			user_id: BigInt(user.id),
			type: activity_type_enum.MonsterKilling
		},
		data: {
			duration: Time.Hour
		}
	});
	await client.processActivities();
	expect(await user.getKC(Monsters.Man.id)).toBeGreaterThan(1);
	// const userStats = await user.fetchStats({ random_event_completions_bank: true });
	await user.sync();
	// expect(userStats.random_event_completions_bank).toEqual({ 1: 1 });
	// expect(user.bank.amount("Beekeeper's hat")).toEqual(1);
	unmock();
});
