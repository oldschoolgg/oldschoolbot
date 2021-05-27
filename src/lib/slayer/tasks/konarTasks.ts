import { Monsters } from 'oldschooljs';

import { AssignableSlayerTask } from '../types';

export const konarTasks: AssignableSlayerTask[] = [
	{
		name: 'Aberrant spectre',
		amount: [120, 170],
		weight: 6,
		alternatives: ['Deviant Spectre'],
		id: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		combatLevel: 65,
		slayerLevel: 60,
		unlocked: true
	},
	{
		name: 'Abyssal demon',
		amount: [120, 170],
		weight: 9,
		alternatives: ['Abyssal sire'],
		id: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		combatLevel: 85,
		slayerLevel: 85,
		unlocked: true
	},
	{
		name: 'Adamant Dragon',
		amount: [3, 6],
		weight: 5,
		id: [Monsters.AdamantDragon.id],
		questPoints: 205,
		unlocked: true
	},
	{
		name: 'Ankou',
		amount: [50, 50],
		weight: 5,
		id: [Monsters.Ankou.id],
		combatLevel: 40,
		unlocked: true
	},
	{
		name: 'Aviansie',
		amount: [120, 170],
		weight: 6,
		alternatives: ["Kree'arra"],
		id: [Monsters.Aviansie.id, Monsters.Kreearra.id],
		unlocked: false
	},
	{
		name: 'Basilisk',
		amount: [110, 170],
		weight: 5,
		alternatives: ['Basilisk Knight'],
		id: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLevel: 40,
		slayerLevel: 40,
		unlocked: false
	},
	{
		name: 'Black Demon',
		amount: [120, 170],
		weight: 9,
		alternatives: ['Skotizo'],
		id: [Monsters.BlackDemon.id, Monsters.Skotizo.id],
		combatLevel: 80,
		unlocked: true
	},
	{
		name: 'Bloodveld',
		amount: [120, 170],
		weight: 9,
		alternatives: ['Mutated Bloodveld'],
		id: [Monsters.Bloodveld.id, Monsters.MutatedBloodveld.id],
		combatLevel: 50,
		slayerLevel: 50,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Blue Dragon',
		amount: [120, 170],
		weight: 8,
		alternatives: ['Baby Blue Dragon', 'Brutal Blue Dragon'],
		id: [Monsters.BlueDragon.id, Monsters.BabyBlueDragon.id, Monsters.BrutalBlueDragon.id],
		combatLevel: 65,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Brine rat',
		amount: [120, 170],
		weight: 2,
		id: [Monsters.BrineRat.id],
		combatLevel: 45,
		slayerLevel: 47,
		questPoints: 4,
		unlocked: true
	},
	{
		name: 'Bronze Dragon',
		amount: [30, 50],
		weight: 5,
		id: [Monsters.BronzeDragon.id],
		combatLevel: 75,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Cave kraken',
		amount: [80, 100],
		weight: 9,
		alternatives: ['Kraken'],
		id: [Monsters.CaveKraken.id, Monsters.Kraken.id],
		combatLevel: 80,
		slayerLevel: 87,
		unlocked: true
	},
	{
		name: 'Dagannoth',
		amount: [120, 170],
		weight: 8,
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
		amount: [10, 15],
		weight: 5,
		id: [Monsters.DarkBeast.id],
		combatLevel: 90,
		slayerLevel: 90,
		questPoints: 24,
		unlocked: true
	},
	{
		name: 'Drake',
		amount: [75, 138],
		weight: 10,
		id: [Monsters.Drake.id],
		slayerLevel: 84,
		unlocked: true
	},
	{
		name: 'Dust devil',
		amount: [120, 170],

		weight: 6,
		id: [Monsters.DustDevil.id],
		combatLevel: 70,
		slayerLevel: 65,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Fire giant',
		amount: [120, 170],
		weight: 9,
		id: [Monsters.FireGiant.id],
		combatLevel: 65,
		unlocked: true
	},
	{
		name: 'Spitting wyvern',
		amount: [15, 30],

		weight: 9,
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
		amount: [120, 170],

		weight: 6,
		alternatives: ['Grotesque Guardians'],
		id: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLevel: 80,
		slayerLevel: 75,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Greater demon',
		amount: [120, 170],
		weight: 7,
		alternatives: ['Skotizo'],
		id: [Monsters.GreaterDemon.id, Monsters.Skotizo.id],
		combatLevel: 75,
		unlocked: true
	},
	{
		name: 'Hellhound',
		amount: [120, 170],
		weight: 8,
		alternatives: ['Cerberus'],
		id: [Monsters.Hellhound.id, Monsters.Cerberus.id],
		combatLevel: 75,
		unlocked: true
	},
	{
		name: 'Hydra',
		amount: [125, 190],
		weight: 10,
		alternatives: ['Alchemical Hydra'],
		id: [Monsters.Hydra.id, Monsters.AlchemicalHydra.id],
		slayerLevel: 95,
		unlocked: true
	},
	{
		name: 'Iron dragon',
		amount: [30, 50],

		weight: 5,
		id: [Monsters.IronDragon.id],
		combatLevel: 80,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Jelly',
		amount: [120, 170],
		weight: 6,
		alternatives: ['Warped Jelly'],
		id: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLevel: 57,
		slayerLevel: 52,
		unlocked: true
	},
	{
		name: 'Kalphite worker',
		amount: [120, 170],
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
		amount: [120, 170],
		weight: 3,
		id: [Monsters.Kurask.id],
		combatLevel: 65,
		slayerLevel: 70,
		unlocked: true
	},
	{
		name: 'Lizardman',
		amount: [90, 110],
		weight: 8,
		alternatives: ['Lizardman brute', 'Lizardman Shaman'],
		id: [Monsters.Lizardman.id, Monsters.LizardmanBrute.id, Monsters.LizardmanShaman.id],
		unlocked: false
	},
	{
		name: 'Mithril Dragon',
		amount: [3, 6],
		weight: 5,
		id: [Monsters.MithrilDragon.id],
		unlocked: false
	},
	{
		name: 'Zygomite',
		amount: [10, 25],
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
		amount: [110, 110],

		weight: 7,
		alternatives: ['Greater Nechryael'],
		id: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLevel: 85,
		slayerLevel: 80,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Red Dragon',
		amount: [30, 50],
		weight: 5,
		alternatives: ['Baby Red dragon', 'Brutal Red Dragon'],
		id: [Monsters.RedDragon.id, Monsters.BabyRedDragon.id, Monsters.BrutalRedDragon.id],
		questPoints: 34,
		unlocked: false
	},
	{
		name: 'Rune Dragon',
		amount: [3, 6],
		weight: 5,
		id: [Monsters.RuneDragon.id],
		questPoints: 205,
		unlocked: true
	},
	{
		name: 'Skeletal Wyvern',
		amount: [5, 12],
		weight: 5,
		id: [Monsters.SkeletalWyvern.id],
		combatLevel: 70,
		slayerLevel: 72,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Smoke Devil',
		amount: [120, 170],
		weight: 7,
		alternatives: ['Thermonuclear Smoke Devil'],
		id: [Monsters.SmokeDevil.id, Monsters.ThermonuclearSmokeDevil.id],
		combatLevel: 75,
		slayerLevel: 93,
		unlocked: true
	},
	{
		name: 'Mountain troll',
		amount: [120, 170],
		weight: 6,
		alternatives: ['Troll general'],
		id: [Monsters.MountainTroll.id, Monsters.TrollGeneral.id],
		combatLevel: 60,
		unlocked: true
	},
	{
		name: 'Turoth',
		amount: [120, 170],
		weight: 3,
		id: [Monsters.Turoth.id],
		combatLevel: 60,
		slayerLevel: 55,
		unlocked: true
	},
	{
		name: 'Feral Vampyre',
		amount: [100, 160],

		weight: 4,
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
		amount: [120, 170],
		weight: 2,
		id: [Monsters.Waterfiend.id],
		combatLevel: 75,
		unlocked: true
	},
	{
		name: 'Wyrm',
		amount: [125, 190],
		weight: 10,
		id: [Monsters.Wyrm.id],
		slayerLevel: 62,
		unlocked: true
	}
];
