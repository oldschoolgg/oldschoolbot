import { constructGearSetup, GearStat } from '../src/lib/gear';
import { Gear } from '../src/lib/structures/Gear';
import getOSItem from '../src/lib/util/getOSItem';
import itemID from '../src/lib/util/itemID';

describe('Gear', () => {
	const testGear = new Gear({
		'2h': 'Twisted bow',
		head: 'Dragon full helm',
		body: '3rd age platebody',
		legs: '3rd age platelegs'
	});

	test('misc', () => {
		expect(testGear['2h']).toEqual({ item: itemID('Twisted bow'), quantity: 1 });
		expect(testGear.head).toEqual({ item: itemID('Dragon full helm'), quantity: 1 });
		expect(testGear.feet).toEqual(null);

		const otherInitMethod = new Gear(
			constructGearSetup({
				'2h': 'Twisted bow',
				head: 'Dragon full helm',
				body: '3rd age platebody',
				legs: '3rd age platelegs'
			})
		);
		expect(otherInitMethod.raw()).toEqual(testGear.raw());
	});

	test('allItems', () => {
		const gear = new Gear({ head: 'Dragon full helm' });
		const allItems = gear.allItems();
		expect(allItems.length).toEqual(1);
		expect(allItems[0]).toEqual(itemID('Dragon full helm'));

		const allItems2 = gear.allItems(true);
		expect(allItems2.length).toEqual(2);
	});

	test('equippedWeapon', () => {
		expect(testGear.equippedWeapon()).toEqual(getOSItem('Twisted bow'));

		const noWeapon = new Gear();
		expect(noWeapon.equippedWeapon()).toEqual(null);

		const normalWeapon = new Gear({ weapon: 'Dragon dagger' });
		expect(normalWeapon.equippedWeapon()).toEqual(getOSItem('Dragon dagger'));
	});

	test('hasEquipped', () => {
		// Single items
		expect(testGear.hasEquipped('Twisted bow')).toEqual(true);
		expect(testGear.hasEquipped('Dragon full helm')).toEqual(true);
		expect(testGear.hasEquipped('Dragon full helm(g)')).toEqual(true);
		expect(testGear.hasEquipped('3rd age platebody')).toEqual(true);
		expect(testGear.hasEquipped('3rd age platelegs')).toEqual(true);
		expect(testGear.hasEquipped('Dragon dagger')).toEqual(false);
		expect(testGear.hasEquipped('Bronze arrow')).toEqual(false);
		// Multiple
		expect(testGear.hasEquipped(['Twisted bow', 'Bronze arrow'], true)).toEqual(false);
		expect(testGear.hasEquipped(['Twisted bow', 'Bronze arrow'], false)).toEqual(true);
		expect(testGear.hasEquipped(['Twisted bow'], false)).toEqual(true);
		expect(testGear.hasEquipped(['Bronze arrow'])).toEqual(false);
		expect(testGear.hasEquipped(['Bronze arrow'], false)).toEqual(false);
	});

	test('stats', () => {
		expect(testGear.stats).toEqual({
			attack_crush: 0,
			attack_magic: -51,
			attack_ranged: 65,
			attack_slash: 0,
			attack_stab: 0,
			defence_crush: 237,
			defence_magic: -10,
			defence_ranged: 218,
			defence_slash: 232,
			defence_stab: 219,
			magic_damage: 0,
			melee_strength: 0,
			prayer: 0,
			ranged_strength: 20
		});
		expect(new Gear().stats).toEqual({
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 0,
			attack_slash: 0,
			attack_stab: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,
			defence_slash: 0,
			defence_stab: 0,
			magic_damage: 0,
			melee_strength: 0,
			prayer: 0,
			ranged_strength: 0
		});
	});

	test('meetsStatRequirements', () => {
		expect(
			testGear.meetsStatRequirements({
				[GearStat.DefenceRanged]: 57 + 120,
				[GearStat.DefenceStab]: 47 + 26,
				[GearStat.AttackCrush]: 65
			})
		).toEqual([false, 'attack_crush', +0]);
		expect(
			testGear.meetsStatRequirements({
				[GearStat.AttackRanged]: 20
			})
		).toEqual([true, null, null]);
	});

	test('toString', () => {
		expect(testGear.toString()).toEqual(
			'3rd age platebody, Dragon full helm, 3rd age platelegs, Twisted bow'
		);
		expect(new Gear().toString()).toEqual('No items');
	});
});
