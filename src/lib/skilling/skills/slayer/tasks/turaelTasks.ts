import { Monsters } from 'oldschooljs';
import { Task } from '../../../types';

// Edit all tasks to fit the Task interface and include all IDs of alternatives.
const turaelTasks: Task[] = [
	{
		name: 'Banshee',
		amount: [15, 50],

		requirements: {
			combatLevel: 20,
			slayerLevel: 15
		},
		alternatives: ['Twisted Banshee'],
		weight: 8,
		Id: Monsters.Banshee.id,
		unlocked: true
	},
	{
		name: 'Bat',
		amount: [15, 50],

		requirements: {
			combatLevel: 5
		},
		alternatives: ['Giant bat', 'Deathwing'],
		weight: 7,
		Id: Monsters.Bat.id,
		unlocked: true
	},
	{
		name: 'Bird',
		amount: [15, 50],

		alternatives: [
			'Chicken',
			'Mounted terrorbird',
			'Terrorbird',
			'Rooster',
			'Chompy bird',
			'Seagull',
			'Penguin',
			'Duck',
			'Duckling'
		],
		weight: 6,
		Id: 1,
		unlocked: true
	},
	{
		name: 'Black bear',
		amount: [15, 50],

		requirements: {
			combatLevel: 13
		},
		alternatives: ['Grizzly bear cub', 'Bear cub', 'Grizzly bear', 'Callisto'],
		weight: 7,
		Id: Monsters.Bear.id,
		unlocked: true
	},
	{
		name: 'Cave bug',
		amount: [10, 20],

		requirements: {
			slayerLevel: 7
		},
		weight: 8,
		Id: Monsters.CaveBug.id,
		unlocked: true
	},
	{
		name: 'Cave crawler',
		amount: [15, 50],

		requirements: {
			combatLevel: 10,
			slayerLevel: 10
		},
		weight: 8,
		Id: Monsters.CaveCrawler.id,
		unlocked: true
	},
	{
		name: 'Cave slime',
		amount: [10, 20],

		requirements: {
			combatLevel: 15,
			slayerLevel: 17
		},
		weight: 8,
		Id: Monsters.CaveSlime.id,
		unlocked: true
	},
	{
		name: 'Cow',
		amount: [15, 50],

		requirements: {
			combatLevel: 5
		},
		alternatives: ['Cow calf', 'Undead cow'],
		weight: 8,
		Id: Monsters.Cow.id,
		unlocked: true
	},
	{
		name: 'Crawling hand',
		amount: [15, 50],

		requirements: {
			slayerLevel: 5
		},
		weight: 8,
		Id: Monsters.CrawlingHand.id,
		unlocked: true
	},
	{
		name: 'Guard dog',
		amount: [15, 50],

		requirements: {
			combatLevel: 15
		},
		alternatives: ['Jackal', 'Wild dog', 'Reanimated dog'],
		weight: 7,
		Id: Monsters.GuardDog.id,
		unlocked: true
	},
	{
		name: 'Dwarf',
		amount: [15, 50],

		requirements: {
			combatLevel: 6
		},
		alternatives: ['Black Guard', 'Chaos Dwarf', 'Dwarf gang member'],
		weight: 7,
		Id: Monsters.Dwarf.id,
		unlocked: true
	},
	{
		name: 'Ghost',
		amount: [15, 50],

		requirements: {
			combatLevel: 13
		},
		alternatives: ['Tortured soul'],
		weight: 7,
		Id: Monsters.Ghost.id,
		unlocked: true
	},
	{
		name: 'Goblin',
		amount: [15, 50],

		alternatives: ['Cave goblin guard', 'General Graardor'],
		weight: 7,
		Id: Monsters.Goblin.id,
		unlocked: true
	},
	{
		name: 'Icefiend',
		amount: [15, 50],
		requirements: {
			combatLevel: 20
		},
		weight: 8,
		Id: Monsters.Icefiend.id,
		unlocked: true
	},
	{
		name: 'Kalphite worker',
		amount: [15, 50],

		requirements: {
			combatLevel: 15
		},
		alternatives: ['Kalphite soldier', 'Kalphite guardian', 'Kalphite Queen'],
		weight: 6,
		Id: Monsters.KalphiteWorker.id,
		unlocked: true
	},
	{
		name: 'Lizard',
		amount: [15, 50],

		requirements: {
			slayerLevel: 22
		},
		alternatives: ['Small Lizard', 'Desert Lizard', 'Sulphur Lizard'],
		weight: 8,
		Id: Monsters.Lizard.id,
		unlocked: true
	},
	{
		name: 'Minotaur',
		amount: [10, 20],

		requirements: {
			combatLevel: 7
		},
		weight: 7,
		Id: Monsters.Minotaur.id,
		unlocked: true
	},
	{
		name: 'Monkey',
		amount: [15, 50],

		alternatives: [
			'Karamjan Monkey',
			'Monkey Guard',
			'Monkey Archer',
			'Monkey Zombie',
			'Demonic Gorilla',
			'Tortured Gorilla'
		],
		weight: 6,
		Id: Monsters.Monkey.id,
		unlocked: true
	},
	{
		name: 'Rat',
		amount: [15, 50],
		alternatives: ['Giant rat', 'Dungeon rat', 'Crypt rat', 'Brine rat'],
		weight: 7,
		Id: Monsters.Rat.id,
		unlocked: true
	},
	{
		name: 'Scorpion',
		amount: [15, 50],
		requirements: {
			combatLevel: 7
		},
		alternatives: [
			'King Scorpion',
			'Poison Scorpion',
			'Pit Scorpion',
			'Scorpia',
			'Lobstrosity',
			'Reanimated scorpion'
		],
		weight: 7,
		Id: Monsters.Scorpion.id,
		unlocked: true
	},
	{
		name: 'Skeleton',
		amount: [15, 50],

		requirements: {
			combatLevel: 15
		},
		alternatives: ['Skeleton mage', "Vet'ion", 'Skogre', 'Skeleton fremennik'],
		weight: 7,
		Id: Monsters.Skeleton.id,
		unlocked: true
	},
	{
		name: 'Spider',
		amount: [15, 50],

		alternatives: [
			'Giant spider',
			'Shadow spider',
			'Giant crypt spider',
			'Sarachnis',
			'Temple Spider',
			'Venenatis'
		],
		weight: 6,
		Id: Monsters.Spider.id,
		unlocked: true
	},
	{
		name: 'Wolf',
		amount: [15, 50],

		requirements: {
			combatLevel: 20
		},
		alternatives: ['Big Wolf', 'Desert Wolf', 'Ice wolf', 'Jungle wolf', 'White wolf'],
		weight: 7,
		Id: Monsters.Wolf.id,
		unlocked: true
	},
	{
		name: 'Zombie',
		amount: [15, 50],

		requirements: {
			combatLevel: 10
		},
		alternatives: [
			'Monkey Zombie',
			'Undead chicken',
			'Undead cow',
			'Undead Druid',
			'Undead one',
			'Zombie rat',
			'Zogre',
			'Vorkath'
		],
		weight: 7,
		Id: Monsters.Zombie.id,
		unlocked: true
	}
];

export default turaelTasks;
