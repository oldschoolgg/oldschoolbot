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
		for (const name of [
			'Amulet of glory',
			'Dragon pickaxe',
			'Dragon pickaxe(or)',
			'Dragon defender',
			'Dragon defender (t)',
			'Graceful cape',
			'Slayer helmet (i)'
		]) {
			expect(testGear.hasEquipped(name)).toBeTruthy();
		}
	});

	const testGear2 = new Gear({
		weapon: 'Mist battlestaff',
		body: 'Torva platebody',
		legs: 'Torva platelegs',
		feet: 'Torva boots',
		hands: 'Gorajan warrior gloves'
	});

	test('', () => {
		expect(testGear2.hasEquipped('Staff of water')).toBeTruthy();
		expect(testGear2.hasEquipped('Torva platebody')).toBeTruthy();
		expect(testGear2.hasEquipped('Torva platebody', true, false)).toBeTruthy();
		expect(testGear2.hasEquipped('Gorajan warrior top')).toBeFalsy();
		expect(testGear2.hasEquipped('Gorajan warrior top', true, false)).toBeFalsy();
	});
});
