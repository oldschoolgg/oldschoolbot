import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable from '../../../subtables/RareDropTable';

const CerberusUniqueTable = new LootTable()
	.add('Primordial crystal')
	.add('Pegasian crystal')
	.add('Eternal crystal')
	.add('Smouldering stone');

const CerberusTable = new LootTable()
	.every('Infernal ashes')
	.add(CerberusUniqueTable)
	.tertiary(15, 'Ensouled hellhound head')
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(2000, 'Jar of souls')
	.tertiary(3000, 'Hellpuppy')

	/* Weapons and armour */
	.add('Rune platebody', 1, 5)
	.add('Rune chainbody', 1, 4)
	.add('Rune 2h sword', 1, 4)
	.add("Black d'hide body", 1, 3)
	.add('Rune axe', 1, 3)
	.add('Rune pickaxe', 1, 3)
	.add('Battlestaff', 6, 3)
	.add('Rune full helm', 1, 3)
	.add('Lava battlestaff', 1, 2)
	.add('Rune halberd', 1, 2)

	/* Runes and ammunition */
	.add('Fire rune', 300, 6)
	.add('Soul rune', 100, 6)
	.add('Pure essence', 300, 5)
	.add('Blood rune', 60, 4)
	.add('Cannonball', 50, 4)
	.add('Runite bolts (unf)', 40, 4)
	.add('Death rune', 100, 3)

	/* Other */
	.add('Coal', 120, 6)
	.add('Super restore(4)', 2, 6)
	.add('Summer pie', 3, 6)
	.add('Coins', [10_000, 20_000], 5)
	.add('Dragon bones', 20, 5)
	.add('Unholy symbol', 1, 5)
	.add('Wine of zamorak', 15, 5)
	.add('Ashes', 50, 4)
	.add('Fire orb', 20, 4)
	.add('Grimy torstol', 6, 4)
	.add('Runite ore', 5, 3)
	.add('Uncut diamond', 5, 3)
	.add('Key master teleport', 3, 2)
	.add('Torstol seed', 3, 2)

	.add(RareDropTable, 1, 3);

export default new SimpleMonster({
	id: 5862,
	name: 'Cerberus',
	table: CerberusTable,
	aliases: ['cerb', 'cerberus', 'hellhound boss']
});
