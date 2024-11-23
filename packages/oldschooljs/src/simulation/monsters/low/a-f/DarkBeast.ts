import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';

const DBHerbTable = new LootTable().add(HerbDropTable, 1, 4).add(HerbDropTable, 2, 1);

export const DarkBeastPreTable = new LootTable()
	/* Weapons and armour */
	.add('Black battleaxe', 1, 3)
	.add('Adamant sq shield', 1, 1)
	.add('Rune chainbody', 1, 1)
	.add('Rune med helm', 1, 1)
	.add('Rune full helm', 1, 1)
	.add('Rune 2h sword', 1, 1)
	.add('Rune battleaxe', 1, 1)
	.oneIn(512, 'Dark bow')

	/* Runes and ammunition */
	.add('Death rune', 20, 8)
	.add('Chaos rune', 30, 7)
	.add('Blood rune', 15, 4)

	/* Herbs */
	.add(DBHerbTable, 1, 24)

	/* Seeds */
	.add(RareSeedTable, 1, 4)

	/* Coins */
	.add('Coins', 152, 40)
	.add('Coins', 64, 6)
	.add('Coins', 95, 6)
	.add('Coins', 220, 5)

	/* Other */
	.add('Shark', 1, 3)
	.add('Adamantite bar', 3, 2)
	.add('Adamantite ore', 5, 1)
	.add('Death talisman', 1, 1)
	.add('Runite ore', 1, 1)
	.add('Shark', 2, 1)

	/* RDT */
	.add(RareDropTable, 1, 3)
	.add(GemTable, 1, 3);

const DarkBeastTable = new LootTable()
	.every('Big bones')
	.every(DarkBeastPreTable)

	/* Tertiary */
	.tertiary(24, 'Crystal shard')
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(400, 'Long bone')
	.tertiary(1200, 'Clue scroll (elite)')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 4005,
	name: 'Dark Beast',
	table: DarkBeastTable,
	aliases: ['dark beast', 'dark b']
});
