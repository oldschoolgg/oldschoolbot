import { itemID } from 'oldschooljs/dist/util';

import { Gear } from '../src/lib/structures/Gear';

describe('Gear', () => {
	const testGear = new Gear({
		weapon: 'Dragon pickaxe(or)',
		shield: 'Dragon defender (t)',
		neck: 'Amulet of eternal glory',
		cape: 'Max cape',
		head: 'Twisted slayer helmet (i)'
	});

	test('', () => {
		expect(testGear.hasEquipped('Amulet of glory')).toBeTruthy();
		expect(testGear.hasEquipped('Dragon pickaxe')).toBeTruthy();
		expect(testGear.hasEquipped('Dragon pickaxe(or)')).toBeTruthy();
		expect(testGear.hasEquipped('Dragon defender')).toBeTruthy();
		expect(testGear.hasEquipped('Dragon defender (t)')).toBeTruthy();
		expect(testGear.hasEquipped('Graceful cape')).toBeTruthy();
		expect(testGear.hasEquipped('Black mask (i)')).toBeTruthy();
	});

	const testGear2 = new Gear({
		weapon: 'Mist battlestaff'
	});

	test('', () => {
		expect(testGear2.allItems().includes(itemID('Mist battlestaff'))).toBeTruthy();
		expect(testGear2.allItems().includes(itemID('Staff of water'))).toBeTruthy();
		expect(testGear2.hasEquipped('Staff of water')).toBeTruthy();
		expect(testGear2.hasEquipped('Staff of water', false, false)).toBeFalsy();
	});

	const testGear3 = new Gear({
		weapon: 'Staff of water'
	});

	test('', () => {
		expect(testGear3.hasEquipped('Kodai wand')).toBeFalsy();
	});
});
