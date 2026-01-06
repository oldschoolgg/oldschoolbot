import { EMonster, Monsters } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { BitField } from '@/lib/constants.js';
import { slayerMasters } from '@/lib/slayer/slayerMasters.js';
import { SlayerTaskUnlocksEnum } from '@/lib/slayer/slayerUnlocks.js';
import { getAssignableSlayerTaskIDs } from '@/lib/slayer/slayerUtil.js';
import { slayerCommand } from '@/mahoji/commands/slayer.js';
import { createTestUser, mockClient, mockMathRandom } from '../util.js';

describe('Slayer Tasks', async () => {
	await mockClient();
	expect(Monsters.Man.id).toBe(EMonster.MAN);

	test('Various', async () => {
		const user = await createTestUser();
		mockMathRandom(0.1);
		expect(Math.random()).toEqual(0.1);
		const res: any = await user.runCommand(slayerCommand, { new_task: {} });
		expect(res.content).toContain('has assigned you to kill');

		const res2: any = await user.runCommand(slayerCommand, { new_task: {} });
		expect(res2.content).toContain('You already have a slayer task');
		expect(res2.content).toContain('Your current task');
		expect(Math.random()).toEqual(0.1);
		const res3 = await user.runCommand(slayerCommand, { manage: { command: 'skip' } });
		expect(res3).toContain('You need 30 points to cancel, you only have: 0.');

		await user.update({ slayer_points: 100 });
		const res4 = await user.runCommand(slayerCommand, { manage: { command: 'skip' } });
		expect(res4).toContain('Your task has been skipped. You now have 70 slayer points');

		const res5: any = await user.runCommand(slayerCommand, { new_task: {} });
		expect(res5.content).toContain('has assigned you to kill');
		expect(Math.random()).toEqual(0.1);
		await user.update({ QP: 150 });
		const res6 = await user.runCommand(slayerCommand, { manage: { command: 'block' } });
		expect(res6).toContain('You need 100 points to block, you only have: 70');

		await user.update({ slayer_points: 150 });
		const res7 = await user.runCommand(slayerCommand, { manage: { command: 'block' } });
		expect(res7).toContain('Your task has been blocked. You now have 50 slayer points.');
		await user.sync();
		expect(Math.random()).toEqual(0.1);
		expect(user.user.slayer_blocked_ids).toHaveLength(1);
		expect(user.user.slayer_blocked_ids[0]).toEqual(655);
		expect(user.user.slayer_points).toEqual(50);

		expect(await user.runCommand(slayerCommand, { status: {} })).toContain(
			'You have 50 slayer points, and have completed 0 tasks in a row and 0 wilderness tasks in a row.'
		);

		expect(((await user.runCommand(slayerCommand, { new_task: {} })) as any).content).toContain(
			'has assigned you to kill'
		);

		expect(await user.runCommand(slayerCommand, { status: {} })).toContain(
			'Your current task from Turael is to kill **Birds** (**Alternate Monsters**: Chicken, Duck, Duckling, Mounted terrorbird gnome, Penguin, Rooster, Seagull, Terrorbird). You have 16 kills remaining.'
		);
	});

	test('Assignable task checks and skip list validation', async () => {
		const user = await createTestUser(undefined, { bitfield: [BitField.IsPatronTier1] });
		await user.max();
		await user.update({ slayer_unlocks: [] });
		const duradel = slayerMasters.find(m => m.name === 'Duradel')!;

		const assignableWithoutUnlock = getAssignableSlayerTaskIDs(user, duradel);
		expect(assignableWithoutUnlock).not.toContain(Monsters.AbyssalSire.id);

		const addSkipWithoutUnlock = await user.runCommand(slayerCommand, {
			skip_list: { action: 'add', master: 'Duradel', monster: 'Abyssal Sire' }
		});
		expect(addSkipWithoutUnlock).toContain("can't currently be assigned");

		await user.update({ slayer_unlocks: [SlayerTaskUnlocksEnum.LikeABoss] });
		const assignableWithUnlock = getAssignableSlayerTaskIDs(user, duradel);
		expect(assignableWithUnlock).toContain(Monsters.AbyssalSire.id);

		const addSkipWithUnlock = await user.runCommand(slayerCommand, {
			skip_list: { action: 'add', master: 'Duradel', monster: 'Abyssal Sire' }
		});
		expect(addSkipWithUnlock).toContain('Added');
		expect(addSkipWithUnlock).toContain("Duradel's skip list");
	});
});
