import { masterCapesCL } from '../src/lib/data/CollectionsExport';
import { allMbTables, PMBTable } from '../src/lib/data/openables';
import { growablePets } from '../src/lib/growablePets';
import { Gear } from '../src/lib/structures/Gear';
import { isSuperUntradeable, itemNameFromID } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';
import resolveItems from '../src/lib/util/resolveItems';

describe('Sanity', () => {
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
			'Coal stone spirit'
		]);
		for (const i of shouldntBeIn) {
			if (allMbTables.includes(i)) {
				console.error('wtf');
				throw new Error(`Items rolled includes ${itemNameFromID(i)}`);
			}
		}
	});
});
