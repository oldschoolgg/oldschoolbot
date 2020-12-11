import LootTable from 'oldschooljs/dist/structures/LootTable';

import {
	HighSeedPackTable,
	LowSeedPackTable,
	MediumSeedPackTable
} from '../../commands/Minion/seedpack';

export const SeedTable = new LootTable()
	.every(LowSeedPackTable)
	.add(LowSeedPackTable, 1, 4)
	.add(MediumSeedPackTable, 1, 2)
	.add(HighSeedPackTable);

const LowRunes = new LootTable()
	.add('Air rune', [50, 100])
	.add('Mind rune', [50, 100])
	.add('Water rune', [50, 100])
	.add('Earth rune', [50, 100])
	.add('Fire rune', [50, 100])
	.add('Body rune', [50, 100])
	.add('Cosmic rune', [50, 100])
	.add('Chaos rune', [50, 100]);
const HighRuneTable = new LootTable()
	.add('Nature rune', [20, 50])
	.add('Law rune', [20, 50])
	.add('Death rune', [20, 50])
	.add('Blood rune', [20, 50])
	.add('Soul rune', [20, 50])
	.add('Wrath rune', [20, 50])
	.add('Astral rune', [20, 50]);

export const RuneTable = new LootTable().add(LowRunes, 1, 3).add(HighRuneTable);
