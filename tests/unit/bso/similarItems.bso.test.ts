import { expect, test } from 'vitest';

import { Gear } from '../../../src/lib/structures/Gear';

test('comp cape similar items', () => {
	const gear = new Gear();
	gear.equip('Completionist cape');
	expect(gear.hasEquipped("Combatant's cape")).toEqual(true);
	expect(gear.hasEquipped('Support cape')).toEqual(true);

	const gear2 = new Gear();
	gear2.equip('Completionist cape (t)');

	expect(gear2.hasEquipped("Combatant's cape")).toEqual(true);
	expect(gear2.hasEquipped('Support cape')).toEqual(true);
});
