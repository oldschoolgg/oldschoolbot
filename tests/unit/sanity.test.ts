import { exponentialPercentScale } from '@oldschoolgg/toolkit/math';
import { Bank, EMonster, EquipmentSlot, Items, itemID } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { clamp } from 'remeda';
import Buyables from '../../src/lib/data/buyables/buyables.js';
import { marketPriceOfBank } from '../../src/lib/marketPrices.js';
import { allOpenables } from '../../src/lib/openables.js';
import itemIsTradeable from '../../src/lib/util/itemIsTradeable.js';
import { BingoTrophies } from '../../src/mahoji/lib/bingo/BingoManager.js';

describe('Sanity', () => {
	test('misc', () => {
		expect(itemID('Phoenix')).toEqual(20_693);
		expect(itemID('Kalphite princess')).toEqual(12_647);
		expect(itemID('Green phoenix')).toEqual(24_483);
		expect(itemID('Red chinchompa')).toEqual(10_034);
		expect(itemID('Broad arrows')).toEqual(4160);
		expect(itemID('Frozen key')).toEqual(26_356);
		expect(itemID('Clue box')).toEqual(12_789);
		expect(itemIsTradeable(itemID('Black santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Inverted santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Trailblazer tool ornament kit'))).toEqual(false);
		expect(itemIsTradeable(itemID('Twisted horns'))).toEqual(false);
		expect(itemIsTradeable(itemID('Collection log (gilded)'))).toEqual(false);
		expect(itemIsTradeable(itemID('Gilded staff of collection'))).toEqual(false);
		expect(itemIsTradeable(itemID('Ric'))).toEqual(false);
		expect(itemIsTradeable(itemID("Pharaoh's sceptre"))).toEqual(true);
	});
	test('casket names', () => {
		expect(itemID('Reward casket (beginner)')).toEqual(23_245);
		expect(itemID('Reward casket (easy)')).toEqual(20_546);
		expect(itemID('Reward casket (medium)')).toEqual(20_545);
		expect(itemID('Reward casket (hard)')).toEqual(20_544);
		expect(itemID('Reward casket (elite)')).toEqual(20_543);
		expect(itemID('Reward casket (master)')).toEqual(19_836);
	});
	test('openables', () => {
		const ids = new Set();
		for (const openable of allOpenables) {
			if (Items.getOrThrow(openable.id) !== openable.openedItem) {
				throw new Error(`${openable.name} doesnt match`);
			}
			if (ids.has(openable.id)) {
				throw new Error(`duplicate id: ${openable.id}`);
			}
			ids.add(openable.id);
		}
	});
	test('exponentialPercentScale', () => {
		for (let i = 0; i < 100; i++) {
			const num = exponentialPercentScale(i);
			expect(num > 0 && num <= 100).toBeTruthy();
		}
		expect(exponentialPercentScale(100)).toEqual(100);
	});
	test('pharaohs sceptre', () => {
		const scep = Items.getOrThrow("Pharaoh's sceptre");
		expect(scep.id).toEqual(9044);
		expect(scep.equipable).toEqual(true);
		expect(scep.equipment?.slot).toEqual(EquipmentSlot.Weapon);
	});
	test('buyables without output', () => {
		for (const buyable of Buyables) {
			if (buyable.outputItems) continue;
			Items.getOrThrow(buyable.name);
		}
	});
	test('trophies', () => {
		for (const trophy of BingoTrophies) {
			if (trophy.item.customItemData?.cantBeSacrificed !== true) {
				throw new Error(`${trophy.item.name} can be sacrificed`);
			}
			if (itemIsTradeable(trophy.item.id)) {
				throw new Error(`${trophy.item.name} is tradeable`);
			}
		}
	});
	test('market price of coins', () => {
		const b = new Bank().add('Coins', 66);
		expect(marketPriceOfBank(b)).toEqual(66);
	});

	test('rings', () => {
		expect(Items.getOrThrow('Ultor ring')!.id).toEqual(25485);
		expect(itemID('Ultor ring')).toEqual(25485);
		expect(Items.itemNameFromId(25485)).toEqual('Ultor ring');
		expect(Items.getOrThrow('Ultor ring')!.equipment?.slot).toEqual('ring');
		expect(Items.getOrThrow('Ultor ring')!.equipment?.melee_strength).toEqual(12);
	});

	test('EMonster', () => {
		expect(EMonster.NIGHTMARE).toEqual(9415);
		expect(EMonster.ZALCANO).toEqual(9049);
	});

	test('clamp', () => {
		expect(clamp(100, { min: 0, max: 50 })).toEqual(50);
		expect(clamp(100, { min: 200, max: 250 })).toEqual(200);
	});
});
