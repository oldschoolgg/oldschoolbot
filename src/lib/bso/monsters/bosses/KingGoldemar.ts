import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { setCustomMonster } from '@/lib/bso/monsters/setCustomMonster.js';
import { MysteryBoxes } from '@/lib/bso/openables/tables.js';

import { LootTable, Monsters } from 'oldschooljs';

const dwarvenArmorTable = new LootTable()
	.add('Dwarven full helm')
	.add('Dwarven platebody')
	.add('Dwarven platelegs')
	.add('Dwarven gloves')
	.add('Dwarven boots');

export const KingGoldemarLootTable = new LootTable()
	.tertiary(20, 'Clue scroll (master)')
	.tertiary(150, dwarvenArmorTable)
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
	.tertiary(15, 'Dwarven ore')
	.add('Beer', [1, 4])
	.add('Kebab', [1, 4])
	.add('Dwarven ore')
	.add('Dwarven helmet', 2)
	.add('Jewellery')
	.add('Dwarven stout(m)', 2)
	.add('Gold ore', [2, 20], 2)
	.add('Coins', [50_000, 1_000_000])
	.add('Skull piece')
	.add('Athelas seed')
	.add('Dwarven rock cake')
	.add('Dwarven stout')
	.tertiary(4, 'Clue scroll (grandmaster)')
	.tertiary(20, MysteryBoxes)
	.tertiary(25, 'Blacksmith crate');

setCustomMonster(EBSOMonster.KING_GOLDEMAR, 'King Goldemar', KingGoldemarLootTable, Monsters.GeneralGraardor, {
	id: EBSOMonster.KING_GOLDEMAR,
	name: 'King Goldemar',
	aliases: ['king goldemar', 'dwarf king', 'goldemar', 'kg']
});

export const KingGoldemar = Monsters.find(mon => {
	if (mon.name.toLowerCase().includes('golde')) {
		console.log(`Found King Goldemar monster as ${mon.name} with ID ${mon.id}`);
	}
	return mon.name === 'King Goldemar';
})!;
if (!KingGoldemar) {
	throw new Error('Could not find King Goldemar monster');
}
