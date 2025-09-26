import { Bank, LootTable } from 'oldschooljs';

type SeedDef = [name: string, qty: [number, number], weight: number];

const baseSeeds: SeedDef[] = [
    ['Acorn', [3, 6], 2],
    ['Willow seed', [1, 2], 2],
    ['Maple seed', [1, 2], 2],
    ['Yew seed', [1, 2], 2],
    ['Magic seed', [1, 2], 2],
    ['Apple tree seed', [1, 2], 2],
    ['Orange tree seed', [1, 2], 2],
    ['Pineapple seed', [1, 2], 2],
    ['Papaya tree seed', [1, 2], 2],
    ['Dragonfruit tree seed', [1, 2], 2],
    ['Limpwurt seed', [3, 6], 2],
    ['Cadavaberry seed', [7, 11], 2],
    ['Watermelon seed', [5, 8], 1]
];

function createSeedTable(weightOverrides: Record<string, number> = {}) {
    const table = new LootTable();
    for (const [name, qty, defaultWeight] of baseSeeds) {
        const weight = weightOverrides[name] ?? defaultWeight;
        table.add(name, qty, weight);
    }
    return table
}
const OfferingsSeedTableLevel50 = createSeedTable();
const OfferingsSeedTableLevel65 = createSeedTable({

});
const OfferingsSeedTableLevel80 = createSeedTable({

});
const OfferingsSeedTableLevel90 = createSeedTable({

});
	
export const preRollTable = new LootTable()
    .add('Bow string spool', [3, 6], 5)
    .add('Fletching knife', [3, 6], 3)
    .add('Greenman mask', [3, 6], 2)

const regularTable = new LootTable()
    .add('Dirty arrowtips', [26, 32], 5)
    .add('Ent branch', 1, 4)
    .add('Bale of flax', [5, 6], 3)
    .add('Blessed bone shards', [70, 90], 2)
    .add('Anima-infused bark', [70, 90], 2)
    .add('Feather', [400, 500], 1)

export function rummageOfferings(): Bank {

}