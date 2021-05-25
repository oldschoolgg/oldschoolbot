import { Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { MysteryBoxes } from '../../../../data/openables';
import setCustomMonster from '../../../../util/setCustomMonster';

const dwarvenArmorTable = new LootTable()
	.add('Dwarven full helm')
	.add('Dwarven platebody')
	.add('Dwarven platelegs')
	.add('Dwarven gloves')
	.add('Dwarven boots');

export const KingGoldemarLootTable = new LootTable()
	.tertiary(20, 'Clue scroll (master)')
	.tertiary(500, dwarvenArmorTable)
	.oneIn(
		20,
		new LootTable()
			.add('Dwarven crate')
			.add('Dwarven ore')
			.add('Royal crown')
			.add('Mystic jewel')
			.add('Dwarven lore')
	)
	.every('Bones')
	.tertiary(25, 'Dwarven ore')
	.add('Beer', [1, 4])
	.add('Kebab', [1, 4])
	.add('Hammer', 1)
	.add('Dwarven helmet', 2)
	.add('Jewellery')
	.add('Dwarven stout(m)', 2)
	.add('Gold ore', [2, 20], 2)
	.add('Coins', [50_000, 1_000_000])
	.add('Skull piece')
	.add('Athelas seed')
	.add('Dwarven rock cake')
	.add('Dwarven stout')
	.tertiary(80, 'Clue scroll (grandmaster)')
	.tertiary(20, MysteryBoxes);

setCustomMonster(696969, 'King Goldemar', KingGoldemarLootTable, Monsters.GeneralGraardor, {
	id: 696969,
	name: 'King Goldemar',
	aliases: ['king goldemar', 'dwarf king', 'goldemar', 'kg']
});

const KingGoldemar = Monsters.find(mon => mon.name === 'King Goldemar')!;

export default KingGoldemar;
