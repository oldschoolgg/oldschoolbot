import { expect, test } from 'vitest';

import { COXMaxMageGear, COXMaxMeleeGear, COXMaxRangeGear } from '../../../src/lib/data/cox';
import { Bank, itemID, resolveItems } from '../../../src/lib/util';
import { raidCommand } from '../../../src/mahoji/commands/raid';
import { mockClient, mockUser } from '../util';

test('CoX ', async () => {
	const client = await mockClient();

	const user = await mockUser({
		rangeGear: resolveItems(['Venator bow']),
		rangeLevel: 70,
		venatorBowCharges: 1000,
		slayerLevel: 70
	});
	await user.max();

	await user.update({
		tum_shadow_charges: 10000,
		scythe_of_vitur_charges: 100,
		gear_mage: COXMaxMageGear.raw() as any,
		gear_melee: COXMaxMeleeGear.raw() as any,
		gear_range: {
			...(COXMaxRangeGear.raw() as any),
			ammo: {
				item: itemID('Dragon arrow'),
				quantity: 10000
			}
		},
		bank: new Bank()
			.add('Shark', 10000)
			.add('Stamina potion(4)', 10000)
			.add('Super restore(4)', 10000)
			.add('Saradomin brew(4)', 10000)
			.toJSON()
	});
	await user.equip('melee', resolveItems(['Scythe of vitur']));
	const res = await user.runCommand(
		raidCommand,
		{
			cox: {
				start: {
					type: 'fakemass',
					max_team_size: 5
				}
			}
		},
		true
	);
	expect(res).toContain('the total trip will take');
	await user.processActivities(client);
	await user.sync();
	expect(user.bank.amount('Scythe of vitur (uncharged)')).toBe(1);
	expect(user.bank.amount('Scythe of vitur')).toBe(0);
	expect(user.gear.melee.weapon?.item).toBeUndefined();
	expect(user.allItemsOwned.amount('Scythe of vitur (uncharged)')).toBe(1);
	expect(user.allItemsOwned.amount('Scythe of vitur')).toBe(0);
});
