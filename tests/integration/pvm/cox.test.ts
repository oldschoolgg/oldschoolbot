import { Bank, itemID, resolveItems } from 'oldschooljs';
import { expect, test } from 'vitest';

import { COXMaxMageGear, COXMaxMeleeGear, COXMaxRangeGear } from '../../../src/lib/data/cox.js';
import { raidCommand } from '../../../src/mahoji/commands/raid.js';
import { mockClient, mockUser } from '../util.js';

test('CoX ', async () => {
	await mockClient();

	const user = await mockUser({
		rangeGear: resolveItems(['Venator bow']),
		rangeLevel: 70,
		venatorBowCharges: 1000,
		slayerLevel: 70
	});
	await user.max();
	await user.update({
		tum_shadow_charges: 10000,
		scythe_of_vitur_charges: 100
	});
	await user.updateGear([
		{ setup: 'mage', gear: COXMaxMageGear.raw() },
		{ setup: 'melee', gear: COXMaxMeleeGear.raw() },
		{
			setup: 'range',
			gear: {
				...COXMaxRangeGear.raw(),
				ammo: {
					item: itemID('Dragon arrow'),
					quantity: 10000
				}
			}
		}
	]);
	await user.setBank(
		new Bank()
			.add('Shark', 10000)
			.add('Stamina potion(4)', 10000)
			.add('Super restore(4)', 10000)
			.add('Saradomin brew(4)', 10000)
	);
	await user.equip('melee', resolveItems(['Scythe of vitur']));
	const res = await user.runCmdAndTrip(raidCommand, {
		cox: {
			start: {
				type: 'fakemass',
				max_team_size: 5
			}
		}
	});
	expect(res.commandResult).toContain('the total trip will take');
	expect(user.bank.amount('Scythe of vitur (uncharged)')).toBe(1);
	expect(user.bank.amount('Scythe of vitur')).toBe(0);
	expect(user.gear.melee.get('weapon')?.item).toBeUndefined();
	expect(user.allItemsOwned.amount('Scythe of vitur (uncharged)')).toBe(1);
	expect(user.allItemsOwned.amount('Scythe of vitur')).toBe(0);
});
