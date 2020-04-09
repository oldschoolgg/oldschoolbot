import { Monsters } from 'oldschooljs';

const nieveTasks = [
	{
		name: 'Aberrant spectre',
		amount: [120, 185],
		extendedAmount: [200, 250],
		requirements: {
			slayerLevel: 60,
			combatLevel: 65
		},
		alternatives: ['Deviant spectres'],
		weight: 6,
		ID: Monsters.AberrantSpectre.id
	},
	{
		name: 'Abyssal demon',
		amount: [120, 185],
		extendedAmount: [200, 250],
		requirements: {
			slayerLevel: 85,
			combatLevel: 85
		},
		alternatives: ['Abyssal sire', 'Greater abyssal demon'],
		weight: 9,
		ID: Monsters.AbyssalDemon.id
	},
	{
		name: 'Adamant dragon',
		amount: [3, 7],
		extendedAmount: [20, 30],
		requirements: {
			questPoints: 35
		},
		alternatives: ['Adamant dragon'],
		weight: 2,
		ID: Monsters.AdamantDragon.id
	},
	{
		name: 'Ankou',
		amount: [50, 90],
		extendedAmount: [90, 150],
		requirements: {
			combatLevel: 40
		},
		alternatives: ['Dark Ankou'],
		weight: 5,
		ID: Monsters.Ankou.id
	},
	{
		name: 'Aviansie',
		amount: [120, 185],
		extendedAmount: [130, 250],
		requirements: {
			unlocked: [10]
		},
		alternatives: [
			"Kree'arra",
			'Flight Kilisa',
			'Flockleader Geerin',
			'Wingman Skree',
			'Reanimated aviansie'
		],
		weight: 6,
		ID: Monsters.Aviansie.id
	},
	{
		name: 'Basilisk',
		amount: [120, 180],
		extendedAmount: [200, 250],
		requirements: {
			slayerLevel: 40,
			unlocked: [25]
		},
		alternatives: ['Basilisk Knight'],
		weight: 6,
		ID: Monsters.Basilisk.id
	},
	{
		name: 'Black demon',
		amount: [120, 185],
		extendedAmount: [200, 250],
		requirements: {
			combatLevel: 80
		},
		alternatives: ['Demonic gorilla', 'Balfrug Kreeyath', 'Porazdir', 'Skotizo'],
		weight: 9,
		ID: Monsters.BlackDemon.id
	},
	{
		name: 'Black dragon',
		amount: [10, 20],
		extendedAmount: [40, 60],
		requirements: {
			combatLevel: 80,
			questPoints: 32
		},
		alternatives: ['Baby black dragon', 'King Black Dragon', 'Brutal black dragon'],
		weight: 6,
		ID: Monsters.BlackDragon.id
	},
	{
		name: 'Bloodveld',
		amount: [120, 185],
		extendedAmount: [200, 250],
		requirements: {
			combatLevel: 50,
			slayerLevel: 50
		},
		alternatives: ['Mutated Bloodveld'],
		weight: 9,
		ID: Monsters.Bloodveld.id
	},
	{
		name: 'Blue Dragon',
		amount: [120, 185],
		extendedAmount: null,
		requirements: {
			combatLevel: 65,
			questPoints: 32
		},
		alternatives: ['Blue dragon', 'Baby blue dragon', 'Brutal blue dragon', 'Vorkath'],
		weight: 4,
		ID: Monsters.BlueDragon.id
	},
	{
		name: 'Boss',
		amount: [3, 20],
		extendedAmount: null,
		requirements: {
			unlocked: [13]
		},
		alternatives: ['Boss'],
		weight: 8,
		ID: Monsters.Vorkath.id
	},
	{
		name: 'Brine rat',
		amount: [120, 185],
		extendedAmount: null,
		requirements: {
			combatLevel: 45,
			slayerLevel: 47,
			questPoints: 5
		},
		alternatives: [],
		weight: 3,
		ID: Monsters.BrineRat.id
	},
	{
		name: 'Cave horror',
		amount: [120, 180],
		extendedAmount: [200, 250],
		requirements: {
			combatLevel: 85,
			slayerLevel: 58,
			questPoints: 15
		},
		alternatives: ['Cave horror'],
		weight: 5,
		ID: Monsters.CaveHorror.id
	},
	{
		name: 'Cave kraken',
		amount: [100, 120],
		extendedAmount: [150, 200],
		requirements: {
			combatLevel: 80,
			slayerLevel: 87,
			magicLevel: 50
		},
		alternatives: 'Kraken',
		weight: 6,
		ID: Monsters.CaveKraken.id
	},
	{
		name: 'Dagannoth',
		amount: [120, 185],
		extendedAmount: null,
		requirements: {
			combatLevel: 75,
			questPoints: 3
		},
		alternatives: ['Dagannoth spawn', 'Dagannoth fledgeling', 'Dagannoth Kings'],
		weight: 8,
		ID: Monsters.Dagannoth.id
	},
	{
		name: 'Dark beast',
		amount: [10, 20],
		extendedAmount: [100, 150],
		requirements: {
			slayerLevel: 90,
			combatLevel: 90,
			questPoints: 24
		},
		alternatives: ['Dark beast'],
		weight: 5,
		ID: Monsters.DarkBeast.id
	},
	{
		name: 'Drake',
		amount: '30-95',
		extendedAmount: null,
		requirements: {
			slayerLevel: 84
		},
		alternatives: ['Drake'],
		weight: 7,
		ID: Monsters.Drake.id
	},
	{
		name: 'Dust devil',
		amount: [120, 185],
		extendedAmount: [200, 250],
		requirements: {
			combatLevel: 70,
			questPoints: 15,
			slayerLevel: 65
		},
		alternatives: ['Dust devil'],
		weight: 6,
		ID: Monsters.DustDevil.id
	},
	{
		name: 'Elf warrior',
		amount: [60, 90],
		extendedAmount: null,
		requirements: {
			combatLevel: 70,
			questPoints: 30
		},
		alternatives: ['Elf warrior', 'mourner', 'Reanimated elf'],
		weight: 4,
		ID: Monsters.ElfWarrior.id
	},
	{
		name: 'Fire giant',
		amount: [120, 185],
		extendedAmount: null,
		requirements: {
			combatLevel: 65
		},
		alternatives: ['Fire giant'],
		weight: 9,
		ID: Monsters.FireGiant.id
	},
	{
		name: 'Spitting wyvern',
		amount: [20, 60],
		extendedAmount: [55, 75],
		requirements: {
			combatLevel: 60,
			slayerLevel: 66,
			questPoints: 10
		},
		alternatives: ['Spitting wyvern', 'taloned wyvern', 'long-tailed wyvern', 'Ancient Wyvern'],
		weight: 5,
		ID: Monsters.FossilIslandWyvernAncient.id
	},
	{
		name: 'Gargoyle',
		amount: [120, 185],
		extendedAmount: [200, 250],
		requirements: {
			combatLevel: 80,
			slayerLevel: 75,
			questPoints: 3
		},
		alternatives: ['Grotesque Guardians'],
		weight: 6,
		ID: Monsters.Gargoyle.id
	},
	{
		name: 'Greater demon',
		amount: [120, 185],
		extendedAmount: [150, 200],
		requirements: {
			combatLevel: 75
		},
		alternatives: ["K'ril Tsutsaroth", 'Tstanon Karlak', 'Skotizo'],
		weight: 7,
		ID: Monsters.GreaterDemon.id
	},
	{
		name: 'Hellhound',
		amount: [120, 185],
		extendedAmount: null,
		requirements: {
			combatLevel: 75
		},
		alternatives: ['Cerberus', 'Skeleton Hellhound', 'Greater Skeleton Hellhound'],
		weight: 8,
		ID: Monsters.Hellhound.id
	},
	{
		name: 'Iron dragon',
		amount: [30, 60],
		extendedAmount: [60, 100],
		requirements: {
			questPoints: 32,
			combatLevel: 80
		},
		alternatives: ['Iron dragon'],
		weight: 5,
		ID: Monsters.IronDragon.id
	},
	{
		name: 'Kalphite worker',
		amount: [120, 185],
		extendedAmount: null,
		requirements: {
			combatLevel: 15
		},
		alternatives: [
			'Kalphite worker',
			'Kalphite soldier',
			'Kalphite guardian',
			'Kalphite Queen'
		],
		weight: 9,
		ID: Monsters.KalphiteWorker.id
	},
	{
		name: 'Kurask',
		amount: [120, 185],
		extendedAmount: null,
		requirements: {
			slayerLevel: 70,
			combatLevel: 65
		},
		alternatives: [],
		weight: 3,
		ID: Monsters.Kurask.id
	},
	{
		name: 'Lizardman brute',
		amount: [90, 120],
		extendedAmount: null,
		requirements: {
			unlocked: [12]
		},
		alternatives: ['Lizardman brute', 'Lizardman shaman'],
		weight: 8,
		ID: Monsters.Lizardman.id
	},
	{
		name: 'Scarab mage',
		amount: [30, 60],
		extendedAmount: [130, 170],
		requirements: {
			combatLevel: 85,
			questPoints: 13
		},
		alternatives: ['Scarab', 'scarab swarm', 'locust rider', 'scarab mage'],
		weight: 4,
		ID: Monsters.ScarabMage.id
	},
	{
		name: 'Mithril dragon',
		amount: [4, 9],
		extendedAmount: [20, 40],
		requirements: {
			unlocked: [9]
		},
		alternatives: ['Mithril dragon'],
		weight: 5,
		ID: Monsters.MithrilDragon.id
	},
	{
		name: 'Zygomite',
		amount: [10, 25],
		extendedAmount: null,
		requirements: {
			combatLevel: 60,
			slayerLevel: 57,
			questPoints: 2
		},
		alternatives: ['Ancient Zygomite'],
		weight: 2,
		ID: Monsters.Zygomite.id
	},
	{
		name: 'Nechryael',
		amount: [110, 170],
		extendedAmount: [200, 250],
		requirements: {
			combatLevel: 85,
			slayerLevel: 80
		},
		alternatives: ['Greater Nechryael'],
		weight: 7,
		ID: Monsters.Nechryael.id
	},
	{
		name: 'Red dragon',
		amount: [30, 80],
		extendedAmount: null,
		requirements: {
			combatLevel: 68,
			questPoints: 32,
			unlocked: [8]
		},
		alternatives: ['Baby red dragon', 'Brutal red dragon'],
		weight: 5,
		ID: Monsters.RedDragon.id
	},
	{
		name: 'Rune dragon',
		amount: [3, 6],
		extendedAmount: [30, 60],
		requirements: {
			questPoints: 205
		},
		alternatives: ['Rune dragon'],
		weight: 2,
		ID: Monsters.RuneDragon.id
	},
	{
		name: 'Skeletal wyvern',
		amount: [5, 15],
		extendedAmount: [50, 70],
		requirements: {
			combatLevel: 70,
			questPoints: 2,
			slayerLevel: 72
		},
		alternatives: ['Skeletal wyvern'],
		weight: 5,
		ID: Monsters.SkeletalWyvern.id
	},
	{
		name: 'Smoke devil',
		amount: [120, 185],
		extendedAmount: null,
		requirements: {
			combatLevel: 85,
			slayerLevel: 93
		},
		alternatives: ['Thermonuclear smoke devil'],
		weight: 7,
		ID: Monsters.SmokeDevil.id
	},
	{
		name: 'Spiritual mage',
		amount: [120, 185],
		extendedAmount: [180, 250],
		requirements: {
			combatLevel: 60,
			questPoints: 2,
			slayerLevel: 63,
			strengthLevel: 60,
			agilityLevel: 60
		},
		alternatives: ['Spiritual mage', 'Spiritual ranger', 'Spiritual warrior'],
		weight: 6,
		ID: Monsters.SpiritualMage.id
	},
	{
		name: 'Steel dragon',
		amount: [30, 60],
		extendedAmount: [40, 60],
		requirements: {
			combatLevel: 85,
			questPoints: 32
		},
		alternatives: ['Steel dragon'],
		weight: 5,
		ID: Monsters.SteelDragon.id
	},
	{
		name: 'Suqah',
		amount: [120, 185],
		extendedAmount: [180, 250],
		requirements: {
			combatLevel: 85,
			questPoints: 20
		},
		alternatives: ['Suqah'],
		weight: 8,
		ID: Monsters.Suqah.id
	},
	{
		name: 'Mountain troll',
		amount: [120, 185],
		extendedAmount: null,
		requirements: {
			combatLevel: 60
		},
		alternatives: ['Mountain troll', 'Ice troll', 'Troll general'],
		weight: 6,
		ID: Monsters.MountainTroll.id
	},
	{
		name: 'Turoth',
		amount: [120, 185],
		extendedAmount: null,
		requirements: {
			slayerLevel: 55,
			combatLevel: 60
		},
		alternatives: ['Turoth'],
		weight: 3,
		ID: Monsters.Turoth.id
	},
	{
		name: 'TzHaar',
		amount: [110, 180],
		extendedAmount: null,
		requirements: {
			unlocked: [11]
		},
		alternatives: ['TzTok-Jad', 'TzKal-Zuk'],
		weight: 10,
		ID: Monsters.Goblin.id
	},
	{
		name: 'Wyrm',
		amount: [80, 145],
		extendedAmount: null,
		requirements: {
			slayerLevel: 62
		},
		alternatives: ['Wyrm'],
		weight: 7,
		ID: Monsters.Wyrm.id
	}
];

export default nieveTasks;
