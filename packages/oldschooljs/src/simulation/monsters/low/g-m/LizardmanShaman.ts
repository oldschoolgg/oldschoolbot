import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { NotedHerbTable } from '../../../subtables/NotedHerbTable';
import RareDropTable from '../../../subtables/RareDropTable';
import TreeHerbSeedTable from '../../../subtables/TreeHerbSeedTable';

const LizardmanShamanTable = new LootTable({ limit: 500 })
	.every('Big bones')
	.oneIn(3000, 'Dragon warhammer')

	/* Weapons and armor */
	.add('Rune med helm', 1, 18)
	.add('Earth battlestaff', 1, 17)
	.add('Mystic earth staff', 1, 17)
	.add('Rune warhammer', 1, 16)
	.add('Rune chainbody', 1, 12)
	.add("Red d'hide vambraces", 1, 10)

	/* Runes */
	.add('Air rune', [60, 80], 25)
	.add('Chaos rune', [40, 60], 25)
	.add('Death rune', [20, 30], 25)
	.add('Fire rune', [60, 80], 25)

	/*  Materials */
	.add('Xerician fabric', 2, 40)
	.add('Coal', [20, 25], 20)
	.add('Iron ore', [30, 35], 20)
	.add('Runite ore', [3, 5], 8)

	/* Herbs */
	.add(NotedHerbTable, [2, 3], 45)

	/* Seeds */
	.add(TreeHerbSeedTable, 1, 10)

	/* Other */
	.add('Coins', [100, 6000], 70)
	.add('Lizardman fang', [10, 14], 38)
	.add('Chilli potato', 2, 30)
	.add("Xeric's talisman (inert)", 1, 4)

	/* RDT */
	.add(RareDropTable, 1, 20)

	/* Tertiary */
	.tertiary(200, 'Clue scroll (hard)')
	.tertiary(400, 'Long bone')
	.tertiary(1200, 'Clue scroll (elite)')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 6766,
	name: 'Lizardman Shaman',
	table: LizardmanShamanTable,
	aliases: ['lizardman shaman', 'shaman']
});
