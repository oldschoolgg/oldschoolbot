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
	test('excludes seasonal equipment from normal gear choices', () => {
		for (const itemID of [
			33038, 33041, 33063, 33227, 33229, 33243, 33245, 33247, 33249, 33251, 33253, 33255, 33257
		]) {
			expect(Items.getOrThrow(itemID).equipable).toBe(true);
			expect(allUnobtainableItems).toContain(itemID);
		}
	});

	test('keeps main-game cosmetic rewards available', () => {
		for (const itemID of [33021, 33023, 33027, 33031, 33035, 33036, 33066, 33260, 33296, 33338, 33340, 34607]) {
			expect(Items.getOrThrow(itemID).equipable).toBe(true);
			expect(allUnobtainableItems).not.toContain(itemID);
		}
	});

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
