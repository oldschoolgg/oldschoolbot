import { Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { runeAlchablesTable } from '../../../../simulation/sharedTables';
import resolveItems from '../../../../util/resolveItems';
import setCustomMonster from '../../../../util/setCustomMonster';

const barTable = new LootTable()
	.add('Bronze bar', 800)
	.add('Iron bar', 700)
	.add('Steel bar', 600)
	.add('Silver bar', 500)
	.add('Gold bar', 400)
	.add('Mithril bar', 300)
	.add('Adamantite bar', 200)
	.add('Runite bar', 100);

const gemTable = new LootTable()
	.add('Uncut sapphire', 50)
	.add('Uncut opal', 70)
	.add('Uncut jade', 60)
	.add('Uncut emerald', 40)
	.add('Uncut ruby', 35)
	.add('Uncut diamond', 25)
	.add('Uncut dragonstone', 15)
	.add('Uncut onyx', 2)
	.add('Uncut zenyte', 1);

export const IgnecarusLootTable = new LootTable()
	.every('Dragon bones')
	.tertiary(200, 'Ignecarus dragonclaw')
	.tertiary(1, 'Ignecarus scales', [3, 9])
	.tertiary(500, 'Dragon egg')
	.tertiary(10, 'Clue scroll (grandmaster)')
	.tertiary(250, 'Ignis ring')
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
