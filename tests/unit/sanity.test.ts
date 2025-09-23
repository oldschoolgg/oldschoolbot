import { Bank, EMonster, EquipmentSlot, getItem, getItemOrThrow, Items, itemID } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import Buyables from '../../src/lib/data/buyables/buyables';
import { marketPriceOfBank } from '../../src/lib/marketPrices';
import { allOpenables } from '../../src/lib/openables';
import getOSItem from '../../src/lib/util/getOSItem';
import itemIsTradeable from '../../src/lib/util/itemIsTradeable';
import { BingoTrophies } from '../../src/mahoji/lib/bingo/BingoManager';

describe('Sanity', () => {
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
			if (getOSItem(openable.id) !== openable.openedItem) {
				throw new Error(`${openable.name} doesnt match`);
			}
			if (ids.has(openable.id)) {
				throw new Error(`duplicate id: ${openable.id}`);
			}
			ids.add(openable.id);
		}
	});

	test('pharaohs sceptre', () => {
		const scep = getOSItem("Pharaoh's sceptre");
		expect(scep.id).toEqual(9044);
		expect(scep.equipable).toEqual(true);
		expect(scep.equipment?.slot).toEqual(EquipmentSlot.Weapon);
	});
	test('buyables without output', () => {
		for (const buyable of Buyables) {
			if (buyable.outputItems) continue;
			getOSItem(buyable.name);
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
		expect(getItem('Ultor ring')!.id).toEqual(25485);
		expect(itemID('Ultor ring')).toEqual(25485);
		expect(Items.itemNameFromId(25485)).toEqual('Ultor ring');
		expect(getItemOrThrow('Ultor ring')!.equipment?.slot).toEqual('ring');
		expect(getItemOrThrow('Ultor ring')!.equipment?.melee_strength).toEqual(12);
	});

	test('EMonster', () => {
		expect(EMonster.NIGHTMARE).toEqual(9415);
		expect(EMonster.ZALCANO).toEqual(9049);
	});
});
