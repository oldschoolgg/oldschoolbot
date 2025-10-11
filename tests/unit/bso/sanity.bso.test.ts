import { OSB_VIRTUS_IDS } from '@/lib/bso/bsoConstants.js';
import { itemsToDelete } from '@/lib/bso/deletedItems.js';
import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { Ignecarus } from '@/lib/bso/monsters/bosses/Ignecarus.js';
import { KalphiteKingMonster } from '@/lib/bso/monsters/bosses/KalphiteKing.js';
import { KingGoldemar } from '@/lib/bso/monsters/bosses/KingGoldemar.js';
import { VasaMagus } from '@/lib/bso/monsters/bosses/VasaMagus.js';
import { BSOMonstersMap } from '@/lib/bso/monsters/customMonsters.js';
import { mysteryBoxBlacklist } from '@/lib/bso/openables/mysteryBoxBlacklist.js';
import { combinedTmbUmbEmbTables } from '@/lib/bso/openables/mysteryBoxes.js';
import { calculateMaximumTameFeedingLevelGain } from '@/lib/bso/tames/tameUtil.js';

import { type Tame, tame_growth } from '@prisma/client';
import { EquipmentSlot, Items, itemID, Monsters, resolveItems } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { customItems } from '@/lib/customItems/util.js';
import { allPetIDs } from '@/lib/data/CollectionsExport.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import { allOpenables } from '@/lib/openables.js';
import { Gear } from '@/lib/structures/Gear.js';
import itemIsTradeable from '@/lib/util/itemIsTradeable.js';

describe('Sanity', () => {
	test('calculateMaximumTameFeedingLevelGain', () => {
		expect(
			calculateMaximumTameFeedingLevelGain({
				species_id: 1,
				max_combat_level: 70,
				growth_stage: tame_growth.adult
			} as Tame)
		).toEqual(14);
	});

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
		expect(Items.itemNameFromId(323424)).toEqual('Ivy');
		expect(Items.getOrThrow('Ivy').id).toEqual(323424);
		expect(itemID('Phoenix')).toEqual(20_693);
		expect(itemID('Kalphite princess')).toEqual(12_647);
		expect(itemID('Green phoenix')).toEqual(24_483);
		expect(Items.getOrThrow('Nexterminator').id).toEqual(50_588);
		expect(Items.getOrThrow('Smokey').customItemData?.cantDropFromMysteryBoxes).toEqual(true);
		expect(Items.getOrThrow('Pink partyhat').customItemData?.cantDropFromMysteryBoxes).toEqual(true);
		expect(Items.getOrThrow('Pink partyhat').equipment?.slot).toEqual(EquipmentSlot.Head);
		expect(resolveItems(['Nexterminator', 'Herbi', 'Smokey', 'Craig']).every(id => allPetIDs.includes(id))).toEqual(
			true
		);
		expect(itemID('Red chinchompa')).toEqual(10_034);
		expect(itemID('Broad arrows')).toEqual(4160);
		expect(itemID('Frozen key')).toEqual(26_356);
		for (const item of Items.resolveFullItems(['Hellfire bow (broken)', 'Hellfire bownana (broken)'])) {
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
			["Osmumten's fang", 26_219],
			['Dragon egg', 48_210]
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
		expect(itemIsTradeable(itemID('Collection log (gilded)'))).toEqual(false);
		expect(itemIsTradeable(itemID('Gilded staff of collection'))).toEqual(false);
		expect(itemIsTradeable(itemID("Pharaoh's sceptre"))).toEqual(true);
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

	test('mystery box blacklist', () => {
		for (const i of customItems) {
			if (Items.getOrThrow(i).customItemData?.cantDropFromMysteryBoxes && !mysteryBoxBlacklist.includes(i)) {
				throw new Error(
					`${i} is a custom item that can't be dropped from mystery boxes but isn't in the blacklist!`
				);
			}
			if (i >= 40_000 && i <= 50_000 && !mysteryBoxBlacklist.includes(i)) {
				throw new Error(
					`${i} is a custom item in the 40000-50000 range but isn't in the mystery box blacklist!`
				);
			}
		}
	});

	test('Virtus', () => {
		for (const id of OSB_VIRTUS_IDS) {
			expect(Items.get(id)).toBeUndefined();
		}
		expect(Items.get('Virtus mask')!.id).toBe(788);
	});

	test('BSO Monsters Map', () => {
		expect(BSOMonstersMap.get(EBSOMonster.AKUMU)!.name).toBe('Akumu');
	});
});
