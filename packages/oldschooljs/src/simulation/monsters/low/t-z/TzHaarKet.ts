import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const OnyxBoltTipTable = new LootTable().add('Onyx bolt tips', [1, 4], 1).add('Onyx bolt tips', 20, 1);

const TzHaarKetTable = new LootTable()
	/* Weapons and armour */
	.oneIn(512, 'Tzhaar-ket-om')
	.oneIn(512, 'Toktz-ket-xil')
	.oneIn(512, 'Obsidian cape')
	.oneIn(2000, 'Obsidian helmet')
	.oneIn(2000, 'Obsidian platebody')
	.oneIn(2000, 'Obsidian platelegs')

	/* Materials */
	.add('Uncut sapphire', 1, 4)
	.add('Uncut emerald', 1, 3)
	.add('Uncut ruby', 1, 3)
	.add('Uncut diamond', 1, 1)
	.add(OnyxBoltTipTable, 1, 1)

	/* Other */
	.add('Tokkul', [1, 103], 15)

	/* Tertiary */
	.tertiary(35, 'Ensouled tzhaar head');

export default new SimpleMonster({
	id: 2173,
	name: 'TzHaar-Ket',
	table: TzHaarKetTable,
	aliases: ['tzhaar-ket', 'tzhaar']
});
