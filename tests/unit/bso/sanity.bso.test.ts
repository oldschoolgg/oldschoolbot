import { type Tame, tame_growth } from '@prisma/client';
import { EquipmentSlot, Items, Monsters, itemID, resolveItems } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { combinedTmbUmbEmbTables } from '@/lib/bsoOpenables';
import { allPetIDs } from '@/lib/data/CollectionsExport';
import { itemsToDelete } from '@/lib/deletedItems';
import killableMonsters from '@/lib/minions/data/killableMonsters';
import { Ignecarus } from '@/lib/minions/data/killableMonsters/custom/bosses/Ignecarus';
import { KalphiteKingMonster } from '@/lib/minions/data/killableMonsters/custom/bosses/KalphiteKing';
import KingGoldemar from '@/lib/minions/data/killableMonsters/custom/bosses/KingGoldemar';
import { VasaMagus } from '@/lib/minions/data/killableMonsters/custom/bosses/VasaMagus';
import { allOpenables } from '@/lib/openables';
import { Gear } from '@/lib/structures/Gear';
import getOSItem from '@/lib/util/getOSItem';
import itemIsTradeable from '@/lib/util/itemIsTradeable';
import { calculateMaximumTameFeedingLevelGain } from '../../../src/lib/util/tameUtil';

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
