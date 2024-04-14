import { Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { runeAlchablesTable } from '../../../../../simulation/sharedTables';
import resolveItems from '../../../../../util/resolveItems';
import setCustomMonster from '../../../../../util/setCustomMonster';

const barTable = new LootTable()
	.add('Steel bar', 500, 2)
	.add('Silver bar', 400, 3)
	.add('Gold bar', 300, 4)
	.add('Mithril bar', 200, 2)
	.add('Adamantite bar', 100)
	.add('Runite bar', 50);

const gemTable = new LootTable()
	.add('Uncut sapphire', 50, 2)
	.add('Uncut opal', 70, 2)
	.add('Uncut jade', 60, 2)
	.add('Uncut emerald', 40, 2)
	.add('Uncut ruby', 35)
	.add('Uncut diamond', 25)
	.add('Uncut dragonstone', 15)
	.add('Uncut onyx', 2)
	.add('Uncut zenyte', 1);

export const IgnecarusLootTable = new LootTable()
	.every('Dragon bones')
	.tertiary(200, 'Ignecarus dragonclaw')
	.tertiary(1, 'Ignecarus scales', [3, 12])
	.tertiary(500, 'Dragon egg')
	.tertiary(13, 'Clue scroll (grandmaster)')
	.tertiary(300, 'Ignis ring')
	.add(barTable, 5)
	.add(runeAlchablesTable, 5)
	.add(gemTable, 5);

export const IgnecarusNotifyDrops = resolveItems(['Ignis ring', 'Ignecarus dragonclaw', 'Dragon egg']);

setCustomMonster(69_420, 'Ignecarus', IgnecarusLootTable, Monsters.GeneralGraardor, {
	id: 69_420,
	name: 'Ignecarus',
	aliases: ['ig', 'igne', 'ignecarus']
});

export const Ignecarus = Monsters.find(mon => mon.name === 'Ignecarus')!;
