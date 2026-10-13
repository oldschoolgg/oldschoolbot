import { RareDropTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

// Either sharks or yellowfins, bundled with a prayer potion(2) and a super combat potion(1).
const MadAngelSupplyBatch = new LootTable()
	.every(new LootTable().add('Shark', 2).add('Yellowfin', 2))
	.every('Prayer potion(2)')
	.every('Super combat potion(1)');

const MadAngelTable = new LootTable()
	.every('Granite dust', [25, 35])

	/* Pre-roll: rolled independently so both these rates and the main table's x/150 rates match the wiki */
	.tertiary(25, 'Ardeaglais teleport', 2)
	.tertiary(127, 'Hallowfell')
	.tertiary(1000, 'Jar of Light')

	/* Weapons and armour */
	.add('Rune kiteshield', 1, 12)
	.add('Rune full helm', 1, 12)
	.add('Adamant longsword', 1, 6)
	.add('Dragon med helm', 1, 2)
	.add('Dragon battleaxe', 1, 2)

	/* Runes and ammunition */
	.add('Cannonball', [90, 100], 16)
	.add('Law rune', [28, 30], 12)
	.add('Nature rune', [20, 25], 8)
	.add('Death rune', [40, 50], 8)
	.add('Air rune', [110, 120], 4)

	/* Supply batch */
	.add(MadAngelSupplyBatch, 1, 16)

	/* Other */
	.add('Prayer potion(4)', 1, 12)
	.add('Super combat potion(3)', [2, 3], 8)
	.add('Coins', [8000, 10_000], 8)
	.add('Raw monkfish', [18, 22], 8)
	.add('Emerald', [7, 8], 6)
	.add('Sapphire', [7, 8], 6)
	.add('Cupronickel bar', 1, 1)
	.add('Papyrus', 1, 1)

	/* Rare drop table */
	.add(RareDropTable, 1, 2)

	/* Tertiary */
	.tertiary(25, 'Clue scroll (medium)')
	.tertiary(2000, 'Aggy');

export const MadAngel: SimpleMonster = new SimpleMonster({
	id: 16305,
	name: 'Mad Angel',
	table: MadAngelTable,
	aliases: ['mad angel', 'madangel', 'angel']
});
