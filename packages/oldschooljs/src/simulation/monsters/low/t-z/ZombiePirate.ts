import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const ZombiePirateTable = new LootTable()
	.every('Bones')

	/* Pre-roll */
	.oneIn(2, new LootTable()) // 'Nothing' drop
	.oneIn(24, 'Zombie pirate key')
	.oneIn(20_000, 'Teleport anchoring scroll')

	/* Runes */
	.add('Blood rune', [30, 60], 4)
	.add('Death rune', [30, 90], 4)
	.add('Chaos rune', [30, 90], 4)
	.add('Mind rune', [30, 90], 4)

	/* Weapons and armour */
	.add('Battlestaff', [1, 3], 8)
	.add('Adamant platebody', 1, 6)
	.add('Rune med helm', 1, 6)
	.add('Rune warhammer', 1, 6)
	.add('Rune battleaxe', 1, 6)
	.add('Rune longsword', 1, 6)
	.add('Rune sword', 1, 6)
	.add('Rune mace', 1, 6)
	.add('Dragon dagger', 1, 1)
	.add('Dragon longsword', 1, 1)
	.add('Dragon scimitar', 1, 1)

	/* Blighted supplies */
	.add('Blighted ancient ice sack', [10, 30], 12)
	.add('Blighted anglerfish', [5, 15], 12)
	.add('Blighted manta ray', [5, 15], 12)
	.add('Blighted karambwan', [5, 15], 12)
	.add('Blighted super restore(4)', [1, 3], 12)

	/* Other */
	.add('Coins', [1_000, 8_000], 12)
	.add('Cannonball', [20, 100], 12)
	.add('Gold ore', [5, 15], 12)
	.add('Adamant seeds', [5, 10], 8)

	/* Tertiary */
	.tertiary(5000, 'Zombie champion scroll');

export default new SimpleMonster({
	id: 13_489,
	name: 'Zombie pirate',
	table: ZombiePirateTable,
	aliases: ['zombie pirate']
});
