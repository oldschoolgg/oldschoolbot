import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable from '../../../subtables/RareDropTable';

export const WarpedTerrorbirdTable = new LootTable()
	.tertiary(512, 'Clue scroll (hard)')
	.tertiary(320, 'Warped sceptre (uncharged)')
	.every('Bones')
	.add('Adamant warhammer', 1, 2)
	.add('Adamant platebody', 1, 2)
	.add('Rune battleaxe', 1, 1)
	.add('Rune kiteshield', 1, 1)
	.add('Rune warhammer', 1, 1)

	.add('Air rune', [80, 120], 6)
	.add('Earth rune', [80, 100], 6)
	.add('Death rune', [15, 20], 3)
	.add('Law rune', [15, 20], 3)
	.add('Soul rune', [10, 15], 3)

	.add('Coins', [600, 800], 8)
	.add('Raw shark', [3, 7], 5)
	.add('Swamp tar', [40, 60], 5)
	.add('Feather', [100, 200], 4)
	.add('Weapon poison', 1, 3)
	.add('Diamond bolt tips', [24, 32], 3)
	.add('Chocolate bomb', [2, 3], 3)
	.add('Adamantite ore', [3, 5], 2)
	.add(RareDropTable, 1, 3);

export const WarpedTerrorbird = new SimpleMonster({
	id: 12_491,
	name: 'Warped Terrorbird',
	table: WarpedTerrorbirdTable,
	aliases: ['warped terrorbird']
});
