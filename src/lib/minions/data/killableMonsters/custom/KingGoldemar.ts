import { Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { MysteryBoxes } from '../../../../data/openables';
import setCustomMonster from '../../../../util/setCustomMonster';

export const KingGoldemarLootTable = new LootTable()
	.tertiary(2900, 'Broken dwarven warhammer')
	.tertiary(20, 'Clue scroll (master)')
	.oneIn(
		80,
		new LootTable()
			.add('Dwarven crate')
			.add('Dwarven ore')
			.add('Coal', [2, 14], 2)
			.add('Iron ore', [2, 14], 2)
			.add('Royal crown', 2)
			.add('Mystic jewel', 2)
			.add('Dwarven lore', 2)
			.add('Golden goblin', 2)
			.add('Gold candlesticks', 2)
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
	.add('Gold ring', 2)
	.add('Dwarven helmet', 2)
	.add('Jewellery')
	.add('Dwarven stout(m)', 2)
	.add('Gold ore', [2, 20], 2)
	.add('Coins', [50_000, 1_000_000])
	.add('Skull piece')
	.add('Dwarven rock cake')
	.add('Dwarven stout')
	.tertiary(80, 'Clue scroll (grandmaster)')
	.tertiary(20, MysteryBoxes);

setCustomMonster(696969, 'King Goldemar', KingGoldemarLootTable, Monsters.GeneralGraardor, {
	id: 696969,
	name: 'King Goldemar',
	aliases: ['king goldemar', 'dwarf king', 'goldemar']
});

const KingGoldemar = Monsters.find(mon => mon.name === 'King Goldemar')!;

export default KingGoldemar;
