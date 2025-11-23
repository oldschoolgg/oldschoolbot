import { describe, expect, test } from 'vitest';

import { allUnobtainableItems, barrowsItemArr } from '@/itemGroups.js';
import { Items } from '@/structures/Items.js';

const barrows = [
	"Ahrim's hood",
	"Ahrim's robetop",
	"Ahrim's robeskirt",
	"Ahrim's staff",

	"Dharok's helm",
	"Dharok's platebody",
	"Dharok's platelegs",
	"Dharok's greataxe",

	"Guthan's helm",
	"Guthan's platebody",
	"Guthan's chainskirt",
	"Guthan's warspear",

	"Karil's coif",
	"Karil's leathertop",
	"Karil's leatherskirt",
	"Karil's crossbow",

	"Torag's helm",
	"Torag's platebody",
	"Torag's platelegs",
	"Torag's hammers",

	"Verac's helm",
	"Verac's brassard",
	"Verac's plateskirt",
	"Verac's flail"
];
describe('unobtainable item group', () => {
	test('real barrows gear shouldnt be unobtainable', () => {
		for (const item of barrowsItemArr.flat()) {
			expect(allUnobtainableItems).not.toContain(item);
		}
		for (const item of barrows) {
			expect(allUnobtainableItems).not.toContain(Items.getId(item));
		}
		expect(allUnobtainableItems).toContain(4977);
	});
});
