import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { makeRevTable } from '../../../../util';

export const RevenantDarkBeastTable = new LootTable()
	.every('Revenant ether', [1, 11])

	/* Weapons and armour */
	.add('Bracelet of ethereum (uncharged)', 1, 15)
	.add('Battlestaff', 3, 5)
	.add('Rune full helm', 1, 2)
	.add('Rune platebody', 1, 2)
	.add('Rune platelegs', 1, 2)
	.add('Rune kiteshield', 1, 2)
	.add('Rune warhammer', 1, 2)
	.add('Dragon platelegs', 1, 1)
	.add('Dragon plateskirt', 1, 1)
	.add('Dragon dagger', 1, 1)
	.add('Dragon longsword', 1, 1)
	.oneIn(677, 'Dragon med helm')

	/* Resources */
	.add('Coal', [50, 100], 6)
	.add('Adamantite bar', [8, 12], 6)
	.add('Runite ore', [3, 6], 6)
	.add('Runite bar', [3, 5], 6)
	.add('Black dragonhide', [10, 15], 6)
	.add('Mahogany plank', [15, 25], 5)
	.add('Manta ray', [30, 50], 3)
	.add('Yew logs', [60, 100], 3)
	.add('Magic logs', [15, 25], 2)
	.add('Uncut dragonstone', [5, 7], 1)

	/* Other */
	.add('Coins', [1, 251], 26)
	.add('Revenant cave teleport', 1, 7)
	.add('Super restore(4)', [3, 5], 4)
	.add('Dragonstone bolt tips', [40, 70], 4)
	.add('Onyx bolt tips', [5, 10], 4)
	.add('Law rune', [80, 120], 3)
	.add('Death rune', [60, 100], 3)
	.add('Blood rune', [60, 100], 3);

export default new SimpleMonster({
	id: 7938,
	name: 'Revenant dark beast',
	table: RevenantDarkBeastTable,
	aliases: ['revenant dark beast'],
	customKillLogic: makeRevTable({
		seeds: [1210, 1210],
		uniqueTable: [3227, 645],
		ancientEmblem: [4840, 4840],
		ancientTotem: [1210, 1210],
		ancientCrystal: [1613, 1613],
		ancientStatuette: [2420, 2420],
		topThree: [4840, 4840]
	})
});
