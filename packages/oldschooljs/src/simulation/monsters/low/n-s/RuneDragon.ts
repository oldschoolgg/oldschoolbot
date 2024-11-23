import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable from '../../../subtables/RareDropTable';
import UsefulHerbTable from '../../../subtables/UsefulHerbTable';

const RuneDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Runite bar')

	/* Weapons and armour */
	.add('Rune platebody', 1, 9)
	.add('Rune longsword', 1, 8)
	.add('Rune mace', 1, 7)
	.add('Rune scimitar', 1, 7)
	.add('Rune warhammer', 1, 7)
	.add('Rune platelegs', 1, 6)
	.add('Dragon platelegs', 1, 1)
	.add('Dragon plateskirt', 1, 1)
	.add('Dragon med helm', 1, 1)

	/* Runes and ammunition */
	.add('Rune arrow', [30, 40], 8)
	.add('Wrath rune', [30, 50], 8)
	.add('Chaos rune', [75, 150], 7)
	.add('Death rune', [50, 100], 7)

	/* Herbs */
	.add(UsefulHerbTable, 1, 8)

	/* Other */
	.add('Rune javelin heads', [20, 30], 10)
	.add('Runite bolts (unf)', [20, 30], 11)
	.add('Dragonstone', 1, 7)
	.add('Runite ore', [2, 5], 6)
	.add('Dragon javelin heads', [30, 40], 5)
	.add('Dragon bolts (unf)', [20, 40], 1)
	.add('Wrath talisman', 1, 1)

	/* RDT */
	.add(RareDropTable, 1, 1)

	/* Tertiary */
	.tertiary(300, 'Clue scroll (elite)')
	.tertiary(800, 'Dragon limbs')
	.tertiary(5000, 'Dragon metal lump')
	.tertiary(8000, 'Draconic visage');

export default new SimpleMonster({
	id: 8031,
	name: 'Rune Dragon',
	table: RuneDragonTable,
	aliases: ['rune dragon']
});
