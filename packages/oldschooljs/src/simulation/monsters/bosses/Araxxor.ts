import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import RareDropTable from '../../subtables/RareDropTable';
import TreeHerbSeedTable from '../../subtables/TreeHerbSeedTable';

const AraxxorUniqueTable = new LootTable()
	.add('Araxyte fang')
	.add('Noxious blade')
	.add('Noxious point')
	.add('Noxious pommel');

const SupplyDrop = new LootTable()
	.add(new LootTable().add('Araxyte venom sack').add('Super combat potion(1)'))
	.add(new LootTable().add('Prayer potion(3)', [1, 2]).add('Prayer potion(4)'))
	.add(new LootTable().add('Wild pie', [2, 3]).add('Shark', [2, 3]));

const AraxxorTable = new LootTable()
	.tertiary(50, 'Clue scroll (elite)')
	.tertiary(200, 'Coagulated venom')
	.tertiary(150, AraxxorUniqueTable)
	.tertiary(250, 'Araxyte head')
	.tertiary(1500, 'Jar of venom')
	.tertiary(3000, 'Nid')
	.oneIn(8, SupplyDrop)

	.add('Rune kiteshield', 2, 8)
	.add('Rune platelegs', 2, 8)
	.add('Dragon mace', 2, 6)
	.add('Rune 2h sword', 5, 1)
	.add('Dragon platelegs', 2, 1)

	.add('Death rune', 250, 5)
	.add('Nature rune', 80, 2)
	.add('Mud rune', 100, 1)
	.add('Blood rune', 180, 1)

	.add('Yew seed', 1, 4)
	.add('Toadflax seed', 4, 3)
	.add('Ranarr seed', 3, 1)
	.add('Snapdragon seed', 3, 1)
	.add('Magic seed', 2, 1)
	.add(TreeHerbSeedTable, 1, 1)

	.add('Coal', 120, 4)
	.add('Adamantite ore', 85, 4)
	.add('Raw shark', 21, 4)
	.add('Yew logs', 70, 3)
	.add('Runite ore', 12, 2)
	.add('Raw shark', 100, 1)
	.add('Raw monkfish', 120, 1)
	.add('Pure essence', 1200, 1)

	.add('Spider cave teleport', 3, 8)
	.add('Earth orb', 45, 6)
	.add('Araxyte venom sack', 6, 5)
	.add('Mort myre fungus', 24, 4)
	.add('Antidote++(3)', 6, 4)
	.add('Wine of zamorak', 8, 3)
	.add("Red spiders' eggs", 40, 2)
	.add('Araxyte venom sack', 12, 2)
	.add('Bark', 15, 1)
	.add(RareDropTable);

export const Araxxor = new SimpleMonster({
	id: 13668,
	name: 'Araxxor',
	table: AraxxorTable,
	aliases: ['araxxor']
});
