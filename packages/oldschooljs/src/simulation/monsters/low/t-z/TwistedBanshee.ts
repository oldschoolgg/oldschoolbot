import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';

export const TwistedBansheePreTable = new LootTable()
	/* Weapons and armour */
	.add('Battlestaff', 1, 10)
	.add('Air battlestaff', 1, 4)
	.add('Adamant mace', 1, 4)
	.add('Rune dagger', 1, 4)
	.add('Rune med helm', 1, 4)
	.add('Adamant kiteshield', 1, 2)
	.add('Rune full helm', 1, 2)
	.add('Mystic gloves (dark)', 1, 1)

	/* Runes */
	.add('Cosmic rune', 20, 6)
	.add('Air rune', 30, 5)
	.add('Chaos rune', 30, 4)
	.add('Chaos rune', 17, 2)
	.add('Fire rune', 35, 2)

	/* Materials */
	.add('Pure essence', 65, 42)
	.add('Eye of newt', 1, 2)
	.add('Mithril ore', 1, 2)

	/* Coins */
	.add('Coins', 130, 18)
	.add('Coins', 35, 14)
	.add('Coins', 260, 14)

	/* Other */
	.add('Swordfish', 1, 10)

	/* Subtables */
	.add(HerbDropTable, 1, 68)
	.add(RareSeedTable, 1, 26)
	.add(GemTable, 1, 4);

const TwistedBansheeTable = new LootTable()
	.every(TwistedBansheePreTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)', 1);

export default new SimpleMonster({
	id: 7272,
	name: 'Twisted Banshee',
	table: TwistedBansheeTable,
	aliases: ['twisted banshee']
});
