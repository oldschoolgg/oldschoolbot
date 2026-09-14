import { describe, expect, test } from 'vitest';

import type { UserFullGearSetup } from '@/lib/gear/types.js';
import { applySharedPrimaryGearEffects, Gear } from '@/lib/structures/Gear.js';
import { gearUnequipCommand } from '@/mahoji/lib/abstracted_commands/gearCommands.js';

function makeTestGear(): UserFullGearSetup {
	return {
		melee: new Gear(),
		mage: new Gear(),
		range: new Gear(),
		fashion: new Gear(),
		wildy: new Gear(),
		skilling: new Gear(),
		misc: new Gear(),
		other: new Gear()
	};
}

describe('gearUnequipCommand', () => {
	test('does not unequip shared Avernic treads from an empty setup slot', async () => {
		const gear = makeTestGear();
		gear.mage.equip('Avernic treads (max)');
		applySharedPrimaryGearEffects(gear);

		const response = await gearUnequipCommand(
			{
				id: '1',
				gear,
				minionIsBusy: async () => false
			} as MUser,
			'range',
			'Avernic treads (max)',
			false
		);

		expect(response).toBe(
			"You can't unequip Avernic treads (max) from your Range setup because they're shared from your Mage setup. Unequip them from there instead."
		);
	});
});
