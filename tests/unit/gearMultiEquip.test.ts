import { Bank, EquipmentSlot, convertLVLtoXP, itemID } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { Gear } from '../../src/lib/structures/Gear';
import { gearEquipMultiImpl } from '../../src/lib/util/equipMulti';
import { mockMUser } from './userutil';

describe('Multi-equip Gear Test', () => {
	const userBank = new Bank();
	userBank
		.add('Elysian spirit shield', 3)
		.add('Zaryte crossbow', 1)
		.add('Pegasian boots', 1)
		.add('Dragon boots')
		.add('Eternal boots')
		.add('Dragon arrow', 1000)
		.add('Rune arrow', 5000)
		.add('Twisted bow')
		.add('Dragon dart', 5000);

	const testUser = mockMUser({
		skills_agility: convertLVLtoXP(50),
		skills_ranged: convertLVLtoXP(99),
		skills_defence: convertLVLtoXP(99),
		GP: 100_000,
		bank: userBank,
		cl: new Bank().add('Coal'),
		meleeGear: {
			'2h': 'Twisted bow',
			head: 'Armadyl helmet',
			body: 'Dragon platebody',
			legs: 'Dragon platelegs'
		}
	});
	test('multi-equip-1', () => {
		const test1String1 = '2 elysian spirit shield, zaryte crossbow, 500 rune arrow';
		const result = gearEquipMultiImpl(testUser, 'melee', test1String1);
		const test1Gear1 = new Gear(result.equippedGear);
		expect(result.equipBank!.toString()).toEqual('500x Rune arrow, 1x Zaryte crossbow');
		expect(result.unequipBank!.toString()).toEqual('1x Twisted bow');
		expect(result.skillFailBank!.toString()).toEqual('1x Elysian spirit shield');
		expect(test1Gear1.toString()).toEqual(
			'Rune arrow, Dragon platebody, Armadyl helmet, Dragon platelegs, Zaryte crossbow'
		);
		expect(test1Gear1.ammo?.quantity).toEqual(500);
	});

	const testGear2 = new Gear({
		weapon: 'Zaryte crossbow',
		shield: 'Dragonfire shield',
		head: 'Armadyl helmet',
		body: 'Dragon platebody',
		legs: 'Dragon platelegs',
		ammo: 'Rune arrow'
	});
	testGear2.ammo!.quantity = 500;

	const testUser2 = mockMUser({
		skills_agility: convertLVLtoXP(50),
		skills_ranged: convertLVLtoXP(99),
		skills_defence: convertLVLtoXP(99),
		skills_prayer: convertLVLtoXP(99),
		GP: 100_000,
		bank: userBank,
		cl: new Bank().add('Coal'),
		meleeGear: testGear2.raw()
	});

	// Test trying to equip multiple of an item, as well as 2h handling, and conflicting shield/2h combos specified
	test('multi-equip-2', () => {
		const testInput = '3 elysian spirit shield, 2 twisted bow, 999 dragon arrow, primordial boots, robin hood hat';
		const result = gearEquipMultiImpl(testUser2, 'melee', testInput);
		const resultGear = new Gear(result.equippedGear);
		expect(result.equipBank!.toString()).toEqual('999x Dragon arrow, 1x Elysian spirit shield');
		expect(result.unequipBank!.toString()).toEqual('1x Dragonfire shield, 500x Rune arrow');
		expect(result.skillFailBank!.toString()).toEqual('No items');
		expect(resultGear.toString()).toEqual(
			'Dragon arrow, Dragon platebody, Armadyl helmet, Dragon platelegs, Elysian spirit shield, Zaryte crossbow'
		);
		expect(resultGear.ammo?.quantity).toEqual(999);
	});
	// Test equipping random items, and 2h item equipping
	test('multi-equip-2b', () => {
		const testInput = '2 twisted bow, 999 dragon arrow, primordial boots, robin hood hat';
		const result = gearEquipMultiImpl(testUser2, 'melee', testInput);
		const resultGear = new Gear(result.equippedGear);
		expect(result.equipBank!.toString()).toEqual('999x Dragon arrow, 1x Twisted bow');
		expect(result.unequipBank!.toString()).toEqual('1x Dragonfire shield, 500x Rune arrow, 1x Zaryte crossbow');
		expect(result.skillFailBank!.toString()).toEqual('No items');
		expect(resultGear.toString()).toEqual(
			'Dragon arrow, Dragon platebody, Armadyl helmet, Dragon platelegs, Twisted bow'
		);
		expect(resultGear.ammo?.quantity).toEqual(999);
	});

	// Test equipping same ammo type
	test('multi-equip-2c', () => {
		const testInput = '999 rune arrow';
		const result = gearEquipMultiImpl(testUser2, 'melee', testInput);
		const resultGear = new Gear(result.equippedGear);
		expect(result.equipBank!.toString()).toEqual('999x Rune arrow');
		expect(result.unequipBank!.toString()).toEqual('500x Rune arrow');
		expect(result.skillFailBank!.toString()).toEqual('No items');
		expect(resultGear.toString()).toEqual(
			'Rune arrow, Dragon platebody, Armadyl helmet, Dragon platelegs, Dragonfire shield, Zaryte crossbow'
		);
		expect(resultGear.ammo?.quantity).toEqual(999);
	});

	// Test with 0 qty:
	test('multi-equip-2d', () => {
		const testInput = '0 rune arrow';
		const result = gearEquipMultiImpl(testUser2, 'melee', testInput);
		const resultGear = new Gear(result.equippedGear);
		expect(result.equipBank!.toString()).toEqual('1x Rune arrow');
		expect(result.unequipBank!.toString()).toEqual('500x Rune arrow');
		expect(result.skillFailBank!.toString()).toEqual('No items');
		expect(resultGear.toString()).toEqual(
			'Rune arrow, Dragon platebody, Armadyl helmet, Dragon platelegs, Dragonfire shield, Zaryte crossbow'
		);
		expect(resultGear.ammo?.quantity).toEqual(1);
	});

	const testUser3 = mockMUser({
		skills_agility: convertLVLtoXP(50),
		skills_ranged: convertLVLtoXP(99),
		skills_defence: convertLVLtoXP(99),
		skills_magic: convertLVLtoXP(99),
		GP: 100_000,
		bank: userBank,
		cl: new Bank().add('Coal'),
		meleeGear: {
			weapon: 'Zaryte crossbow',
			shield: 'Elysian spirit shield',
			feet: 'Rune boots'
		}
	});
	// Test equipping multiple items for a single slot + removing both hands for a 2h weapon
	test('multi-equip-3', () => {
		const testInput = '0 twisted bow, eternal boots, dragon boots';
		const result = gearEquipMultiImpl(testUser3, 'melee', testInput);
		const resultGear = new Gear(result.equippedGear);
		expect(result.equipBank!.toString()).toEqual('1x Eternal boots, 1x Twisted bow');
		expect(result.unequipBank!.toString()).toEqual('1x Elysian spirit shield, 1x Rune boots, 1x Zaryte crossbow');
		expect(resultGear.toString()).toEqual('Eternal boots, Twisted bow');
	});

	const testUser4 = mockMUser({
		skills_agility: convertLVLtoXP(50),
		skills_ranged: convertLVLtoXP(99),
		skills_defence: convertLVLtoXP(99),
		skills_magic: convertLVLtoXP(99),
		GP: 100_000,
		bank: userBank,
		cl: new Bank().add('Coal'),
		meleeGear: {
			'2h': 'Twisted bow'
		}
	});
	// Test equipping stackable weapon
	test('multi-equip-4', () => {
		const testInput = '2222 DragON DART';
		const result = gearEquipMultiImpl(testUser4, 'melee', testInput);
		const resultGear = new Gear(result.equippedGear);
		expect(result.equipBank!.toString()).toEqual('2.2k Dragon dart');
		expect(result.unequipBank!.toString()).toEqual('1x Twisted bow');
		expect(resultGear.toString()).toEqual('Dragon dart');

		expect(resultGear.weapon!.quantity).toEqual(2222);
	});

	const testGear5 = new Gear();
	testGear5[EquipmentSlot.Weapon] = { item: itemID('Rune dart'), quantity: 500 };

	const testUser5 = mockMUser({
		skills_agility: convertLVLtoXP(50),
		skills_ranged: convertLVLtoXP(99),
		skills_defence: convertLVLtoXP(99),
		skills_magic: convertLVLtoXP(99),
		GP: 100_000,
		bank: userBank,
		cl: new Bank().add('Coal'),
		meleeGear: testGear5.raw()
	});
	// Test equipping stackable weapon on top of stackable weapon
	test('multi-equip-5', () => {
		const testInput = '2222 DragON DART';
		const result = gearEquipMultiImpl(testUser5, 'melee', testInput);
		const resultGear = new Gear(result.equippedGear);
		expect(result.equipBank!.toString()).toEqual('2.2k Dragon dart');
		expect(result.unequipBank!.toString()).toEqual('500x Rune dart');
		expect(resultGear.toString()).toEqual('Dragon dart');

		expect(resultGear.weapon!.quantity).toEqual(2222);
	});
});
