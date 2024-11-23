import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { GemTable } from '../../subtables/RareDropTable';
import RareSeedTable from '../../subtables/RareSeedTable';

const TatteredPageTable = new LootTable()
	.add('Tattered moon page')
	.add('Tattered sun page')
	.add('Tattered temple page');

const HerbTable = new LootTable()
	.add('Grimy kwuarm', [10, 15], 31)
	.add('Grimy cadantine', [10, 15], 27)
	.add('Grimy dwarf weed', [10, 15], 25)
	.add('Grimy avantoe', [5, 10], 22)
	.add('Grimy lantadyme', [10, 15], 17)
	.add('Grimy ranarr weed', [5, 10], 16)
	.add('Grimy snapdragon', [5, 10], 15)
	.add('Grimy torstol', [5, 10], 12);

const SarachnisTable = new LootTable()
	/* Pre-roll */
	.oneIn(192, 'Dragon med helm')
	.oneIn(384, 'Sarachnis cudgel')

	/* Armour and weaponry */
	.add('Battlestaff', [8, 10], 2)
	.add('Rune platebody', 1, 2)
	.add('Rune med helm', 1, 2)
	.add('Rune 2h sword', 1, 2)

	/* Runes and ammunition */
	.add('Blood rune', [80, 100], 5)
	.add('Chaos rune', [175, 200], 5)
	.add('Cosmic rune', [125, 150], 5)
	.add('Death rune', [80, 100], 5)
	.add('Soul rune', [80, 100], 5)
	.add('Mithril arrow', [450, 600], 2)
	.add('Mithril bolts', [175, 225], 2)

	/* Seeds and Herbs */
	.add(HerbTable, 1, 10)
	.add(RareSeedTable, 3, 2)
	.add('Maple seed', 2, 1)
	.add('Papaya tree seed', 2, 1)
	.add('Yew seed', 1, 1)

	/* Materials */
	.add('Mithril ore', [60, 90], 6)
	.add('Red dragonhide', [15, 25], 5)
	.add('Uncut sapphire', [20, 30], 4)
	.add('Adamantite ore', [30, 40], 3)
	.add('Uncut emerald', [20, 30], 3)
	.add('Onyx bolt tips', [8, 10], 2)
	.add('Uncut ruby', [20, 30], 2)
	.add('Runite ore', [4, 6], 1)
	.add('Uncut diamond', [20, 30], 1)

	/* Other */
	.add('Coins', [17_000, 25_000], 6)
	.add('Dragon bones', [10, 15], 5)
	.add('Egg potato', [5, 8], 5)
	.add('Weapon poison(++)', [4, 6], 2)
	.add('Crystal key', 1, 1)
	.add('Spider carcass', 10, 1)

	/* Gem drop table */
	.add(GemTable, 1, 1)

	/* Tertiary */
	.tertiary(5, TatteredPageTable)
	.tertiary(15, 'Grubby key')
	.tertiary(20, 'Giant egg sac(full)')
	.tertiary(40, 'Clue scroll (hard)')
	.tertiary(60, 'Clue scroll (elite)')
	.tertiary(2000, 'Jar of eyes')
	.tertiary(3000, 'Sraracha');

export default new SimpleMonster({
	id: 8713,
	name: 'Sarachnis',
	table: SarachnisTable,
	aliases: ['sarachnis', 'sarac', 'sarach', 'saracnis']
});
