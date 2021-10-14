import { allMbTables, PMBTable } from '../src/lib/data/openables';
import { growablePets } from '../src/lib/growablePets';

describe('Sanity', () => {
	test('Growable pets cant come from mystery boxes', () => {
		const allGrowablePets = growablePets.map(p => p.stages).flat();
		expect(allGrowablePets.every(growablePet => !PMBTable.allItems.includes(growablePet))).toEqual(true);
		expect(allGrowablePets.every(growablePet => !allMbTables.includes(growablePet))).toEqual(true);
	});
});
