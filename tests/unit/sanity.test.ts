import { type Tame, tame_growth } from '@prisma/client';
import { Bank, EquipmentSlot, Items, Monsters, getItem, getItemOrThrow } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { combinedTmbUmbEmbTables } from '../../src/lib/bsoOpenables';
import { allPetIDs } from '../../src/lib/data/CollectionsExport';
import Buyables from '../../src/lib/data/buyables/buyables';
import { itemsToDelete } from '../../src/lib/deletedItems';
import { marketPriceOfBank } from '../../src/lib/marketPrices';
import killableMonsters from '../../src/lib/minions/data/killableMonsters';
import { Ignecarus } from '../../src/lib/minions/data/killableMonsters/custom/bosses/Ignecarus';
import { KalphiteKingMonster } from '../../src/lib/minions/data/killableMonsters/custom/bosses/KalphiteKing';
import KingGoldemar from '../../src/lib/minions/data/killableMonsters/custom/bosses/KingGoldemar';
import { VasaMagus } from '../../src/lib/minions/data/killableMonsters/custom/bosses/VasaMagus';
import { allOpenables } from '../../src/lib/openables';
import { Gear } from '../../src/lib/structures/Gear';
import { itemNameFromID } from '../../src/lib/util';
import getOSItem from '../../src/lib/util/getOSItem';
import itemID from '../../src/lib/util/itemID';
import itemIsTradeable from '../../src/lib/util/itemIsTradeable';
import resolveItems from '../../src/lib/util/resolveItems';
import { calculateMaximumTameFeedingLevelGain } from '../../src/lib/util/tameUtil';
import { BingoTrophies } from '../../src/mahoji/lib/bingo/BingoManager';

describe('Sanity', () => {
	test('avas', () => {
		expect(new Gear({ cape: "Ava's assembler" }).hasEquipped("Ava's assembler")).toEqual(true);
		expect(new Gear({ cape: 'Assembler max cape' }).hasEquipped("Ava's assembler", true, true)).toEqual(true);
		expect(new Gear({ cape: "Combatant's cape" }).hasEquipped("Ava's assembler", true, true)).toEqual(true);
	});

	test('custom monsters', () => {
		expect(killableMonsters.some(m => m.name === 'Frost Dragon')).toBeTruthy();
		expect(killableMonsters.some(m => m.name === 'Sea Kraken')).toBeTruthy();
		expect(Monsters.get(killableMonsters.find(m => m.name === 'Frost Dragon')!.id)?.data.hitpoints).toEqual(330);
		for (const id of [KalphiteKingMonster.id, Ignecarus.id, VasaMagus.id, KingGoldemar.id]) {
			expect(killableMonsters.some(i => i.id === id)).toEqual(false);
		}
	});

	test('misc', () => {
		expect(itemID('Phoenix')).toEqual(20_693);
		expect(itemID('Kalphite princess')).toEqual(12_647);
		expect(itemID('Green phoenix')).toEqual(24_483);
		expect(getOSItem('Nexterminator').id).toEqual(50_588);
		expect(getOSItem('Smokey').customItemData?.cantDropFromMysteryBoxes).toEqual(true);
		expect(getOSItem('Pink partyhat').customItemData?.cantDropFromMysteryBoxes).toEqual(true);
		expect(getOSItem('Pink partyhat').equipment?.slot).toEqual(EquipmentSlot.Head);
		expect(resolveItems(['Nexterminator', 'Herbi', 'Smokey', 'Craig']).every(id => allPetIDs.includes(id))).toEqual(
			true
		);
		expect(itemID('Red chinchompa')).toEqual(10_034);
		expect(itemID('Broad arrows')).toEqual(4160);
		expect(itemID('Frozen key')).toEqual(26_356);
		for (const item of ['Hellfire bow (broken)', 'Hellfire bownana (broken)'].map(getOSItem)) {
			expect(item.equipable).toEqual(undefined);
			expect(item.equipable_by_player).toEqual(undefined);
			expect(item.equipment).toEqual(undefined);
		}
	});
	test('expected IDs', () => {
		const expectedIDs = [
			['Torva full helm', 432],
			['Torva full helm (broken)', 51_000],
			['Torva platebody', 709],
			['Torva platelegs', 2404],
			['Torva boots', 2838],
			['Torva gloves', 4273],
			['Torva gloves', 4273],
			['Pernix boots (broken)', 51_014],
			['Virtus boots (broken)', 51_009],
			['Torva boots (broken)', 51_004],
			['Bandosian components', 26_394],
			["Osmumten's fang", 26_219]
		];
		for (const [name, id] of expectedIDs) {
			const idForName = Items.get(name)!.id;
			const nameForId = Items.get(id)!.name;
			if (nameForId !== name || idForName !== id) {
				throw new Error(`Expected ${name}[${id}] to match, instead received: ${nameForId} ${idForName}`);
			}
		}
	});
	test('deleted items', () => {
		for (const [id, name] of itemsToDelete) {
			if (Items.get(name)?.id === id || Items.get(id)) {
				throw new Error(`Item ${id} ${name} shouldve been deleted.`);
			}
			if (combinedTmbUmbEmbTables.includes(id)) throw new Error(`${name} is in box tables`);
		}
		expect(itemID('Clue box')).toEqual(12_789);
		expect(itemIsTradeable(itemID('Black santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Inverted santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Trailblazer tool ornament kit'))).toEqual(true);
		expect(itemIsTradeable(itemID('Twisted horns'))).toEqual(true);
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

	test("klik/divine shouldn't be openable", () => {
		for (const openable of allOpenables) {
			for (const name of ['Klik', 'Divine spirit shield']) {
				if (openable.name === name || openable.id === itemID(name) || openable.openedItem.id === itemID(name)) {
					throw new Error(`${name} shouldnt be openable`);
				}
			}
		}
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

	test('calculateMaximumTameFeedingLevelGain', () => {
		expect(
			calculateMaximumTameFeedingLevelGain({
				species_id: 1,
				max_combat_level: 70,
				growth_stage: tame_growth.adult
			} as Tame)
		).toEqual(14);
	});

	test('market price of coins', () => {
		const b = new Bank().add('Coins', 66);
		expect(marketPriceOfBank(b)).toEqual(66);
	});
	test('rings', () => {
		expect(getItem('Ultor ring')!.id).toEqual(25485);
		expect(itemID('Ultor ring')).toEqual(25485);
		expect(itemNameFromID(25485)).toEqual('Ultor ring');
		expect(getItemOrThrow('Ultor ring')!.equipment?.slot).toEqual('ring');
		expect(getItemOrThrow('Ultor ring')!.equipment?.melee_strength).toEqual(12);
	});
});
