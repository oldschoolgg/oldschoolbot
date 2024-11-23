import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';

const CaveKrakenTable = new LootTable({ limit: 400 })

	/* Weapons and armour */
	.add('Rune med helm', 1, 13)
	.add('Staff of water', 1, 8)
	.add('Adamant spear', 1, 8)
	.add('Rune warhammer', 1, 8)
	.add('Battlestaff', 1, 8)
	.add('Water battlestaff', 1, 8)
	.add('Mystic water staff', 1, 4)
	.oneIn(200, 'Uncharged trident')

	/* Runes and ammunition */
	.add('Death rune', 30, 32)
	.add('Chaos rune', 50, 32)
	.add('Water rune', 15, 20)
	.add('Water rune', 30, 20)
	.add('Water rune', 75, 20)
	.add('Fire rune', 30, 20)
	.add('Blood rune', 5, 16)
	.add('Steam rune', 7, 12)

	/* Herbs */
	.add(HerbDropTable, 1, 12)

	/* Seeds */
	.add(RareSeedTable, 1, 12)

	/* Other */
	.add('Coins', [120, 300], 20)
	.add('Seaweed', 30, 12)
	.add('Swordfish', 2, 12)
	.add('Shark', 1, 12)
	.add('Antidote++(4)', 1, 12)
	.add('Old boot', 1, 8)
	.add('Swamp tar', 60, 8)
	.add('Raw lobster', 3, 8)
	.add('Water orb', 2, 8)
	.add('Oyster', 1, 8)
	.add('Vial of water', 50, 8)
	.add('Water talisman', 1, 8)
	.add('Bucket', 1, 2)
	.oneIn(1200, 'Kraken tentacle')

	/* RDT */
	.add(GemTable, 1, 12)

	/* Tertiary */
	.tertiary(100, 'Clue scroll (hard)')
	.tertiary(1200, 'Clue scroll (elite)');

export default new SimpleMonster({
	id: 492,
	name: 'Cave Kraken',
	table: CaveKrakenTable,
	aliases: ['cave kraken', 'cave k']
});
