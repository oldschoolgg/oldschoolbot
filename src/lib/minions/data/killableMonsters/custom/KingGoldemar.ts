import { Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import setCustomMonster from '../../../../util/setCustomMonster';

export const KingGoldemarLootTable = new LootTable()
	.tertiary(2300, 'Dwarven warhammer')
	.tertiary(20, 'Clue scroll (master)')
	.oneIn(
		30,
		new LootTable()
			.add('Dwarven crate')
			.add('Dwarven ore')
			.add('Coal', [2, 14])
			.add('Iron ore', [2, 14])
			.add('Royal crown')
			.add('Mystic jewel')
			.add('Dwarven lore')
			.add('Golden goblin')
			.add('Gold candlesticks')
	)
	.every('Bones')
	.add('Beer', [1, 4])
	.add('Kebab', [1, 4])
	.add('Hammer', 1)
	.add('Oily cloth')
	.add('Axe head')
	.add('Pickaxe handle')
	.add('Hair')
	.add('Gold bar')
	.add('Gold ring')
	.add('Dwarven helmet')
	.add('Jewellery')
	.add('Dwarven stout(m)')
	.add('Gold ore', [2, 20])
	.add('Coins', [50_000, 1_000_000])
	.add('Skull piece')
	.add('Dwarven rock cake')
	.add('Dwarven stout');

setCustomMonster(696969, 'King Goldemar', KingGoldemarLootTable, Monsters.GeneralGraardor, {
	id: 696969,
	name: 'King Goldemar',
	aliases: ['king goldemar', 'dwarf king', 'goldemar']
});

const KingGoldemar = Monsters.find(mon => mon.name === 'King Goldemar')!;

export default KingGoldemar;
