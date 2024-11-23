import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';

const AncientShardTable = new LootTable({ limit: 100 })
	.add('Ancient shard', 1, 75)
	.add('Ancient shard', 2, 15)
	.add('Ancient shard', 3, 5)
	.add('Ancient shard', 4, 4)
	.add('Ancient shard', 5, 1);

const SkotizoTable = new LootTable()
	.every('Infernal ashes')
	.every('Clue scroll (hard)')
	.every(AncientShardTable)

	/* Armour */
	.add('Rune platebody', 3, 1)
	.add('Rune platelegs', 3, 1)
	.add('Rune plateskirt', 3, 1)

	/* Runes */
	.add('Death rune', 500, 1)
	.add('Soul rune', 450, 1)
	.add('Blood rune', 450, 1)

	/* Herbs */
	.add('Grimy snapdragon', 20, 1)
	.add('Grimy torstol', 20, 1)

	/* Materials */
	.add('Battlestaff', 25, 1)
	.add('Onyx bolt tips', 40, 1)
	.add('Adamantite ore', 75, 1)
	.add('Runite bar', 20, 1)
	.add('Raw anglerfish', 60, 1)
	.add('Mahogany plank', 150, 1)
	.oneIn(100, 'Uncut dragonstone', 10)
	.oneIn(1000, 'Uncut onyx')

	/* Other */
	.oneIn(100, 'Shield left half')

	/* Tertiary */
	.tertiary(5, 'Clue scroll (elite)')
	.tertiary(9, 'Ensouled demon head')
	.tertiary(25, 'Dark claw')
	.tertiary(65, 'Skotos')
	.tertiary(128, 'Dark totem base')
	.tertiary(128, 'Dark totem base')
	.tertiary(128, 'Dark totem base')
	.tertiary(128, 'Dark totem')
	.tertiary(200, 'Jar of darkness');

export default new SimpleMonster({
	id: 7286,
	name: 'Skotizo',
	table: SkotizoTable,
	aliases: ['skotizo']
});
