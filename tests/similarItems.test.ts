import { Gear } from '../src/lib/structures/Gear';

describe('Gear', () => {
	const testGear = new Gear({
		weapon: 'Dragon pickaxe(or)',
		shield: 'Dragon defender (t)',
		neck: 'Amulet of eternal glory',
		cape: 'Max cape',
		head: 'Twisted slayer helmet (i)'
	});

	test('misc', () => {
		for (const name of [
			'Amulet of glory',
			'Dragon pickaxe',
			'Dragon pickaxe(or)',
			'Dragon defender',
			'Dragon defender (t)',
			'Graceful cape',
			'Slayer helmet'
		]) {
			expect(testGear.hasEquipped(name)).toBeTruthy();
		}
	});
});
