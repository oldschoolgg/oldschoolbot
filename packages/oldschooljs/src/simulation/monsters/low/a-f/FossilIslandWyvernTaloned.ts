import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import TreeHerbSeedTable from '../../../subtables/TreeHerbSeedTable';
import WyvernHerbTable from '../../../subtables/WyvernHerbTable';

const TalonedWyvernTable = new LootTable()
	.every('Wyvern bones')
	.oneIn(512, 'Granite longsword')
	.oneIn(2560, 'Granite boots')

	/* Weapons and armour */
	.add('Air battlestaff', 1, 4)
	.add('Battlestaff', [3, 5], 3)
	.add('Adamant battleaxe', 1, 2)
	.add('Adamant full helm', 1, 2)
	.add('Rune pickaxe', 1, 2)
	.add('Adamant platebody', 1, 2)

	/* Runes and ammunition */
	.add('Adamant arrow', [38, 42], 6)
	.add('Water rune', 50, 4)
	.add('Chaos rune', 15, 4)
	.add('Law rune', 15, 4)
	.add('Death rune', 15, 4)
	.add('Blood rune', 15, 4)
	.add('Soul rune', 10, 1)
	.add('Runite bolts', [12, 30], 1)

	/* Herbs */
	.add(WyvernHerbTable, 1, 13)

	/* Seeds */
	.add(TreeHerbSeedTable, 1, 1)
	.add('Seaweed spore', 12, 2)
	.add('Ranarr seed', 1, 2)

	/* Resources */
	.add('Pure essence', 150, 8)
	.add('Adamantite bar', [2, 4], 6)
	.add('Teak logs', 35, 6)
	.add('Snape grass', [10, 15], 3)
	.add('Runite ore', [1, 2], 3)

	/* Other */
	.add('Coins', 3000, 11)
	.add('Lobster', 2, 8)
	.add('Prayer potion(4)', 1, 7)
	.add('Adamant crossbow (u)', 1, 2)
	.add('Calcite', 2, 2)
	.add('Pyrophosphite', 2, 2)
	.add('Volcanic ash', [20, 60], 2)

	/* Tertiary */
	.tertiary(2, 'Numulite', [5, 95])
	.tertiary(35, 'Unidentified small fossil')
	.tertiary(70, 'Unidentified medium fossil')
	.tertiary(88, 'Unidentified large fossil')
	.tertiary(118, 'Clue scroll (hard)')
	.tertiary(350, 'Unidentified rare fossil')
	.tertiary(12_000, 'Wyvern visage');

export default new SimpleMonster({
	id: 7793,
	name: 'Taloned Wyvern',
	table: TalonedWyvernTable,
	aliases: ['taloned wyvern', 'taloned']
});
