import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

const ZombiePiratesLocker = new LootTable()
	/* Pre-roll */
	.oneIn(275, 'Teleport anchoring scroll')

	/* Runes */
	.add('Blood rune', [60, 120], 4)
	.add('Death rune', [60, 180], 4)
	.add('Chaos rune', [60, 180], 4)
	.add('Mind rune', [60, 180], 4)

	/* Weapons and armour */
	.add('Battlestaff', [2, 6], 8)
	.add('Adamant platebody', 2, 6)
	.add('Rune med helm', 2, 6)
	.add('Rune warhammer', 2, 6)
	.add('Rune battleaxe', 2, 6)
	.add('Rune longsword', 2, 6)
	.add('Rune sword', 2, 6)
	.add('Rune mace', 2, 6)
	.add('Dragon dagger', 2, 1)
	.add('Dragon longsword', 2, 1)
	.add('Dragon scimitar', 2, 1)

	/* Blighted supplies */
	.add('Blighted ancient ice sack', [20, 60], 12)
	.add('Blighted anglerfish', [10, 30], 12)
	.add('Blighted manta ray', [10, 30], 12)
	.add('Blighted karambwan', [10, 30], 12)
	.add('Blighted super restore(4)', [2, 6], 12)

	/* Other */
	.add('Coins', [2_000, 16_000], 12)
	.add('Cannonball', [40, 200], 12)
	.add('Gold ore', [10, 30], 12)
	.add('Adamant seeds', [10, 20], 8);

export default new SimpleOpenable({
	id: 29_449,
	name: "Zombie Pirate's Locker",
	aliases: ['zombie pirate locker', 'pirate locker'],
	table: ZombiePiratesLocker
});
