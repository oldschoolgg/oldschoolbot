import { Bank } from 'oldschooljs';
import { convertLVLtoXP } from 'oldschooljs/dist/util';

import { Gear } from '../src/lib/structures/Gear';
import { gearEquipMultiImpl } from '../src/mahoji/lib/abstracted_commands/gearCommands';
import { mockMUser } from './utils';

describe('Multi-equip Gear Test', () => {
	const userBank = new Bank();
	userBank
		.add('Elysian spirit shield', 3)
		.add('Zaryte crossbow', 1)
		.add('Pegasian boots', 1)
		.add('Dragon arrow', 1000)
		.add('Rune arrow', 5000)
		.add('Twisted bow');

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
		// console.log(test1Gear1.toString());
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

	test('multi-equip-2', () => {
		const testInput = '3 elysian spirit shield, 2 twisted bow, 999 dragon arrow, primordial boots, robin hood hat';
		const result = gearEquipMultiImpl(testUser2, 'melee', testInput);
		const resultGear = new Gear(result.equippedGear);
		// console.log(test1Gear1.toString());
		expect(result.equipBank!.toString()).toEqual('999x Dragon arrow, 1x Elysian spirit shield');
		expect(result.unequipBank!.toString()).toEqual('500x Rune arrow, 1x Dragonfire shield');
		expect(result.skillFailBank!.toString()).toEqual('No items');
		expect(resultGear.toString()).toEqual(
			'Dragon arrow, Dragon platebody, Armadyl helmet, Dragon platelegs, Elysian spirit shield, Zaryte crossbow'
		);
		expect(resultGear.ammo?.quantity).toEqual(999);
	});
	test('multi-equip-2b', () => {
		const testInput = '2 twisted bow, 999 dragon arrow, primordial boots, robin hood hat';
		const result = gearEquipMultiImpl(testUser2, 'melee', testInput);
		const resultGear = new Gear(result.equippedGear);
		// console.log(test1Gear1.toString());
		expect(result.equipBank!.toString()).toEqual('999x Dragon arrow, 1x Twisted bow');
		expect(result.unequipBank!.toString()).toEqual('500x Rune arrow, 1x Dragonfire shield, 1x Zaryte crossbow');
		expect(result.skillFailBank!.toString()).toEqual('No items');
		expect(resultGear.toString()).toEqual(
			'Dragon arrow, Dragon platebody, Armadyl helmet, Dragon platelegs, Twisted bow'
		);
		expect(resultGear.ammo?.quantity).toEqual(999);
	});

	test('multi-equip-2c', () => {
		const testInput = '999 rune arrow';
		const result = gearEquipMultiImpl(testUser2, 'melee', testInput);
		const resultGear = new Gear(result.equippedGear);
		// console.log(test1Gear1.toString());
		expect(result.equipBank!.toString()).toEqual('999x Rune arrow');
		expect(result.unequipBank!.toString()).toEqual('500x Rune arrow');
		expect(result.skillFailBank!.toString()).toEqual('No items');
		expect(resultGear.toString()).toEqual(
			'Rune arrow, Dragon platebody, Armadyl helmet, Dragon platelegs, Dragonfire shield, Zaryte crossbow'
		);
		expect(resultGear.ammo?.quantity).toEqual(999);
	});

	test('multi-equip-2d', () => {
		const testInput = '0 rune arrow';
		const result = gearEquipMultiImpl(testUser2, 'melee', testInput);
		const resultGear = new Gear(result.equippedGear);
		// console.log(test1Gear1.toString());
		expect(result.equipBank!.toString()).toEqual('1x Rune arrow');
		expect(result.unequipBank!.toString()).toEqual('500x Rune arrow');
		expect(result.skillFailBank!.toString()).toEqual('No items');
		expect(resultGear.toString()).toEqual(
			'Rune arrow, Dragon platebody, Armadyl helmet, Dragon platelegs, Dragonfire shield, Zaryte crossbow'
		);
		expect(resultGear.ammo?.quantity).toEqual(1);
	});
});
