import { EMonster } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { UpdateBank } from '@/lib/structures/UpdateBank.js';
import { minionKCommand } from '@/mahoji/commands/k.js';
import { minionCommand } from '@/mahoji/commands/minion.js';
import { createTestUser, mockClient } from '../util.js';

describe('Pvm - KC', async () => {
	await mockClient();

	it('Should add KC', async () => {
		const user = await createTestUser();
		const res = await user.runCmdAndTrip(minionKCommand, { name: 'man', quantity: 10 });
		expect(res.commandResult).toContain('now killing 10x Man');
		expect(await user.getKC(EMonster.MAN)).toEqual(10);
		expect(await user.runCommand(minionCommand, { kc: { name: 'man' } })).toEqual('Your Man KC is: 10.');

		const res2 = await user.runCmdAndTrip(minionKCommand, { name: 'man', quantity: 10 });
		expect(res2.commandResult).toContain('now killing 10x Man');
		expect(await user.getKC(EMonster.MAN)).toEqual(20);
		expect(await user.runCommand(minionCommand, { kc: { name: 'man' } })).toEqual('Your Man KC is: 20.');

		const res3 = await user.runCmdAndTrip(minionKCommand, { name: 'cow', quantity: 10 });
		expect(res3.commandResult).toContain('now killing 10x Cow');
		expect(await user.getKC(EMonster.COW)).toEqual(10);
		expect(await user.runCommand(minionCommand, { kc: { name: 'Cow' } })).toEqual('Your Cow KC is: 10.');
		expect(await user.getKC(EMonster.MAN)).toEqual(20);
	});

	it('Should add KC with UpdateBank', async () => {
		const user = await createTestUser();
		const updateBank = new UpdateBank();
		updateBank.kcBank.add(EMonster.MAN, 10);
		updateBank.kcBank.add(EMonster.COW, 12);
		await updateBank.transact(user);
		expect(await user.getKC(EMonster.MAN)).toEqual(10);
		expect(await user.getKC(EMonster.COW)).toEqual(12);

		const updateBank2 = new UpdateBank();
		updateBank2.kcBank.add(EMonster.MAN, 10);
		updateBank2.kcBank.add(EMonster.COMMANDER_ZILYANA, 12);
		await updateBank2.transact(user);
		expect(await user.getKC(EMonster.MAN)).toEqual(20);
		expect(await user.getKC(EMonster.COMMANDER_ZILYANA)).toEqual(12);
	});

	it('Should add KC with muser methods', async () => {
		const user = await createTestUser();
		expect(await user.getKC(EMonster.MAN)).toEqual(0);
		await user.incrementKC(EMonster.MAN, 10);
		await user.incrementKC(EMonster.COW, 12);
		expect(await user.getKC(EMonster.MAN)).toEqual(10);
		expect(await user.getKC(EMonster.COW)).toEqual(12);

		await user.incrementKC(EMonster.MAN, 10);
		expect(await user.getKC(EMonster.MAN)).toEqual(20);

		const monsters = [
			EMonster.COMMANDER_ZILYANA,
			EMonster.GENERAL_GRAARDOR,
			EMonster.KRIL_TSUTSAROTH,
			EMonster.KREEARRA,
			EMonster.GARGOYLE,
			EMonster.ANKOU,
			EMonster.ARMADYLIAN_GUARD
		];
		await Promise.all(monsters.map(async mon => user.incrementKC(mon, 1000)));
		for (const mon of monsters) {
			expect(await user.getKC(mon)).toEqual(1000);
		}
	});
});
