/*
import { Monsters } from 'oldschooljs';
import { SlayerTask } from '../../../types';

//Brimstone keys?
const konarTasks: SlayerTask[] = [
	{
		name: 'Aberrant spectre',
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 6,
		alternatives: ['Deviant Spectre'],
		Id: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		combatLvl: 65,
		slayerLvl: 60,
		unlocked: true
	},
	{
		name: 'Abyssal demon',
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 9,
		alternatives: ['Abyssal sire', 'Greater abyssal demon'],
		Id: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id, Monsters.GreaterAbyssalDemon.id],
		combatLvl: 85,
		slayerLvl: 85,
		unlocked: true
	},
	{
		name: 'Adamant Dragon',
		amount: [3, 6],
		extendedAmount: [20, 30],
		weight: 5,
		Id: [Monsters.AdamantDragon.id],
		questPoints: 205,
		unlocked: true
	},
	{
		name: 'Ankou',
		amount: [50, 50],
		extendedAmount: [90, 150],
		weight: 5,
		Id: [Monsters.Ankou.id],
		combatLvl: 40,
		unlocked: true
	},
	{
		// Count Kreeerra guards?
		name: 'Aviansie',
		amount: [120, 170],
		extendedAmount: [130, 250],
		weight: 6,
		alternatives: ["Kree'arra"],
		Id: [Monsters.Aviansie.id, Monsters.Kreearra.id],
		agiStrLvl: 60,
		unlocked: false
	},
	{
		name: 'Basilisk',
		amount: [110, 170],
		extendedAmount: [200, 250],
		weight: 5,
		alternatives: ['Basilisk Knight'],
		Id: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLvl: 40,
		slayerLvl: 40,
		defenceLvl: 20,
		unlocked: false
	},
	{
		name: 'Black Demon',
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 9,
		alternatives: ['Skotizo'],
		Id: [Monsters.BlackDemon.id, Monsters.Skotizo.id],
		combatLvl: 80,
		unlocked: true
	},
	{
		name: 'Bloodveld',
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 9,
		alternatives: ['Mutated Bloodveld'],
		Id: [Monsters.Bloodveld.id, Monsters.MutatedBloodveld.id],
		combatLvl: 50,
		slayerLvl: 50,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Blue Dragon',
		amount: [120, 170],
		weight: 8,
		alternatives: ['Baby Blue Dragon', 'Brutal Blue Dragon'],
		Id: [Monsters.BlueDragon.id, Monsters.BabyBlueDragon.id, Monsters.BrutalBlueDragon.id],
		combatLvl: 65,
		questPoints: 34,
		unlocked: true
	},
	{
		// All the bosses in "Like a boss", seperate file.
		name: 'Boss',
		amount: [],
		alternatives: ['boss'],
		weight: 8,
		Id: [],
		unlocked: false
	},
	{
		name: 'Brine rat',
		amount: [120, 170],
		weight: 2,
		Id: [Monsters.BrineRat.id],
		combatLvl: 45,
		slayerLvl: 47,
		questPoints: 4,
		unlocked: true
	},
	{
		name: 'Bronze Dragon',
		amount: [30, 50],
		extendedAmount: [30, 50],
		weight: 5,
		Id: [Monsters.BronzeDragon.id],
		combatLvl: 75,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Cave kraken',
		amount: [80, 100],
		extendedAmount: [150, 200],
		weight: 9,
		alternatives: ['Kraken'],
		Id: [Monsters.CaveKraken.id, Monsters.Kraken.id],
		combatLvl: 80,
		slayerLvl: 87,
		magicLvl: 50,
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
		Id: [
			Monsters.Dagannoth.id,
			Monsters.DagannothSpawn.id,
			Monsters.DagannothFledgeling.id,
			Monsters.DagannothSupreme.id,
			Monsters.DagannothRex.id,
			Monsters.DagannothPrime.id
		],
		combatLvl: 75,
		questPoints: 2,
		unlocked: true
	},
	{
		name: 'Dark beast',
		amount: [10, 15],
		extendedAmount: [100, 150],
		weight: 5,
		Id: [Monsters.DarkBeast.id],
		combatLvl: 90,
		slayerLvl: 90,
		questPoints: 24,
		unlocked: true
	},
	{
		name: 'Drake',
		amount: [75, 138],
		weight: 10,
		Id: [Monsters.Drake.id],
		combatLvl: 84,
		unlocked: true
	},
	{
		name: 'Dust devil',
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 6,
		Id: [Monsters.DustDevil.id],
		combatLvl: 70,
		slayerLvl: 65,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Fire giant',
		amount: [120, 170],
		weight: 9,
		Id: [Monsters.FireGiant.id],
		combatLvl: 65,
		unlocked: true
	},
	{
		// Check Monsters.FossilIslandWyvernAncient.id, seperate wyverns?.
		name: 'Spitting wyvern',
		amount: [15, 30],
		extendedAmount: [55, 75],
		weight: 9,
		alternatives: ['Taloned Wyvern', 'Long-tailed Wyvern', 'Ancient Wyvern'],
		Id: [
			Monsters.SpittingWyvern.id,
			Monsters.TalonedWyvern.id,
			Monsters.LongTailedWyvern.id,
			Monsters.AncientWyvern.id
		],
		combatLvl: 60,
		slayerLvl: 66,
		questPoints: 3,
		unlocked: true
	},
	{
		// Grotesque Guardians not added to monsters.
		name: 'Gargoyle',
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 6,
		alternatives: ['Grotesque Guardians'],
		Id: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLvl: 80,
		slayerLvl: 75,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Greater demon',
		amount: [120, 170],
		extendedAmount: [150, 223],
		weight: 7,
		alternatives: ['Skotizo'],
		Id: [Monsters.GreaterDemon.id, Monsters.Skotizo.id],
		combatLvl: 75,
		unlocked: true
	},
	{
		name: 'Hellhound',
		amount: [120, 170],
		weight: 8,
		alternatives: ['Cerberus'],
		Id: [Monsters.Hellhound.id, Monsters.Cerberus.id],
		combatLvl: 75,
		unlocked: true
	},
	{
		name: 'Hydra',
		amount: [125, 190],
		weight: 10,
		alternatives: ['Alchemical Hydra'],
		Id: [Monsters.Hydra.id, Monsters.AlchemicalHydra.id],
		slayerLvl: 95,
		unlocked: true
	},
	{
		name: 'Iron dragon',
		amount: [30, 50],
		extendedAmount: [60, 100],
		weight: 5,
		Id: [Monsters.IronDragon.id],
		combatLvl: 80,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Jelly',
		amount: [120, 170],
		weight: 6,
		alternatives: ['Warped Jelly'],
		Id: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLvl: 57,
		slayerLvl: 52,
		unlocked: true
	},
	{
		name: 'Kalphite worker',
		amount: [120, 170],
		weight: 9,
		alternatives: ['Kalphite soldier', 'Kalphite guardian', 'Kalphite Queen'],
		Id: [
			Monsters.KalphiteWorker.id,
			Monsters.KalphiteSolider.id,
			Monsters.KalphiteGuardian.id,
			Monsters.KalphiteQueen.id
		],
		combatLvl: 15,
		unlocked: true
	},
	{
		name: 'Kurask',
		amount: [120, 170],
		weight: 3,
		Id: [Monsters.Kurask.id],
		combatLvl: 65,
		slayerLvl: 70,
		unlocked: true
	},
	{
		name: 'Lizardman',
		amount: [90, 110],
		weight: 8,
		alternatives: ['Lizardman brute', 'Lizardman Shaman'],
		Id: [Monsters.Lizardman.id, Monsters.LizardmanBrute.id, Monsters.LizardmanShaman],
		unlocked: false
	},
	{
		name: 'Mithril Dragon',
		amount: [3, 6],
		extendedAmount: [20, 40],
		weight: 5,
		Id: [Monsters.MithrilDragon.id],
		unlocked: false
	},
	{
		name: 'Zygomite',
		amount: [10, 25],
		weight: 2,
		alternatives: ['Ancient Zygomite'],
		Id: [Monsters.Zygomite.id, Monsters.AncientZygomite.id],
		combatLvl: 60,
		slayerLvl: 57,
		questPoints: 3,
		unlocked: true
	},
	{
		name: 'Nechryael',
		amount: [110, 110],
		extendedAmount: [200, 250],
		weight: 7,
		alternatives: ['Greater Nechryael'],
		Id: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLvl: 85,
		slayerLvl: 80,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Red Dragon',
		amount: [30, 50],
		weight: 5,
		alternatives: ['Baby Red dragon', 'Brutal Red Dragon'],
		Id: [Monsters.RedDragon.id, Monsters.BabyRedDragon.id, Monsters.BruteRedDragon.id],
		questPoints: 34,
		unlocked: false
	},
	{
		name: 'Rune Dragon',
		amount: [3, 6],
		extendedAmount: [30, 60],
		weight: 5,
		Id: [Monsters.RuneDragon.id],
		questPoints: 205,
		unlocked: true
	},
	{
		name: 'Skeletal Wyvern',
		amount: [5, 12],
		extendedAmount: [50, 70],
		weight: 5,
		Id: [Monsters.SkeletalWyvern.id],
		combatLvl: 70,
		slayerLvl: 72,
		questPoints: 1,
		unlocked: true
	},
	{
		// Thermonuclear Smoke devil not added to monsters.
		name: 'Smoke Devil',
		amount: [120, 170],
		weight: 7,
		alternatives: ['Thermonuclear Smoke Devil'],
		Id: [Monsters.SmokeDevil.id, Monsters.ThermonuclearSmokeDevil.id],
		combatLvl: 75,
		slayerLvl: 93,
		unlocked: true
	},
	{
		name: 'Mountain troll',
		amount: [120, 170],
		weight: 6,
		alternatives: ['Troll general'],
		Id: [
			Monsters.MountainTroll.id,
			Monsters.TrollGeneral.id,
		],
		combatLvl: 60,
		unlocked: true
	},
	{
		name: 'Turoth',
		amount: [120, 170],
		weight: 3,
		Id: [Monsters.Turoth.id],
		combatLvl: 60,
		slayerLvl: 55,
		unlocked: true
	},
	{
		name: 'Feral Vampyre',
		amount: [100, 160],
		extendedAmount: [200, 250],
		weight: 4,
		alternatives: ['Vampyre Juvinate', 'Vyrewatch', 'Vyrewatch Sentinel'],
		Id: [
			Monsters.FeralVampyre.id,
			Monsters.VampyreJuvinate.id,
			Monsters.Vyrewatch.id,
			Monsters.VyrewatchSentinel.id
		],
		combatLvl: 35,
		questPoints: 1,
		unlocked: false
	},
	{
		name: 'Waterfiend',
		amount: [120, 170],
		weight: 2,
		Id: [Monsters.Waterfiend.id],
		combatLvl: 75,
		unlocked: true
	},
	{
		name: 'Wyrm',
		amount: [125, 190],
		weight: 10,
		Id: [Monsters.Wyrm.id],
		slayerLvl: 62,
		unlocked: true
	}
];

export default konarTasks;
*/
