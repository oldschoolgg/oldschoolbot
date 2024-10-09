import type { GearPreset } from '@prisma/client';
import { Bank, itemID } from 'oldschooljs';
import { describe, expect, it, test } from 'vitest';

import { GearStat } from '../../src/lib/gear/types';
import { Gear, constructGearSetup } from '../../src/lib/structures/Gear';
import { itemNameFromID } from '../../src/lib/util';
import getOSItem from '../../src/lib/util/getOSItem';

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
		expect(gear.allItemsBank().equals(new Bank().add('Dragon arrow', 1000).add('3rd age platebody'))).toEqual(true);
	});

	it('should equip/refund properly if equipping over a 2h', () => {
		const gear = new Gear({
			ammo: 'Dragon arrow',
			body: '3rd age platebody',
			'2h': 'Armadyl godsword'
		});

		const result = gear.equip(getOSItem('Dragon dagger'));

		expect(result.refundBank?.equals(new Bank().add('Armadyl godsword'))).toEqual(true);
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

		expect(result.refundBank?.equals(new Bank().add('Dragon dagger').add('Bronze kiteshield'))).toEqual(true);
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

		expect(result.refundBank?.equals(new Bank().add('Dragon dagger').add('Bronze kiteshield'))).toEqual(true);
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

		expect(result.refundBank?.equals(new Bank().add('Dragon dagger'))).toEqual(true);
		expect(gear.shield).toEqual({ item: getOSItem('Bronze kiteshield').id, quantity: 1 });
		expect(gear.weapon).toEqual({ item: getOSItem('Bronze dagger').id, quantity: 1 });
	});

	it('should equip/refund properly if equipping a top', () => {
		const gear = new Gear({
			ammo: 'Dragon arrow',
			body: '3rd age platebody'
		});

		const result = gear.equip(getOSItem('Bronze platebody'));

		expect(result.refundBank?.equals(new Bank().add('3rd age platebody'))).toEqual(true);
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

	it('should handle equipping ammo', () => {
		const gear = new Gear({
			ammo: 'Bronze arrow',
			body: '3rd age platebody'
		});

		const equipRes1 = gear.equip('Dragon arrow', 1000);
		expect(equipRes1.refundBank?.toJSON()).toEqual(new Bank().add('Bronze arrow').toJSON());
		expect(gear.ammo).toEqual({ item: getOSItem('Dragon arrow').id, quantity: 1000 });
	});

	it('should refund 2h if wearing 2h', () => {
		const gear = new Gear({
			'2h': 'Armadyl godsword'
		});

		const equipRes1 = gear.equip('Dragon 2h sword');
		expect(equipRes1.refundBank?.toJSON()).toEqual(new Bank().add('Armadyl godsword').toJSON());
		expect(gear['2h']).toEqual({ item: getOSItem('Dragon 2h sword').id, quantity: 1 });
	});

	it('should refund 2h if equipping 1h', () => {
		const gear = new Gear({
			'2h': 'Armadyl godsword'
		});

		const equipRes1 = gear.equip('Dragon dagger');
		expect(equipRes1.refundBank?.toJSON()).toEqual(new Bank().add('Armadyl godsword').toJSON());
		expect(gear.weapon).toEqual({ item: getOSItem('Dragon dagger').id, quantity: 1 });
	});

	it('should refund shield if equipping 2h', () => {
		const gear = new Gear({
			shield: 'Bronze kiteshield'
		});

		const equipRes1 = gear.equip('Armadyl godsword');
		expect(equipRes1.refundBank?.toJSON()).toEqual(new Bank().add('Bronze kiteshield').toJSON());
		expect(gear['2h']).toEqual({ item: getOSItem('Armadyl godsword').id, quantity: 1 });
	});

	it('should make from gear preset', () => {
		const gearPreset: GearPreset = {
			name: 'graceful',
			user_id: '123',
			head: itemID('Graceful hood'),
			neck: itemID('Amulet of fury'),
			body: itemID('Graceful top'),
			legs: itemID('Graceful legs'),
			cape: itemID('Graceful cape'),
			two_handed: itemID('Bronze 2h sword'),
			hands: itemID('Graceful gloves'),
			feet: itemID('Graceful boots'),
			shield: null,
			weapon: null,
			ring: itemID('Berserker ring'),
			ammo: itemID('Dragon arrow'),
			ammo_qty: 153,
			emoji_id: null,
			times_equipped: 0,
			pinned_setup: null
		};
		const gear = new Gear(gearPreset);
		expect(gear.allItemsBank()).toEqual(
			new Bank()
				.add('Graceful hood')
				.add('Graceful top')
				.add('Graceful legs')
				.add('Graceful cape')
				.add('Graceful gloves')
				.add('Graceful boots')
				.add('Amulet of fury')
				.add('Berserker ring')
				.add('Dragon arrow', 153)
				.add('Bronze 2h sword')
		);
	});

	it('should make nothing from empty gear preset', () => {
		const gearPreset: GearPreset = {
			name: 'graceful',
			user_id: '123',
			head: null,
			neck: null,
			body: null,
			legs: null,
			cape: null,
			two_handed: null,
			hands: null,
			feet: null,
			shield: null,
			weapon: null,
			ring: null,
			ammo: null,
			ammo_qty: null,
			emoji_id: null,
			times_equipped: 0,
			pinned_setup: null
		};
		const gear = new Gear(gearPreset);
		expect(gear.allItemsBank()).toEqual(new Bank());
	});

	it('should throw if equip unequippable', () => {
		const gear = new Gear();
		expect(() => gear.equip('Coal')).toThrow();
	});

	it('equipping items with quantities', () => {
		const gear = new Gear({
			ammo: 'Dragon arrow',
			body: '3rd age platebody',
			weapon: 'Dragon knife',
			shield: 'Bronze kiteshield'
		});
		gear.ammo!.quantity = 500;
		gear.weapon!.quantity = 100;

		// Equip arrows:
		const resultArrows = gear.equip(getOSItem('Iron arrow'), 50);
		expect(resultArrows.refundBank?.equals(new Bank().add('Dragon arrow', 500))).toEqual(true);
		expect(gear.ammo).toEqual({ item: getOSItem('Iron arrow').id, quantity: 50 });

		// Equip darts/stackable weapon:

		const resultDarts = gear.equip(getOSItem('Dragon dart'), 111);
		expect(resultDarts.refundBank?.equals(new Bank().add('Dragon knife', 100))).toEqual(true);
		expect(gear.weapon).toEqual({ item: getOSItem('Dragon dart').id, quantity: 111 });

		const result2h = gear.equip(getOSItem('Twisted bow'));
		expect(result2h.refundBank?.equals(new Bank().add('Dragon dart', 111).add('Bronze kiteshield'))).toEqual(true);
		expect(gear.weapon).toBeNull();
		expect(gear['2h']).toEqual({ item: getOSItem('Twisted bow').id, quantity: 1 });
	});

	it('should equip/refund properly if equipping a 2h over a 2h', () => {
		const gear = new Gear({
			'2h': 'Twisted bow'
		});

		const result = gear.equip(getOSItem('3rd age bow'));

		expect(result.refundBank?.equals(new Bank().add('Twisted bow'))).toEqual(true);
		expect(gear.shield).toEqual(null);
		expect(gear.weapon).toEqual(null);
		expect(gear['2h']).toEqual({ item: getOSItem('3rd age bow').id, quantity: 1 });
	});
});
