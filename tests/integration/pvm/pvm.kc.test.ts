import { EMonster } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { minionKCommand } from '@/mahoji/commands/k.js';
import { minionCommand } from '@/mahoji/commands/minion.js';
import { createTestUser, mockClient } from '../util.js';

describe('Pvm - KC', async () => {
	await mockClient();

	it('Should add KC', async () => {
		const user = await createTestUser();
		const res = await user.runCommand(minionKCommand, { name: 'man', quantity: 10 });
		expect(res).toContain('now killing 10x Man');
		await user.runActivity();
		expect(await user.getKC(EMonster.MAN)).toEqual(10);
		expect(await user.runCommand(minionCommand, { kc: { name: 'man' } })).toEqual('Your Man KC is: 10.');

		const res2 = await user.runCommand(minionKCommand, { name: 'man', quantity: 10 });
		expect(res2).toContain('now killing 10x Man');
		await user.runActivity();
		expect(await user.getKC(EMonster.MAN)).toEqual(20);
		expect(await user.runCommand(minionCommand, { kc: { name: 'man' } })).toEqual('Your Man KC is: 20.');

		const res3 = await user.runCommand(minionKCommand, { name: 'cow', quantity: 10 });
		expect(res3).toContain('now killing 10x Cow');
		await user.runActivity();
		expect(await user.getKC(EMonster.COW)).toEqual(10);
		expect(await user.runCommand(minionCommand, { kc: { name: 'Cow' } })).toEqual('Your Cow KC is: 10.');
		expect(await user.getKC(EMonster.MAN)).toEqual(20);
	});
});
