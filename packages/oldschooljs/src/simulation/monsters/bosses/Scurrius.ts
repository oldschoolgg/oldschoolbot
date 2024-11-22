import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';

const ScurriusTable = new LootTable({ limit: 100 })
	.every('Big bones')
	.every('Raw rat meat')
	.add('Adamant platebody', 1, 6)
	.add('Rune med helm', 1, 6)
	.add('Rune full helm', 1, 6)
	.add('Rune sq shield', 1, 6)
	.add('Rune chainbody', 1, 6)
	.add('Rune battleaxe', 1, 6)
	.add('Adamant arrow', [20, 50], 6)
	.add('Rune arrow', [20, 50], 6)
	.add('Chaos rune', [70, 125], 6)
	.add('Death rune', [40, 90], 3)
	.add('Law rune', [10, 30], 3)
	.add('Trout', [1, 3], 6)
	.add('Tuna', [1, 3], 6)
	.add('Lobster', [1, 3], 6)
	.add('Prayer potion(4)', 1, 6)
	.add('Shark', 1, 3)
	.add('Ranging potion(1)', 1, 3)
	.add('Super strength(1)', 1, 3)
	.add('Cheese', 1, 1)
	.add('Coins', [1000, 9000], 6)
	.tertiary(25, 'Clue scroll (medium)')
	.tertiary(33, "Scurrius' spine")
	.tertiary(400, 'Long bone')
	.tertiary(3000, 'Scurry')
	.tertiary(5012, 'Curved bone');

export default new SimpleMonster({
	id: 7222,
	name: 'Scurrius',
	table: ScurriusTable,
	aliases: ['scurrius']
});
