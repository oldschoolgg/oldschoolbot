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
		weapon: 'Mist battlestaff'
	});

	test('', () => {
		for (const name of ['Staff of water']) {
			expect(testGear2.hasEquipped(name)).toBeTruthy();
		}
	});
});
