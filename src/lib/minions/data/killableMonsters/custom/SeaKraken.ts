import { Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import setCustomMonster from '../../../../util/setCustomMonster';

export const FishTable = new LootTable()
	.add('Raw sea turtle', [1, 10])
	.add('Raw dark crab', [1, 10])
	.add('Raw anglerfish', [1, 20])
	.add('Raw shark', [1, 30])
	.add('Raw monkfish', [1, 40])
	.add('Raw karambwan', [1, 40])
	.add('Raw swordfish', [1, 50])
	.add('Raw bass', [1, 60])
	.add('Raw lobster', [1, 70])
	.add('Raw trout', [1, 80])
	.add('Raw tuna', [1, 90]);

export const KrakenTable = new LootTable()
	.every(FishTable, [5, 12])
	.tertiary(3, FishTable, 5)
	.add('Coins', [50_000, 1_000_000])
	.add('Clue scroll (master)', 4)
	.add('Clue scroll (elite)')
	.add('Clue scroll (hard)')
	.add('Pirate boots')
	.add('Harpoon')
	.add('Kraken tentacle')
	.add('Crystal key')
	.add('Seaweed')
	.add('Manta ray', [50, 100])
	.add('Water rune', [20, 500])
	.tertiary(400, 'Fish sack')
	.tertiary(1200, 'Pufferfish')
	.tertiary(100_000, 'Fishing trophy')
	.tertiary(50, 'Clue scroll (grandmaster)');

setCustomMonster(53466534, 'Sea Kraken', KrakenTable, Monsters.CommanderZilyana, {
	id: 53466534,
	name: 'Sea Kraken',
	aliases: ['sea kraken']
});

const SeaKraken = Monsters.find(mon => mon.name === 'Sea Kraken')!;

export default SeaKraken;
