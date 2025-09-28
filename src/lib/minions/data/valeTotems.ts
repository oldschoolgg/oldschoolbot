import { Bank, LootTable } from 'oldschooljs';

import { birdsNestID, valeOfferingNests } from '@/lib/simulation/birdsNest.js';

type SeedLootDef = [name: string, qty: [number, number], weight: number];

const clueTiers: [string, number][] = [
    ['beginner',    256],
    ['easy',        512],
    ['medium',      1024],
    ['hard',        2048],
    ['elite',       4096],
];

function createClueNest(tier: string) {
    return new LootTable()
        .every(birdsNestID)
        .add(`Clue scroll (${tier})`);
}

const baseSeeds: SeedLootDef[] = [
    ['Acorn', [3, 6], 16],
    ['Willow seed', [1, 2], 2],
    ['Maple seed', [1, 2], 2],
    ['Yew seed', [1, 2], 2],
    ['Magic seed', [1, 2], 2],
    ['Apple tree seed', [1, 2], 12],
    ['Orange tree seed', [1, 2], 2],
    ['Pineapple seed', [1, 2], 2],
    ['Papaya tree seed', [1, 2], 2],
    ['Dragonfruit tree seed', [1, 2], 1],
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
const OfferingsSeedTableLevelUnder50 = new LootTable()
    .add('Acorn', [3, 6], 16)
    .add('Willow seed', [1, 2], 2)
    .add('Maple seed', [1, 2], 2)
    .add('Yew seed', [1, 2], 2)
    .add('Magic seed', [1, 2], 2)
    .add('Apple tree seed', [1, 2], 12)
    .add('Orange tree seed', [1, 2], 2)
    .add('Pineapple seed', [1, 2], 2)
    .add('Papaya tree seed', [1, 2], 2)
    .add('Dragonfruit tree seed', [1, 2], 1)
    .add('Limpwurt seed', [3, 6], 2)
    .add('Cadavaberry seed', [7, 11], 2)
    .add('Watermelon seed', [5, 8], 1)
    
const OfferingsSeedTableLevelUnder65 = new LootTable()
const OfferingsSeedTableLevelUnder80 = new LootTable()
const OfferingsSeedTableLevelUnder90 = new LootTable()
const OfferingsSeedTableLevel90Plus = new LootTable()

const dirtyArrowTableLevelUnder50 = new LootTable()
    .add('Steel arrowtips', 1, 69)
    .add('Mithril arrowtips', 1, 20)
    .add('Adamant arrowtips', 1, 5)
    .add('Rune arrowtips', 1, 1);

const dirtyArrowTableLevelUnder65 = new LootTable()
    .add('Steel arrowtips', 1, 28)
    .add('Mithril arrowtips', 1, 11)
    .add('Adamant arrowtips', 1, 6)
    .add('Rune arrowtips', 1, 2)
    .add('Dragon arrowtips', 1, 1);

const dirtyArrowTableLevelUnder80 = new LootTable()
    .add('Steel arrowtips', 1, 4)
    .add('Mithril arrowtips', 1, 4)
    .add('Adamant arrowtips', 1, 4)
    .add('Rune arrowtips', 1, 2)
    .add('Dragon arrowtips', 1, 1);

const dirtyArrowTableLevelUnder90 = new LootTable()
    .add('Steel arrowtips', 1, 1)
    .add('Mithril arrowtips', 1, 7)
    .add('Adamant arrowtips', 1, 9)
    .add('Rune arrowtips', 1, 5)
    .add('Dragon arrowtips', 1, 3);

const dirtyArrowTableLevel90Plus = new LootTable()
    .add('Steel arrowtips', 1, 1)
    .add('Mithril arrowtips', 1, 60)
    .add('Adamant arrowtips', 1, 80)
    .add('Rune arrowtips', 1, 45)
    .add('Dragon arrowtips', 1, 23);
	
export const preRollTable = new LootTable()
    .add('Bow string spool', [3, 6], 5)
    .add('Fletching knife', [3, 6], 3)
    .add('Greenman mask', [3, 6], 2)

const offeringsTable = (() => {
    const table = new LootTable()
        .add('Dirty arrowtips', [26, 32], 16)
        .add('Ent branch', 1, 13)
        .add('Bale of flax', [5, 6], 10)
        .add('Blessed bone shards', [70, 90], 7)
        .add('Anima-infused bark', [70, 90], 5)
        .add('Feather', [400, 500], 3)
        .add('Yew roots', [3, 4], 2)
        .add('Magic roots', [2, 3], 2)
        .add('Willow roots', [3, 4], 1)
        .add('Maple roots', [3, 4], 1);
    
    clueTiers.forEach(([tier, rate]) => {
        table.tertiary(rate, createClueNest(tier));
    });

    return table;
})

export function rummageOfferings(fletchLvl: number): Bank {
    const loot = new Bank();
    const lootTable = new LootTable();

    lootTable.add(offeringsTable());

    const lootByLevel: [number, [LootTable, number]][] = [
        [50, [OfferingsSeedTableLevelUnder50, 1]],
        [65, [OfferingsSeedTableLevelUnder65, 1]],
        [80, [OfferingsSeedTableLevelUnder80, 1]],
        [90, [OfferingsSeedTableLevelUnder90, 2]],
        [100, [OfferingsSeedTableLevel90Plus, 2]],
    ];

    const [, [seedTable, nestQty]] = lootByLevel.find(
        ([maxLvl]) => fletchLvl < maxLvl
    )!;

    lootTable.add(seedTable, 1, 11);
    lootTable.add(valeOfferingNests, nestQty, 10);

    loot.add(lootTable.roll());

    return loot;
}

export function cleanDirtyArrows(fletchLvl: number): Bank {
    const loot = new Bank();

    const tableByLevel: [number, LootTable][] = [
        [50, dirtyArrowTableLevelUnder50],
        [65, dirtyArrowTableLevelUnder65],
        [80, dirtyArrowTableLevelUnder80],
        [90, dirtyArrowTableLevelUnder90],
        [100, dirtyArrowTableLevel90Plus]
    ];

    const selectedTable = tableByLevel.find(([maxLvl]) => fletchLvl < maxLvl)![1];

    loot.add(selectedTable.roll());

    return loot;
}