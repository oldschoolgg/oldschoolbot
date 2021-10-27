import { masterCapesCL } from '../src/lib/data/CollectionsExport';
import { allMbTables, PMBTable } from '../src/lib/data/openables';
import { growablePets } from '../src/lib/growablePets';
import { isSuperUntradeable } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';

describe('Sanity', () => {
	test('Growable pets cant come from mystery boxes', () => {
		const allGrowablePets = growablePets.map(p => p.stages).flat();
		expect(allGrowablePets.every(growablePet => !PMBTable.allItems.includes(growablePet))).toEqual(true);
		expect(allGrowablePets.every(growablePet => !allMbTables.includes(growablePet))).toEqual(true);
	});
	test('isSuperUntradeable', () => {
		expect(isSuperUntradeable(getOSItem('TzKal Cape'))).toEqual(true);
		for (const cape of masterCapesCL) {
			expect(isSuperUntradeable(cape)).toEqual(true);
		}
	});
});
