import { Bank } from 'oldschooljs';
import { describe, expect, it, test } from 'vitest';

import { GearStat } from '../src/lib/gear/types';
import { bankIsEqual } from '../src/lib/stressTest';
import { constructGearSetup, Gear } from '../src/lib/structures/Gear';
import { itemNameFromID } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';
import itemID from '../src/lib/util/itemID';

describe('Gear', () => {
	const testGear = new Gear({
		'2h': 'Twisted bow',
		head: 'Dragon full helm(g)',
		body: '3rd age platebody',
		legs: '3rd age platelegs'
	});

	test('misc', () => {
		expect(testGear['2h']).toEqual({ item: itemID('Twisted bow'), quantity: 1 });
		expect(testGear.head).toEqual({ item: itemID('Dragon full helm (g)'), quantity: 1 });
		expect(testGear.feet).toEqual(null);

		const otherInitMethod = new Gear(
			constructGearSetup({
				'2h': 'Twisted bow',
				head: 'Dragon full helm (g)',
				body: '3rd age platebody',
				legs: '3rd age platelegs'
			})
		);
		expect(otherInitMethod.raw()).toEqual(testGear.raw());
	});

	test('allItems', () => {
		const gear = new Gear({ cape: 'Max cape' });
		const allItems = gear.allItems(true).map(itemNameFromID).sort();
		expect(allItems).toEqual(
			[
				'Max cape',
				'Graceful cape',
				'Agility cape',
				'Attack cape',
				'Construct. cape',
				'Cooking cape',
				'Crafting cape',
				'Defence cape',
				'Farming cape',
				'Firemaking cape',
				'Fishing cape',
				'Fletching cape',
				'Herblore cape',
				'Hitpoints cape',
				'Hunter cape',
				'Magic cape',
				'Mining cape',
				'Prayer cape',
				'Ranging cape',
				'Runecraft cape',
				'Slayer cape',
				'Smithing cape',
				'Strength cape',
				'Thieving cape',
				'Woodcutting cape'
			].sort()
		);
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
		expect(testGear.hasEquipped(itemID('Bronze arrow'))).toEqual(false);
		expect(testGear.hasEquipped(itemID('Twisted bow'))).toEqual(true);

		const testGear2 = new Gear({
			weapon: '3rd age pickaxe',
			feet: 'Dragon boots (g)'
		});
		expect(testGear2.hasEquipped('Dragon pickaxe')).toEqual(true);
		expect(testGear2.hasEquipped('3rd age pickaxe')).toEqual(true);
		expect(testGear2.hasEquipped('Rune pickaxe')).toEqual(false);
		expect(testGear2.hasEquipped('Dragon boots')).toEqual(true);
		expect(testGear2.hasEquipped('Dragon boots (g)')).toEqual(true);

		const testGear3 = new Gear({
			feet: 'Dragon boots'
		});
		expect(testGear3.hasEquipped('Dragon boots')).toEqual(true);
		expect(testGear3.hasEquipped('Dragon boots (g)')).toEqual(false);
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
		expect(testGear.toString()).toEqual('3rd age platebody, Dragon full helm (g), 3rd age platelegs, Twisted bow');
		expect(new Gear().toString()).toEqual('No items');
	});

	test('allItemsBank', () => {
		const gear = new Gear({
			ammo: 'Dragon arrow',
			body: '3rd age platebody'
		});
		gear.ammo!.quantity = 1000;
		expect(bankIsEqual(gear.allItemsBank(), new Bank().add('Dragon arrow', 1000).add('3rd age platebody'))).toEqual(
			true
		);
	});

	it('should equip/refund properly if equipping over a 2h', () => {
		const gear = new Gear({
			ammo: 'Dragon arrow',
			body: '3rd age platebody',
			'2h': 'Armadyl godsword'
		});

		const result = gear.equip(getOSItem('Dragon dagger'));

		expect(bankIsEqual(result.refundBank as any, new Bank().add('Armadyl godsword'))).toEqual(true);
		expect(gear['2h']).toEqual(null);
		expect(gear.shield).toEqual(null);
		expect(gear.weapon).toEqual({ item: getOSItem('Dragon dagger').id, quantity: 1 });
	});

	it('should equip/refund properly if equipping a 2h', () => {
		const gear = new Gear({
			ammo: 'Dragon arrow',
			body: '3rd age platebody',
			weapon: 'Dragon dagger',
			shield: 'Bronze kiteshield'
		});

		gear.equip(getOSItem('Armadyl godsword'));
		gear.equip(getOSItem('Dragon dagger'));
		gear.equip(getOSItem('Bronze kiteshield'));
		const result = gear.equip(getOSItem('Armadyl godsword'));

		expect(bankIsEqual(result.refundBank as any, new Bank().add('Dragon dagger').add('Bronze kiteshield'))).toEqual(
			true
		);
		expect(gear.weapon).toEqual(null);
		expect(gear.shield).toEqual(null);
		expect(gear['2h']).toEqual({ item: getOSItem('Armadyl godsword').id, quantity: 1 });
	});

	it('should equip/refund properly if equipping a 2h', () => {
		const gear = new Gear({
			ammo: 'Dragon arrow',
			body: '3rd age platebody',
			weapon: 'Dragon dagger',
			shield: 'Bronze kiteshield'
		});

		const result = gear.equip(getOSItem('Armadyl godsword'));

		expect(bankIsEqual(result.refundBank as any, new Bank().add('Dragon dagger').add('Bronze kiteshield'))).toEqual(
			true
		);
		expect(gear.weapon).toEqual(null);
		expect(gear.shield).toEqual(null);
		expect(gear['2h']).toEqual({ item: getOSItem('Armadyl godsword').id, quantity: 1 });
	});

	it('should equip/refund properly if equipping a 2h', () => {
		const gear = new Gear({
			ammo: 'Dragon arrow',
			body: '3rd age platebody',
			weapon: 'Dragon dagger',
			shield: 'Bronze kiteshield'
		});

		const result = gear.equip(getOSItem('Bronze dagger'));

		expect(bankIsEqual(result.refundBank as any, new Bank().add('Dragon dagger'))).toEqual(true);
		expect(gear.shield).toEqual({ item: getOSItem('Bronze kiteshield').id, quantity: 1 });
		expect(gear.weapon).toEqual({ item: getOSItem('Bronze dagger').id, quantity: 1 });
	});

	it('should equip/refund properly if equipping a top', () => {
		const gear = new Gear({
			ammo: 'Dragon arrow',
			body: '3rd age platebody'
		});

		const result = gear.equip(getOSItem('Bronze platebody'));

		expect(bankIsEqual(result.refundBank as any, new Bank().add('3rd age platebody'))).toEqual(true);
		expect(gear.body).toEqual({ item: getOSItem('Bronze platebody').id, quantity: 1 });
	});

	it('should clone without affecting cloned gear', () => {
		const gear = new Gear({
			ammo: 'Dragon arrow',
			body: '3rd age platebody'
		});

		const clonedGear = gear.clone();

		expect(gear.raw()).toEqual(clonedGear.raw());

		clonedGear.body = null;

		expect(gear.body).toEqual({ item: getOSItem('3rd age platebody').id, quantity: 1 });
	});
});
