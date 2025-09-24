import { Items } from 'oldschooljs';
import { expect, test } from 'vitest';

test('comp cape reqs', () => {
	const items = [
		Items.getOrThrow('Completionist cape'),
		Items.getOrThrow('Completionist cape (t)'),
		Items.getOrThrow('Completionist hood')
	];
	for (const item of items) {
		expect(item.equipment!.requirements?.agility).toEqual(120);
		expect(item.equipment!.requirements?.attack).toEqual(120);
		// @ts-expect-error ignore
		expect(item.equipment!.requirements?.divination).toEqual(120);
	}
	// @ts-expect-error ignore
	expect(Items.getOrThrow("Gatherer's cape").equipment!.requirements?.divination).toEqual(120);
});
