import { expect, test } from 'vitest';

import getOSItem from '../../../src/lib/util/getOSItem';

test('comp cape reqs', () => {
	const items = [
		getOSItem('Completionist cape'),
		getOSItem('Completionist cape (t)'),
		getOSItem('Completionist hood')
	];
	for (const item of items) {
		expect(item.equipment!.requirements?.agility).toEqual(120);
		expect(item.equipment!.requirements?.attack).toEqual(120);
		// @ts-ignore ignore
		expect(item.equipment!.requirements?.divination).toEqual(120);
	}
	// @ts-ignore ignore
	expect(getOSItem("Gatherer's cape").equipment!.requirements?.divination).toEqual(120);
});
