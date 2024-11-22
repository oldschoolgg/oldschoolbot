import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import TreeHerbSeedTable from '../../../subtables/TreeHerbSeedTable';

const TormentedDemonHerbTable = new LootTable()
	.add('Grimy kwuarm', 1, 10)
	.add('Grimy dwarf weed', 1, 8)
	.add('Grimy cadantine', 1, 8)
	.add('Grimy lantadyme', 1, 6)
	.add('Grimy avantoe', 1, 5)
	.add('Grimy ranarr weed', 1, 4)
	.add('Grimy snapdragon', 1, 4)
	.add('Grimy torstol', 1, 3);

const TormentedDemonBowTable = new LootTable().add('Magic shortbow (u)', 1, 29).add('Magic longbow (u)', 1, 1);

const TormentedDemonTable = new LootTable()
	.every('Infernal ashes')
	.oneIn(500, 'Tormented synapse')
	.oneIn(500, 'Burning claw')

	/* Weapons and Armour */
	.add('Rune platebody', 1, 4)
	.add('Dragon dagger', 1, 3)
	.add('Battlestaff', 1, 3)
	.add('Rune kiteshield', 1, 2)

	/* Runes and Ammunition */
	.add('Chaos rune', [25, 100], 4)
	.add('Rune arrow', [65, 125], 4)
	.add('Soul rune', [50, 75], 2)

	/* Consumables */
	.add('Manta ray', [1, 2], 4)
	.add('Prayer potion(4)', 1, 1)
	.add('Prayer potion(2)', 2, 1)
	.add(new LootTable(), 1, 5) //Smouldering drops

	/* Other */
	.add(TormentedDemonBowTable, 1, 6)
	.add('Malicious ashes', [2, 3], 2)
	.add('Fire orb', [5, 7], 2)
	.add('Dragon arrowtips', [30, 40], 1)

	.add(TormentedDemonHerbTable, 1, 6)
	.add(TreeHerbSeedTable, 1, 1)

	.tertiary(12, 'Guthixian temple teleport', 2)
	.tertiary(128, 'Clue scroll (elite)');

export default new SimpleMonster({
	id: 13600,
	name: 'Tormented Demon',
	table: TormentedDemonTable,
	aliases: ['tormented demon', 'td', 'tds', 'torm', 'torm demon']
});
