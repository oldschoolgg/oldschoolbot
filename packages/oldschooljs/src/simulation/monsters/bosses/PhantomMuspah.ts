import { RareDropTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const AncientEssence885to995: LootTable = new LootTable();
for (let qty = 885; qty <= 995; qty += 5) {
	AncientEssence885to995.add('Ancient essence', qty);
}

const AncientEssence1970to2060: LootTable = new LootTable();
for (let qty = 1970; qty <= 2060; qty += 10) {
	AncientEssence1970to2060.add('Ancient essence', qty);
}

const NonVenatorUniquePhantomMuspahTable: LootTable = new LootTable()
	.add('Ancient essence', [540, 599], 60)
	.add(AncientEssence885to995, 1, 23)
	.add(AncientEssence1970to2060, 1, 10)
	.add('Frozen cache', 1, 4)
	.add('Ancient icon', 1, 2);

const FoodAndPotions = new LootTable()
	.every(new LootTable().add('Shark', [4, 6]).add('Summer pie', [4, 6]))
	.every(new LootTable().add('Ancient brew(3)', [1, 2]).add('Ranging potion(3)', [1, 3]))
	.every(new LootTable().add('Super restore(3)', [2, 3]).add('Prayer potion(3)', [2, 3]));

const MoreHerbs = new LootTable()
	.add('Grimy kwuarm', 6, 5)
	.add('Grimy cadantine', 6, 4)
	.add('Grimy dwarf weed', 6, 4)
	.add('Grimy lantadyme', 6, 3);

const MuspahTreeHerbSeedTable: LootTable = new LootTable()
	.add('Ranarr seed', 3, 30)
	.add('Snapdragon seed', 3, 28)
	.add('Torstol seed', 3, 22)
	.add('Watermelon seed', 49, 21)
	.add('Willow seed', 3, 20)
	.add('Mahogany seed', 3, 18)
	.add('Maple seed', 3, 18)
	.add('Teak seed', 3, 18)
	.add('Yew seed', 3, 18)
	.add('Papaya tree seed', 3, 14)
	.add('Magic seed', 3, 11)
	.add('Palm tree seed', 3, 10)
	.add('Spirit seed', 3, 8)
	.add('Dragonfruit tree seed', 3, 6)
	.add('Celastrus seed', 3, 4)
	.add('Redwood tree seed', 3, 4);

const MuspahSharkTable: LootTable = new LootTable()
	.add('Raw shark', 28, 15)
	.add('Shark lure', 56, 15)
	.add('Manta ray', 28, 10);

const NormalPhantomMuspahTable: LootTable = new LootTable()
	/* Weapons and armour */
	.add('Rune kiteshield', 3, 10)
	.add('Dragon plateskirt', 1, 5)
	.add('Rune platelegs', 3, 5)
	.add("Black d'hide body", 1, 5)
	.add('Dragon platelegs', 2, 4)
	.add('Rune sword', 1, 1)

	/* Runes and ammunition */
	.add('Smoke rune', 314, 15)
	.add('Law rune', 146, 10)
	.add('Soul rune', 380, 10)
	.add('Death rune', 428, 10)
	.add('Chaos rune', 480, 5)
	.add('Fire rune', 1964, 5)
	.add('Cannonball', 670, 5)

	/* Herbs */
	.add('Grimy toadflax', 40, 3)
	.add(MoreHerbs, 1, 5)

	/* Seeds */
	.add('Yew seed', 2, 5)
	.add('Torstol seed', 2, 5)
	.add('Palm tree seed', 2, 5)
	.add('Ranarr seed', 3, 5)
	.add('Snapdragon seed', 5, 4)
	.add('Ranarr seed', 5, 3)
	.add('Spirit seed', 1, 2)
	.add(MuspahTreeHerbSeedTable, 1, 5)

	/* Resources */
	.add('Adamantite ore', 22, 10)
	.add('Gold ore', 180, 10)
	.add('Teak plank', 22, 10)
	.add('Dragon bolts (unf)', 89, 10)
	.add('Molten glass', 89, 15)
	.add('Water orb', 21, 15)
	.add('Pure essence', 2314, 5)
	.add('Coal', 163, 5)
	.add('Runite ore', 18, 3)
	.add('Limpwurt root', 21, 3)
	.add('Silver ore', 101, 2)

	/* Other */
	.add(MuspahSharkTable, 1, 10)

	/* Rare drop table */
	.add(RareDropTable, 1, 5);

const MuspahSecondaryRoll = new LootTable().add(NormalPhantomMuspahTable, 1, 7).add(FoodAndPotions, 1, 2);

const NonVenatorMuspahKillTable: LootTable = new LootTable()
	.every(NonVenatorUniquePhantomMuspahTable)
	.every(MuspahSecondaryRoll)
	.every(MuspahSecondaryRoll);

const TotalPhantomMuspahTable: LootTable = new LootTable()
	.add('Venator shard', 1, 1)
	.add(NonVenatorMuspahKillTable, 1, 99)
	// Charged ice once if under 3 min, skipped here
	.tertiary(30, 'Clue scroll (hard)')
	.tertiary(45, 'Clue scroll (elite)')
	.tertiary(2500, 'Muphin');

export const PhantomMuspah: SimpleMonster = new SimpleMonster({
	id: 12_077,
	name: 'Phantom Muspah',
	table: TotalPhantomMuspahTable,
	aliases: ['phantom muspah', 'muspah', 'money slug']
});
