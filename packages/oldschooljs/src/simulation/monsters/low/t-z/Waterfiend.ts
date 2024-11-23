import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';

const WaterfiendTable = new LootTable()
	.every('Water rune')
	.every('Fiendish ashes')

	/* Pre-roll */
	.oneIn(3000, 'Mist battlestaff')

	/* Weapons and armour */
	.add('Staff of water', 1, 6)
	.add('Water battlestaff', 1, 4)
	.add('Adamant chainbody', 1, 2)
	.add('Adamant warhammer', 1, 2)
	.add('Rune med helm', 1, 2)
	.add('Mystic water staff', 1, 1)
	.add("Blue d'hide vambraces", 1, 1)
	.add('Rune full helm', 1, 1)

	/* Runes and ammunition */
	.add('Mithril arrow', 90, 10)
	.add('Water rune', 150, 6)
	.add('Sapphire bolts', 15, 5)
	.add('Death rune', 23, 5)
	.add('Blood rune', 17, 3)
	.add('Mist rune', [25, 75], 2)
	.add('Mud rune', [75, 100], 2)
	.add('Steam rune', [40, 60], 2)

	/* Materials */
	.add('Mithril ore', [10, 20], 4)
	.add('Raw lobster', 18, 3)
	.add('Raw shark', 8, 3)
	.add('Shark', 2, 3)
	.add('Mithril bar', [10, 15], 1)
	.add('Uncut sapphire', 3, 1)
	.add('Uncut emerald', 3, 1)
	.add('Uncut ruby', 3, 1)
	.add('Uncut diamond', 3, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 9)

	/* Seeds */
	.add(RareSeedTable, 1, 4)
	.add('Watermelon seed', [5, 15], 3)

	/* Other */
	.add('Coins', [2000, 3000], 15)
	.add('Water orb', [6, 10], 8)
	.add('Vial of water', [40, 50], 4)
	.add('Water talisman', 1, 4)
	.add('Oyster', 3, 2)
	.add('Seaweed', [20, 30], 2)
	.add('Snape grass', [20, 30], 2)

	/* Gem drop table */
	.add(GemTable, 1, 3)

	/* Tertiary */
	.tertiary(24, 'Crystal shard')
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 2916,
	name: 'Waterfiend',
	table: WaterfiendTable,
	aliases: ['waterfiend']
});
