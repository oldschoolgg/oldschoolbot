import { Monsters } from 'oldschooljs';

import { masterCapesCL } from '../src/lib/data/CollectionsExport';
import { allMbTables, embTable, PMBTable, tmbTable, umbTable } from '../src/lib/data/openables';
import { growablePets } from '../src/lib/growablePets';
import killableMonsters from '../src/lib/minions/data/killableMonsters';
import { Ignecarus } from '../src/lib/minions/data/killableMonsters/custom/bosses/Ignecarus';
import { KalphiteKingMonster } from '../src/lib/minions/data/killableMonsters/custom/bosses/KalphiteKing';
import KingGoldemar from '../src/lib/minions/data/killableMonsters/custom/bosses/KingGoldemar';
import { VasaMagus } from '../src/lib/minions/data/killableMonsters/custom/bosses/VasaMagus';
import { Gear } from '../src/lib/structures/Gear';
import { isSuperUntradeable, itemID, itemNameFromID } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';
import itemIsTradeable from '../src/lib/util/itemIsTradeable';
import resolveItems from '../src/lib/util/resolveItems';

describe('Sanity', () => {
	test('santa hats should be tradeable', () => {
		expect(itemIsTradeable(itemID('Black santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Inverted santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Santa hat'))).toEqual(true);
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
			'Primal full helm (real)',
			'Abyssal pouch',
			'Cob',
			'Runite stone spirit',
			'Coal stone spirit',
			'Frozen santa hat',
			'Flappy meal',
			'Seer',
			'Pretzel',
			'Smokey painting',
			'Festive present'
		]);
		for (const i of shouldntBeIn) {
			if (allMbTables.includes(i)) {
				console.error('wtf');
				throw new Error(`Items rolled includes ${itemNameFromID(i)}`);
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
			'Runite bolts'
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
			'Huge lamp'
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
});
