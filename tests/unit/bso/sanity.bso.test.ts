import { itemsToDelete } from '@/lib/bso/deletedItems.js';
import { combinedTmbUmbEmbTables } from '@/lib/bso/openables/bsoOpenables.js';
import { calculateMaximumTameFeedingLevelGain } from '@/lib/bso/tameUtil.js';

import { type Tame, tame_growth } from '@prisma/client';
import { EquipmentSlot, Items, itemID, Monsters, resolveItems } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { allPetIDs } from '@/lib/data/CollectionsExport.js';
import { Ignecarus } from '@/lib/minions/data/killableMonsters/custom/bosses/Ignecarus.js';
import { KalphiteKingMonster } from '@/lib/minions/data/killableMonsters/custom/bosses/KalphiteKing.js';
import KingGoldemar from '@/lib/minions/data/killableMonsters/custom/bosses/KingGoldemar.js';
import { VasaMagus } from '@/lib/minions/data/killableMonsters/custom/bosses/VasaMagus.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import { allOpenables } from '@/lib/openables.js';
import { Gear } from '@/lib/structures/Gear.js';
import itemIsTradeable from '@/lib/util/itemIsTradeable.js';
import { assert } from '@/lib/util/logError.js';

assert(Items.get('Lil lamb')!.id === 9619);
console.log(Items.get(9619)!.name);

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
});
