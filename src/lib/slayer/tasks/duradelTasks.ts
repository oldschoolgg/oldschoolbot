import { Monsters } from 'oldschooljs';

import { AssignableSlayerTask } from '../types';

export const duradelTasks: AssignableSlayerTask[] = [
	{
		name: 'Aberrant spectre',
		amount: [130, 200],

		weight: 7,
		alternatives: ['Deviant Spectre'],
		id: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		combatLevel: 65,
		slayerLevel: 60,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Abyssal demon',
		amount: [130, 200],

		weight: 12,
		alternatives: ['Abyssal sire'],
		id: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		combatLevel: 85,
		slayerLevel: 85,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Adamant Dragon',
		amount: [4, 9],
		weight: 2,
		id: [Monsters.AdamantDragon.id],
		questPoints: 205,
		unlocked: true
	},
	{
		name: 'Ankou',
		amount: [50, 80],
		weight: 5,
		id: [Monsters.Ankou.id],
		combatLevel: 40,
		unlocked: true
	},
	{
		name: 'Aviansie',
		amount: [120, 200],
		weight: 8,
		alternatives: ["Kree'arra"],
		id: [Monsters.Aviansie.id, Monsters.Kreearra.id],
		unlocked: false
	},
	{
		name: 'Basilisk',
		amount: [130, 200],

		weight: 7,
		alternatives: ['Basilisk Knight'],
		id: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLevel: 40,
		slayerLevel: 40,
		unlocked: false
	},
	{
		// Count balfrug from kril?
		name: 'Black Demon',
		amount: [130, 200],

		weight: 8,
		alternatives: ['Demonic Gorilla', 'Porazdir', 'Skotizo'],
		id: [
			Monsters.BlackDemon.id,
			Monsters.DemonicGorilla.id,
			Monsters.Porazdir.id,
			Monsters.Skotizo.id
		],
		combatLevel: 80,
		unlocked: true
	},
	{
		name: 'Black Dragon',
		amount: [10, 20],
		weight: 9,
		alternatives: ['Baby Black Dragon', 'King Black Dragon', 'Brutal Black Dragon'],
		id: [
			Monsters.BlackDragon.id,
			Monsters.BabyBlackDragon.id,
			Monsters.BrutalBlackDragon.id,
			Monsters.KingBlackDragon.id
		],
		combatLevel: 80,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Bloodveld',
		amount: [130, 200],

		weight: 8,
		alternatives: ['Mutated Bloodveld'],
		id: [Monsters.Bloodveld.id, Monsters.MutatedBloodveld.id],
		combatLevel: 50,
		slayerLevel: 50,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Blue Dragon',
		amount: [110, 170],
		weight: 4,
		alternatives: ['Baby Blue Dragon', 'Brutal Blue Dragon', 'Vorkath'],
		id: [
			Monsters.BlueDragon.id,
			Monsters.BabyBlueDragon.id,
			Monsters.BrutalBlueDragon.id,
			Monsters.Vorkath.id
		],
		combatLevel: 65,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Cave horror',
		amount: [130, 200],

		weight: 4,
		id: [Monsters.CaveHorror.id],
		combatLevel: 85,
		slayerLevel: 58,
		questPoints: 11,
		unlocked: true
	},
	{
		name: 'Cave kraken',
		amount: [100, 120],

		weight: 9,
		alternatives: ['Kraken'],
		id: [Monsters.CaveKraken.id, Monsters.Kraken.id],
		combatLevel: 80,
		slayerLevel: 87,
		unlocked: true
	},
	{
		name: 'Dagannoth',
		amount: [130, 200],
		weight: 9,
		alternatives: [
			'Dagannoth spawn',
			'Dagannoth fledgeling',
			'Dagannoth Supreme',
			'Dagannoth Rex',
			'Dagannoth Prime'
		],
		id: [
			Monsters.Dagannoth.id,
			Monsters.DagannothSpawn.id,
			Monsters.DaganothFledgeling.id,
			Monsters.DagannothSupreme.id,
			Monsters.DagannothRex.id,
			Monsters.DagannothPrime.id
		],
		combatLevel: 75,
		questPoints: 2,
		unlocked: true
	},
	{
		name: 'Dark beast',
		amount: [10, 20],
		weight: 11,
		id: [Monsters.DarkBeast.id],
		combatLevel: 90,
		slayerLevel: 90,
		questPoints: 24,
		unlocked: true
	},
	{
		name: 'Drake',
		amount: [50, 110],
		weight: 8,
		id: [Monsters.Drake.id],
		slayerLevel: 84,
		unlocked: true
	},
	{
		name: 'Dust devil',
		amount: [130, 200],

		weight: 5,
		id: [Monsters.DustDevil.id],
		combatLevel: 70,
		slayerLevel: 65,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Elf warrior',
		amount: [100, 170],
		weight: 4,
		alternatives: ['Iorwerth Archer', 'Elf Archer', 'Iorwerth Warrior', 'Mourner'],
		id: [
			Monsters.ElfWarrior.id,
			Monsters.IorwerthArcher.id,
			Monsters.ElfArcher.id,
			Monsters.IorwerthWarrior.id,
			Monsters.Mourner.id
		],
		combatLevel: 70,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Fire giant',
		amount: [130, 200],
		weight: 7,
		id: [Monsters.FireGiant.id],
		combatLevel: 65,
		unlocked: true
	},
	{
		name: 'Spitting wyvern',
		amount: [20, 60],

		weight: 5,
		alternatives: ['Taloned Wyvern', 'Long-tailed Wyvern', 'Ancient Wyvern'],
		id: [
			Monsters.FossilIslandWyvernAncient.id,
			Monsters.FossilIslandWyvernLongTailed.id,
			Monsters.FossilIslandWyvernSpitting.id,
			Monsters.FossilIslandWyvernTaloned.id
		],
		combatLevel: 60,
		slayerLevel: 66,
		questPoints: 3,
		unlocked: true
	},
	{
		name: 'Gargoyle',
		amount: [130, 200],

		weight: 8,
		alternatives: ['Grotesque Guardians'],
		id: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLevel: 80,
		slayerLevel: 75,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Greater demon',
		amount: [130, 200],
		weight: 9,
		alternatives: ["K'ril Tsutsaroth", 'Skotizo'],
		id: [Monsters.GreaterDemon.id, Monsters.KrilTsutsaroth.id, Monsters.Skotizo.id],
		combatLevel: 70,
		unlocked: true
	},
	{
		name: 'Hellhound',
		amount: [130, 200],
		weight: 10,
		alternatives: ['Cerberus'],
		id: [Monsters.Hellhound.id, Monsters.Cerberus.id],
		combatLevel: 75,
		unlocked: true
	},
	{
		name: 'Iron dragon',
		amount: [40, 60],
		weight: 5,
		id: [Monsters.IronDragon.id],
		combatLevel: 80,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Kalphite worker',
		amount: [130, 200],
		weight: 9,
		alternatives: ['Kalphite soldier', 'Kalphite guardian', 'Kalphite Queen'],
		id: [
			Monsters.KalphiteWorker.id,
			Monsters.KalphiteSoldier.id,
			Monsters.KalphiteGuardian.id,
			Monsters.KalphiteQueen.id
		],
		combatLevel: 15,
		unlocked: true
	},
	{
		name: 'Kurask',
		amount: [130, 200],
		weight: 4,
		id: [Monsters.Kurask.id],
		combatLevel: 65,
		slayerLevel: 70,
		unlocked: true
	},
	{
		name: 'Lizardman',
		amount: [130, 210],
		weight: 10,
		alternatives: ['Lizardman brute', 'Lizardman Shaman'],
		id: [Monsters.Lizardman.id, Monsters.LizardmanBrute.id, Monsters.LizardmanShaman.id],
		unlocked: false
	},
	{
		name: 'Mithril Dragon',
		amount: [5, 10],
		weight: 9,
		id: [Monsters.MithrilDragon.id],
		unlocked: false
	},
	{
		name: 'Zygomite',
		amount: [20, 30],
		weight: 2,
		alternatives: ['Ancient Zygomite'],
		id: [Monsters.Zygomite.id, Monsters.AncientZygomite.id],
		combatLevel: 60,
		slayerLevel: 57,
		questPoints: 3,
		unlocked: true
	},
	{
		name: 'Nechryael',
		amount: [110, 200],

		weight: 9,
		alternatives: ['Greater Nechryael'],
		id: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLevel: 85,
		slayerLevel: 80,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Red Dragon',
		amount: [30, 65],
		weight: 8,
		alternatives: ['Baby Red dragon', 'Brutal Red Dragon'],
		id: [Monsters.RedDragon.id, Monsters.BabyRedDragon.id, Monsters.BrutalRedDragon.id],
		questPoints: 34,
		unlocked: false
	},
	{
		name: 'Rune Dragon',
		amount: [3, 8],
		weight: 2,
		id: [Monsters.RuneDragon.id],
		questPoints: 205,
		unlocked: true
	},
	{
		name: 'Skeletal Wyvern',
		amount: [20, 40],
		weight: 7,
		id: [Monsters.SkeletalWyvern.id],
		combatLevel: 70,
		slayerLevel: 72,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Smoke Devil',
		amount: [130, 200],
		weight: 9,
		alternatives: ['Thermonuclear Smoke Devil'],
		id: [Monsters.SmokeDevil.id, Monsters.ThermonuclearSmokeDevil.id],
		combatLevel: 75,
		slayerLevel: 93,
		unlocked: true
	},
	{
		name: 'Spiritual ranger',
		amount: [130, 200],
		weight: 7,
		alternatives: ['Spiritual warrior', 'Spiritual mage'],
		id: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		combatLevel: 60,
		slayerLevel: 63,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Steel Dragon',
		amount: [10, 20],
		weight: 7,
		id: [Monsters.SteelDragon.id],
		combatLevel: 85,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Suqah',
		amount: [60, 90],
		weight: 8,
		id: [Monsters.Suqah.id],
		combatLevel: 85,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Mountain troll',
		amount: [130, 200],
		weight: 6,
		alternatives: ['Ice troll', 'Troll general', 'Reanimated troll'],
		id: [
			Monsters.MountainTroll.id,
			Monsters.IceTroll.id,
			Monsters.TrollGeneral.id,
			Monsters.ReanimatedTroll.id
		],
		combatLevel: 60,
		unlocked: true
	},
	{
		name: 'TzHaar-Ket',
		amount: [130, 199],
		alternatives: ['TzTok-Jad', 'TzKal-Zuk'],
		weight: 10,
		id: [Monsters.TzHaarKet.id, Monsters.TzTokJad.id],
		unlocked: false
	},
	{
		name: 'Feral Vampyre',
		amount: [100, 210],

		weight: 8,
		alternatives: ['Vampyre Juvinate', 'Vyrewatch', 'Vyrewatch Sentinel'],
		id: [
			Monsters.FeralVampyre.id,
			Monsters.VampyreJuvinate.id,
			Monsters.Vyrewatch.id,
			Monsters.VyrewatchSentinel.id
		],
		combatLevel: 35,
		questPoints: 1,
		unlocked: false
	},
	{
		name: 'Waterfiend',
		amount: [130, 200],
		weight: 2,
		id: [Monsters.Waterfiend.id],
		combatLevel: 75,
		unlocked: true
	},
	{
		name: 'Wyrm',
		amount: [100, 160],
		weight: 8,
		id: [Monsters.Wyrm.id],
		slayerLevel: 62,
		unlocked: true
	}
];
