import { EquipmentSlot } from 'oldschooljs';
import { assert, describe, expect, test } from 'vitest';

import { parseItemPage } from '../src/parser/infoboxes/infoboxes.js';
import { parse } from '../src/parser/parser.js';
import petCatWikiData from './1567.json' with { type: 'json' };
import rawGamesNecklaceWikiData from './3853.json' with { type: 'json' };
import questCapeWikiData from './9813.json' with { type: 'json' };
import pHatWikiData from './12013.json' with { type: 'json' };
import tobPetsWikiData from './22473.json' with { type: 'json' };
import alchAmWikiData from './29988.json' with { type: 'json' };

describe('parseItemPage', () => {
	test('Games necklace variations should all output correctly', () => {
		const gnRawJson = parse(rawGamesNecklaceWikiData.query.pages[0].revisions[0].slots.main.content);
		const gnParsed = parseItemPage(gnRawJson);
		assert.isArray(gnParsed);
		expect(gnParsed).toHaveLength(8);
		for (const item of gnParsed) {
			expect(item.equipment?.attack_crush).toEqual(0);
			expect(item.equipment?.attack_magic).toEqual(0);
			expect(item.equipment?.defence_crush).toEqual(0);
			expect(item.equipment?.prayer).toEqual(0);
			expect(item.equipment?.melee_strength).toEqual(0);
			expect(item.name).toContain('Games necklace');
			expect(item.members).toEqual(true);
			expect(item.equipable).toEqual(true);
			expect(item.equipment?.slot).toEqual(EquipmentSlot.Neck);
			expect(item.examine).toEqual('An enchanted necklace.');
			expect(item.value).toEqual(1050);
			if (item.name === 'Games necklace (8)') {
				expect(item.buy_limit).toEqual(10_000);
			}
		}
	});

	test('Quest cape variations should all output correctly', () => {
		const gnRawJson = parse(questCapeWikiData.query.pages[0].revisions[0].slots.main.content);
		const gnParsed = parseItemPage(gnRawJson);
		assert.isArray(gnParsed);
		expect(gnParsed).toHaveLength(2);
		for (const item of gnParsed) {
			expect(item.equipable).toEqual(true);
			expect(item.noteable).toEqual(false);
			expect(item.stackable).toEqual(false);
			expect(item.equipment?.defence_ranged).toEqual(9);
			expect(item.equipment?.magic_damage).toEqual(0);
			expect(item.members).toEqual(true);
			expect(item.equipment?.slot).toEqual(EquipmentSlot.Cape);
			expect(item.examine).toEqual('The cape worn by only the most experienced adventurers.');
			expect(item.value).toEqual(99_000);
			expect(item.equipment?.prayer).toEqual(item.name === 'Quest point cape (t)' ? 4 : 0);
			expect(item.id).toEqual(item.name === 'Quest point cape (t)' ? 13068 : 9813);
			expect(item.worn_options).toEqual(
				item.name === 'Quest point cape (t)' ? ['untrim', 'teleport'] : ['trim', 'teleport']
			);
		}
	});

	test('Pet Cat', () => {
		const gnRawJson = parse(petCatWikiData.query.pages[0].revisions[0].slots.main.content);
		const gnParsed = parseItemPage(gnRawJson);
		assert.isArray(gnParsed);
		expect(gnParsed).toHaveLength(6);
		for (const item of gnParsed) {
			expect(item.noteable).toEqual(false);
			expect(item.stackable).toEqual(false);
			expect(item.equipment).toEqual(undefined);
			expect(item.members).toEqual(true);
			expect(item.equipable).toEqual(false);
			expect(item.value).toEqual(1);
			expect(item.name).toEqual('Pet cat');
		}
	});

	test('Prospector Helmet', () => {
		const gnRawJson = parse(pHatWikiData.query.pages[0].revisions[0].slots.main.content);
		const gnParsed = parseItemPage(gnRawJson);
		assert.isArray(gnParsed);
		expect(gnParsed).toHaveLength(2);
		for (const item of gnParsed) {
			expect(item.noteable).toEqual(false);
			expect(item.stackable).toEqual(false);
			expect(item.equipment?.slot).toEqual(EquipmentSlot.Head);
			expect(item.members).toEqual(true);
			expect(item.equipable).toEqual(true);
			expect(item.tradeable).toEqual(false);
			expect(item.value).toEqual(40);
			expect(item.name).toEqual('Prospector helmet');
		}
	});

	test("Alchemist's amulet", () => {
		const gnRawJson = parse(alchAmWikiData.query.pages[0].revisions[0].slots.main.content);
		const gnParsed = parseItemPage(gnRawJson);
		assert.isArray(gnParsed);
		for (const item of gnParsed) {
			expect(item.id).toBeOneOf([29988, 29990, 29992]);
			expect(item.equipment?.slot).toEqual(EquipmentSlot.Neck);
			expect(item.name).toEqual("Alchemist's amulet");
		}
		expect(gnParsed).toHaveLength(3);
	});
	test('Theatre of Blood Pets', () => {
		const gnRawJson = parse(tobPetsWikiData.query.pages[0].revisions[0].slots.main.content);
		const gnParsed = parseItemPage(gnRawJson);
		assert.isArray(gnParsed);
		expect(gnParsed).toHaveLength(6);
		gnParsed.sort((a, b) => a.id - b.id);
		expect(gnParsed[0].name).toEqual("Lil' zik");
		expect(gnParsed[1].name).toEqual("Lil' maiden");
		expect(gnParsed[2].name).toEqual("Lil' bloat");
		expect(gnParsed[3].name).toEqual("Lil' nylo");
		expect(gnParsed[4].name).toEqual("Lil' sot");
		expect(gnParsed[5].name).toEqual("Lil' xarp");
	});
});
