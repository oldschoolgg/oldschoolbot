import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable from '../../../subtables/RareDropTable';
import UsefulHerbTable from '../../../subtables/UsefulHerbTable';

const AdamantDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Adamantite bar', 2)

	/* Weapons and armour */
	.add('Adamant platebody', 1, 9)
	.add('Rune mace', 1, 7)
	.add('Rune scimitar', 1, 7)
	.add('Dragon med helm', 1, 1)
	.add('Dragon platelegs', 1, 1)
	.add('Dragon plateskirt', 1, 1)

	/* Runes and ammunition */
	.add('Adamant arrow', [30, 40], 8)
	.add('Wrath rune', [10, 30], 8)
	.add('Chaos rune', [60, 120], 7)
	.add('Death rune', [30, 60], 7)

	/* Herbs */
	.add(UsefulHerbTable, 1, 8)

	/* Materials */
	.add('Adamant bolts(unf)', [20, 40], 11)
	.add('Adamant javelin heads', [40, 50], 8)
	.add('Diamond', [1, 3], 7)
	.add('Dragon javelin heads', [20, 30], 7)
	.add('Adamantite ore', [8, 20], 6)
	.add('Adamantite bar', [5, 35], 4)
	.add('Dragon bolts (unf)', [15, 20], 1)

	/* Other */
	.add('Wrath talisman', 1, 1)

	/* RDT */
	.add(RareDropTable, 1, 1)

	/* Tertiary */
	.tertiary(320, 'Clue scroll (elite)')
	.tertiary(1000, 'Dragon limbs')
	.tertiary(5000, 'Dragon metal slice')
	.tertiary(9000, 'Draconic visage');

export default new SimpleMonster({
	id: 8030,
	name: 'Adamant Dragon',
	table: AdamantDragonTable,
	aliases: ['adamant dragon', 'addy dragon']
});
