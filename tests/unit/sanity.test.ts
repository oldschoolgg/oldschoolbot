import { Tame, tame_growth } from '@prisma/client';
import { Items, Monsters } from 'oldschooljs';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import { assert, describe, expect, test } from 'vitest';

import { allMbTables, embTable, PMBTable, tmbTable, umbTable } from '../../src/lib/bsoOpenables';
import Buyables from '../../src/lib/data/buyables/buyables';
import { allPetIDs, masterCapesCL, toaCL } from '../../src/lib/data/CollectionsExport';
import { itemsToDelete } from '../../src/lib/deletedItems';
import { dyedItems } from '../../src/lib/dyedItems';
import { growablePets } from '../../src/lib/growablePets';
import killableMonsters from '../../src/lib/minions/data/killableMonsters';
import { Ignecarus } from '../../src/lib/minions/data/killableMonsters/custom/bosses/Ignecarus';
import { KalphiteKingMonster } from '../../src/lib/minions/data/killableMonsters/custom/bosses/KalphiteKing';
import KingGoldemar from '../../src/lib/minions/data/killableMonsters/custom/bosses/KingGoldemar';
import { VasaMagus } from '../../src/lib/minions/data/killableMonsters/custom/bosses/VasaMagus';
import { allOpenables } from '../../src/lib/openables';
import { Gear } from '../../src/lib/structures/Gear';
import { exponentialPercentScale, isSuperUntradeable, itemNameFromID } from '../../src/lib/util';
import getOSItem from '../../src/lib/util/getOSItem';
import itemID from '../../src/lib/util/itemID';
import itemIsTradeable from '../../src/lib/util/itemIsTradeable';
import resolveItems from '../../src/lib/util/resolveItems';
import { calculateMaximumTameFeedingLevelGain } from '../../src/lib/util/tameUtil';
import { BingoTrophies } from '../../src/mahoji/lib/bingo/BingoManager';

describe('Sanity', () => {
	test('santa hats should be tradeable', () => {
		expect(itemIsTradeable(itemID('Black santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Inverted santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Coal'))).toEqual(true);
		expect(itemIsTradeable(itemID('Golden partyhat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Rune pouch'))).toEqual(true);
		expect(itemIsTradeable(itemID('Agility cape'))).toEqual(true);
		expect(itemIsTradeable(itemID('Achievement diary cape'))).toEqual(true);
		expect(itemIsTradeable(itemID('Crafting master cape'))).toEqual(false);
		expect(itemIsTradeable(itemID('Infernal bulwark'))).toEqual(false);
	});
	test('Growable pets cant come from mystery boxes', () => {
		const allGrowablePets = growablePets.map(p => p.stages).flat();
		expect(allGrowablePets.every(growablePet => !PMBTable.allItems.includes(growablePet))).toEqual(true);
		expect(allGrowablePets.every(growablePet => !allMbTables.includes(growablePet))).toEqual(true);
	});
	test('isSuperUntradeable', () => {
		expect(isSuperUntradeable(getOSItem('TzKal Cape'))).toEqual(true);
		expect(isSuperUntradeable(getOSItem("TzKal-Zuk's skin"))).toEqual(true);
		expect(isSuperUntradeable(getOSItem('Jal-MejJak'))).toEqual(true);
		expect(isSuperUntradeable(getOSItem('Infernal slayer helmet'))).toEqual(true);
		expect(isSuperUntradeable(getOSItem('Infernal slayer helmet(i)'))).toEqual(true);
		expect(isSuperUntradeable(getOSItem('TzKal cape'))).toEqual(true);
		expect(isSuperUntradeable(getOSItem('Head of TzKal Zuk'))).toEqual(true);
		expect(isSuperUntradeable(getOSItem('Infernal bulwark'))).toEqual(true);
		expect(isSuperUntradeable(getOSItem('Infernal core'))).toEqual(true);
		expect(isSuperUntradeable(getOSItem('Seed pack'))).toEqual(true);

		for (const cape of masterCapesCL) {
			expect(isSuperUntradeable(cape)).toEqual(true);
		}
	});
	test('avas', () => {
		expect(new Gear({ cape: "Ava's assembler" }).hasEquipped("Ava's assembler")).toEqual(true);
		expect(new Gear({ cape: 'Assembler max cape' }).hasEquipped("Ava's assembler", true, true)).toEqual(true);
		expect(new Gear({ cape: "Combatant's cape" }).hasEquipped("Ava's assembler", true, true)).toEqual(true);
	});
	test('cant be dropped by mystery boxes', () => {
		const shouldntBeIn = resolveItems([
			'Coins',
			'Tester gift box',
			'Abyssal pouch',
			'Cob',
			'Runite stone spirit',
			'Coal stone spirit',
			'Frozen santa hat',
			'Flappy meal',
			'Seer',
			'Pretzel',
			'Smokey painting',
			'Festive present',
			'Smokey',
			'Pink partyhat',
			'Santa hat',
			'Dwarven ore',
			'100 sided die',
			'Party horn',
			'Diamond crown',
			'Snappy the Turtle',
			'Liber tea',
			'Invention master cape',
			'Portable tanner',
			'Clue upgrader',
			'Justiciar armour set',
			'Justiciar legguards',
			'Justiciar chestguard',
			'Justiciar faceguard',
			'Accursed sceptre',
			'Masori assembler max cape',
			...toaCL
		]);
		for (const i of shouldntBeIn) {
			if (allMbTables.includes(i)) {
				throw new Error(`${itemNameFromID(i)} is in the mystery box tables, but it shouldn't be.`);
			}
		}
	});
	test('exclude certain openables from mystery boxes', () => {
		// These items appear in some Openables but should still also appear in Mystery boxes:
		const shouldBeIn = resolveItems([
			'Coal',
			'Blacksmith helmet',
			'Blacksmith boots',
			'Blacksmith gloves',
			'Uncut sapphire',
			'Oak plank',
			'Pure essence',
			'Runite bolts',
			'Lava flower crown',
			'Purple flower crown'
		]);
		// These items should all still excluded by the 'Openables' rule. Some items are also excluded by other means.
		const shouldntBeIn = resolveItems([
			'Christmas cracker',
			'White partyhat',
			'Corgi',
			'Beach ball',
			'Glass of bubbly',
			'Sparkler',
			'Liber tea',
			'Party music box',
			'6 sided die',
			'Huge lamp',
			'Ancient hilt',
			'Nihil horn',
			'Zaryte vambraces',
			'Ancient godsword',
			'Seed pack',
			27_499,
			27_828,
			'Paint box',
			'Ruby Red paint can'
		]);
		for (const i of shouldntBeIn) {
			if (allMbTables.includes(i)) {
				console.error('wtf');
				throw new Error(`Item ${itemNameFromID(i)} shouldn't be in Mystery Boxes, but is.`);
			}
		}
		for (const i of shouldBeIn) {
			if (!allMbTables.includes(i)) {
				console.error('wtf');
				throw new Error(`Item ${itemNameFromID(i)} should be in Mystery Boxes, but isn't.`);
			}
		}
		expect(shouldBeIn.every(ss => allMbTables.includes(ss))).toEqual(true);
		expect(shouldntBeIn.some(ss => allMbTables.includes(ss))).toEqual(false);
	});
	test('custom monsters', () => {
		expect(killableMonsters.some(m => m.name === 'Frost Dragon')).toBeTruthy();
		expect(killableMonsters.some(m => m.name === 'Sea Kraken')).toBeTruthy();
		expect(Monsters.get(killableMonsters.find(m => m.name === 'Frost Dragon')!.id)?.data.hitpoints).toEqual(330);
		for (const id of [KalphiteKingMonster.id, Ignecarus.id, VasaMagus.id, KingGoldemar.id]) {
			expect(killableMonsters.some(i => i.id === id)).toEqual(false);
		}
	});
	test('fancy', () => {
		expect(tmbTable.includes(itemID('Clothing Mystery Box'))).toEqual(false);
		expect(umbTable.includes(itemID('Clothing Mystery Box'))).toEqual(false);
		expect(tmbTable.includes(itemID('Swanky boots'))).toEqual(false);
		expect(embTable.includes(itemID('Swanky boots'))).toEqual(false);
		expect(umbTable.includes(itemID('Swanky boots'))).toEqual(false);
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
			if (allMbTables.includes(id)) throw new Error(`${name} is in box tables`);
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
		let ids = new Set();
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
	test('exponentialPercentScale', () => {
		for (let i = 0; i < 100; i++) {
			let num = exponentialPercentScale(i);
			expect(num > 0 && num <= 100).toBeTruthy();
		}
		expect(exponentialPercentScale(100)).toEqual(100);
	});
	test('pharaohs sceptre', () => {
		const scep = getOSItem("Pharaoh's sceptre");
		expect(scep.id).toEqual(9044);
		expect(scep.equipable).toEqual(true);
		expect(scep.equipment?.slot).toEqual(EquipmentSlot.Weapon);
	});
	test('all dyed items should be untradeable and not in boxes', () => {
		for (const item of dyedItems.map(i => i.dyedVersions.map(t => t.item)).flat()) {
			assert(!itemIsTradeable(item.id), `${item.name} should be super-untradeable`);
			assert(!allMbTables.includes(item.id), `${item.name} shouldnt drop from boxes`);
		}
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
	test('calculateMaximumTameFeedingLevelGain', () => {
		expect(
			calculateMaximumTameFeedingLevelGain({
				species_id: 1,
				max_combat_level: 70,
				growth_stage: tame_growth.adult
			} as Tame)
		).toEqual(14);
	});
});
