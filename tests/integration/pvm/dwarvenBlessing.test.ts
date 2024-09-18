import { Bank, EMonster } from 'oldschooljs';
import { describe, expect, it, test } from 'vitest';

import { calculateDwarvenBlessingPotsNeeded } from '../../../src/lib/bso/dwarvenBlessing';
import { resolveItems } from '../../../src/lib/util';
import { mockClient } from '../util';

describe('Dwarven Blessing', async () => {
	const client = await mockClient();

	it('should use dwarven blessing', async () => {
		const user = await client.mockUser({
			bank: new Bank().add('Prayer potion(4)', 100),
			rangeLevel: 99,
			QP: 300,
			maxed: true,
			meleeGear: resolveItems(['Dwarven blessing'])
		});
		const result = await user.kill(EMonster.MAN);
		const duration = result.activityResult!.duration;
		const potsUsed = calculateDwarvenBlessingPotsNeeded(duration);
		expect(user.bank.amount('Prayer potion(4)')).toEqual(100 - potsUsed);
		expect(result.commandResult).toContain('20% boost from Dwarven blessing');
		expect(result.commandResult).toContain(`${potsUsed}x Prayer potion(4)`);
	});

	test('no dwarven blessing boost if no prayer pots', async () => {
		const user = await client.mockUser({
			bank: new Bank(),
			rangeLevel: 99,
			QP: 300,
			maxed: true,
			meleeGear: resolveItems(['Dwarven blessing'])
		});
		const result = await user.kill(EMonster.MAN);
		expect(result.commandResult).toContain('is now killing');
		expect(result.commandResult).not.toContain('Dwarven blessing');
	});
});
