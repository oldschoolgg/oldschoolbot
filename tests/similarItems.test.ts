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
		expect(testGear.hasEquipped('Max cape')).toBeTruthy();
		expect(testGear.hasEquipped('Attack cape')).toBeTruthy();
		expect(testGear.hasEquipped('Black mask (i)')).toBeTruthy();
	});

	const testGear2 = new Gear({
		weapon: 'Mist battlestaff',
		cape: 'Attack cape(t)'
	});

	test('', () => {
		expect(testGear2.allItems().includes(itemID('Mist battlestaff'))).toBeTruthy();
		expect(testGear2.allItems(true).includes(itemID('Staff of water'))).toBeTruthy();
		expect(testGear2.hasEquipped('Staff of water')).toBeTruthy();
		expect(testGear2.hasEquipped('Staff of water', false, false)).toBeFalsy();
		expect(testGear2.hasEquipped('Attack cape(t)')).toBeTruthy();
		expect(testGear2.hasEquipped('Attack cape')).toBeTruthy();
		expect(testGear2.hasEquipped('Max cape')).toBeFalsy();
	});

	const testGear3 = new Gear({
		weapon: 'Staff of water'
	});

	test('', () => {
		expect(testGear3.hasEquipped('Kodai wand')).toBeFalsy();
	});

	const testGear4 = new Gear({
		weapon: 'Kodai wand',
		head: 'Slayer helmet (i)',
		hands: 'Barrows gloves'
	});
	test('', () => {
		expect(testGear4.hasEquipped(['Staff of water', 'Black mask (i)'], true)).toBeTruthy();
	});

	const testGear5 = new Gear({
		weapon: 'Mist battlestaff',
		head: 'Purple slayer helmet (i)',
		hands: 'Barrows gloves'
	});
	test('', () => {
		expect(testGear5.hasEquipped(['Staff of water', 'Black mask', 'Barrows gloves'], true)).toBeTruthy();
		expect(testGear5.hasEquipped(['Staff of water', 'Black mask', 'Pufferfish'], false)).toBeTruthy();
	});

	const testGear6 = new Gear({
		weapon: 'Mist battlestaff',
		head: 'Red slayer helmet',
		hands: 'Barrows gloves'
	});
	test('', () => {
		expect(testGear6.hasEquipped(['Staff of water', 'Black mask', 'Barrows gloves'], true)).toBeTruthy();
		expect(testGear6.hasEquipped('Black mask (i)')).toBeFalsy();
		expect(testGear6.hasEquipped('Kodai wand')).toBeFalsy();
		expect(testGear6.hasEquipped('Staff of water')).toBeTruthy();
		expect(testGear6.hasEquipped('Black mask')).toBeTruthy();
		expect(testGear6.hasEquipped(['Staff of water', 'Black mask (i)', 'Pufferfish'], false)).toBeTruthy();
		expect(
			testGear6.hasEquipped(['Mist battlestaff', 'Barrows gloves', 'Red slayer helmet'], true, false)
		).toBeTruthy();
		expect(testGear6.hasEquipped(['Staff of water', 'Barrows gloves', 'Slayer helmet'], true, false)).toBeFalsy();
	});
});
