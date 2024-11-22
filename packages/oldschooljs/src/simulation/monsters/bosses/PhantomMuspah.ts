import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import RareDropTable from '../../subtables/RareDropTable';
import TreeHerbSeedTable from '../../subtables/TreeHerbSeedTable';

const UniquePhantomMuspahTable = new LootTable()
	.add('Ancient essence', [540, 599], 60)
	.add('Ancient essence', [885, 995], 23)
	.add('Ancient essence', [1970, 2060], 10)
	.add('Frozen cache', 1, 4)
	.add('Ancient icon', 1, 2)
	.add('Venator shard', 1, 1);

const FoodAndPotions = new LootTable()
	.every(new LootTable().add('Shark', [4, 6]).add('Summer pie', [4, 6]))
	.every(new LootTable().add('Ancient brew(3)', [1, 2]).add('Super restore(3)', [2, 3]))
	.every(new LootTable().add('Ranging potion(3)', [1, 2]).add('Prayer potion(3)', [2, 3]));

const MoreHerbs = new LootTable()
	.add('Grimy kwuarm', 6, 5)
	.add('Grimy cadantine', 6, 4)
	.add('Grimy dwarf weed', 6, 4)
	.add('Grimy lantadyme', 6, 3);

const NormalPhantomMuspahTable = new LootTable()
	/* Weapons and armour */
	.add('Rune kiteshield', 3, 10)
	.add('Dragon plateskirt', 1, 5)
	.add('Rune platelegs', 3, 5)
	.add("Black d'hide body", 1, 5)
	.add('Dragon platelegs', 2, 4)
	.add('Rune sword', 1, 1)

	/* Runes and ammunition */
	.add('Law rune', 146, 10)
	.add('Soul rune', 466, 10)
	.add('Death rune', 428, 10)
	.add('Smoke rune', 314, 10)
	.add('Chaos rune', 480, 5)
	.add('Fire rune', 1964, 5)
	.add('Cannonball', 666, 5)

	/* Herbs */
	.add('Grimy toadflax', 55, 3)
	.add(MoreHerbs, 1, 5)

	/* Seeds */
	.add('Yew seed', 2, 5)
	.add('Torstol seed', 4, 5)
	.add('Palm tree seed', 2, 5)
	.add('Ranarr seed', 3, 5)
	.add('Snapdragon seed', 5, 4)
	.add('Ranarr seed', 8, 3)
	.add('Spirit seed', 1, 2)
	.add(TreeHerbSeedTable, 3, 5, { multiply: true })

	/* Resources */
	.add('Adamantite ore', 22, 10)
	.add('Gold ore', 180, 10)
	.add('Teak plank', 22, 10)
	.add('Molten glass', 89, 10)
	.add('Pure essence', 2314, 5)
	.add('Coal', 163, 5)
	.add('Runite ore', 18, 3)
	.add('Silver ore', 101, 2)

	/* Other */
	.add('Manta ray', 28, 10)
	.add('Water orb', 21, 10)
	.add('Dragon bolts (unf)', 89, 10)
	.add('Limpwurt root', 21, 3)

	/* Rare drop table */
	.add(RareDropTable, 1, 5);

const TotalPhantomMuspahTable = new LootTable()
	// If venator shard drops, delete other drops on that kill
	.every(UniquePhantomMuspahTable, 1)
	.every(new LootTable().add(NormalPhantomMuspahTable, 1, 7).add(FoodAndPotions, 1, 2), 1)
	.every(NormalPhantomMuspahTable)
	// Charged ice once if under 3 min, skipped here
	.tertiary(40, 'Clue scroll (hard)')
	.tertiary(50, 'Clue scroll (elite)')
	.tertiary(2500, 'Muphin');

export default new SimpleMonster({
	id: 12_077,
	name: 'Phantom Muspah',
	table: TotalPhantomMuspahTable,
	aliases: ['phantom muspah', 'muspah', 'money slug']
});
