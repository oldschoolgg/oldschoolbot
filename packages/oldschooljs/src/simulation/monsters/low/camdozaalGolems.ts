import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';

const FlawedGolem = new SimpleMonster({
	id: 10_695,
	name: 'Flawed Golem',
	table: new LootTable()
		.add('Rune essence', [1, 3], 12)
		.add('Rune essence', [2, 4], 9)
		.add('Clay', 1, 8)
		.add('Tin ore', [1, 2], 6)
		.add('Copper ore', [1, 2], 6)
		.add('Clay', 2, 5)
		.add('Clay', 3, 3)
		.add('Uncut sapphire', 1, 2)
		.add('Uncut emerald', 1, 1)
		.tertiary(16, 'Barronite shards', [6, 12])
		.tertiary(200, 'Clue scroll (beginner)')
		.tertiary(800, 'Barronite guard'),
	aliases: ['flawed golem']
});

const MindGolem = new SimpleMonster({
	id: 10_693,
	name: 'Mind Golem',
	table: new LootTable()
		.add('Mind rune', [5, 10], 8)
		.add('Clay', [2, 3], 6)
		.add('Copper ore', [2, 3], 6)
		.add('Tin ore', [2, 3], 6)
		.add('Iron ore', [1, 2], 6)
		.add('Rune essence', [3, 5], 6)
		.add('Mind rune', 1, 6)
		.add('Uncut sapphire', 1, 4)
		.add('Uncut emerald', 1, 2)
		.add('Rune essence', 1, 1)
		.add('Uncut ruby', 1, 1)
		.tertiary(7.5, 'Barronite shards', [8, 16])
		.tertiary(7.5, 'Mind core')
		.tertiary(100, 'Clue scroll (beginner)')
		.tertiary(500, 'Barronite guard'),
	aliases: ['mind golem']
});

const BodyGolem = new SimpleMonster({
	id: 10_691,
	name: 'Body Golem',
	table: new LootTable()
		.add('Body rune', [5, 10], 8)
		.add('Clay', [3, 4], 6)
		.add('Copper ore', [3, 4], 6)
		.add('Tin ore', [3, 4], 6)
		.add('Iron ore', [3, 4], 6)
		.add('Rune essence', [4, 6], 6)
		.add('Body rune', 1, 6)
		.add('Uncut sapphire', 1, 4)
		.add('Uncut emerald', 1, 2)
		.add('Rune essence', 1, 1)
		.add('Uncut ruby', 1, 1)
		.tertiary(5, 'Barronite shards', [10, 20])
		.tertiary(7.5, 'Body core')
		.tertiary(62, 'Clue scroll (beginner)')
		.tertiary(250, 'Barronite guard'),
	aliases: ['body golem']
});

const ChaosGolem = new SimpleMonster({
	id: 10_689,
	name: 'Chaos Golem',
	table: new LootTable()
		.add('Chaos rune', [5, 10], 8)
		.add('Clay', [3, 4], 6)
		.add('Tin ore', [3, 4], 6)
		.add('Iron ore', [3, 4], 6)
		.add('Gold ore', [2, 3], 6)
		.add('Rune essence', [4, 6], 6)
		.add('Uncut sapphire', 1, 6)
		.add('Uncut emerald', 1, 4)
		.add('Uncut ruby', 1, 2)
		.add('Uncut diamond', 1, 1)
		.add('Chaos talisman', 1, 1)
		.tertiary(3.5, 'Barronite shards', [12, 24])
		.tertiary(7.5, 'Chaos core')
		.tertiary(100, 'Clue scroll (beginner)')
		.tertiary(150, 'Barronite guard'),
	aliases: ['chaos golem']
});

export const CamdozaalGolems = { FlawedGolem, MindGolem, BodyGolem, ChaosGolem };
