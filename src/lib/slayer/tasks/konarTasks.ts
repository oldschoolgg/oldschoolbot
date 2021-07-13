import { Monsters } from 'oldschooljs';

import DagannothKings from '../../minions/data/killableMonsters/bosses/groups/DagannothKings';
import { SlayerTaskUnlocksEnum } from '../slayerUnlocks';
import { AssignableSlayerTask } from '../types';
import { bossTasks } from './bossTasks';

export const konarTasks: AssignableSlayerTask[] = [
	{
		monster: Monsters.AberrantSpectre,
		amount: [120, 170],
		weight: 6,
		monsters: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.SmellYaLater,
		combatLevel: 65,
		slayerLevel: 60,
		unlocked: true
	},
	{
		monster: Monsters.AbyssalDemon,
		amount: [120, 170],
		weight: 9,
		monsters: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.AugmentMyAbbies,
		combatLevel: 85,
		slayerLevel: 85,
		unlocked: true
	},
	{
		monster: Monsters.AdamantDragon,
		amount: [3, 6],
		weight: 5,
		monsters: [Monsters.AdamantDragon.id],
		extendedAmount: [20, 30],
		extendedUnlockId: SlayerTaskUnlocksEnum.AdamindSomeMore,
		questPoints: 205,
		unlocked: true
	},
	{
		monster: Monsters.Ankou,
		amount: [50, 50],
		weight: 5,
		monsters: [Monsters.Ankou.id],
		extendedAmount: [90, 150],
		extendedUnlockId: SlayerTaskUnlocksEnum.AnkouVeryMuch,
		combatLevel: 40,
		unlocked: true
	},
	{
		monster: Monsters.Aviansie,
		amount: [120, 170],
		weight: 6,
		monsters: [Monsters.Aviansie.id, Monsters.Kreearra.id],
		extendedAmount: [130, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.BirdsOfAFeather,
		unlocked: false
	},
	{
		monster: Monsters.Basilisk,
		amount: [110, 170],
		weight: 5,
		monsters: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.Basilonger,
		combatLevel: 40,
		slayerLevel: 40,
		unlocked: false
	},
	{
		monster: Monsters.BlackDemon,
		amount: [120, 170],
		weight: 9,
		monsters: [Monsters.BlackDemon.id, Monsters.Skotizo.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.ItsDarkInHere,
		combatLevel: 80,
		unlocked: true
	},
	{
		monster: Monsters.BlackDragon,
		amount: [10, 15],
		weight: 6,
		monsters: [
			Monsters.BlackDragon.id,
			Monsters.BabyBlackDragon.id,
			Monsters.BrutalBlackDragon.id,
			Monsters.KingBlackDragon.id
		],
		extendedAmount: [40, 60],
		extendedUnlockId: SlayerTaskUnlocksEnum.FireAndDarkness,
		slayerLevel: 77,
		combatLevel: 80,
		questPoints: 34,
		unlocked: true
	},
	{
		monster: Monsters.Bloodveld,
		amount: [120, 170],
		weight: 9,
		monsters: [Monsters.Bloodveld.id, Monsters.MutatedBloodveld.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.BleedMeDry,
		combatLevel: 50,
		slayerLevel: 50,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.BlueDragon,
		amount: [120, 170],
		weight: 8,
		monsters: [Monsters.BlueDragon.id, Monsters.BabyBlueDragon.id, Monsters.BrutalBlueDragon.id],
		combatLevel: 65,
		questPoints: 34,
		unlocked: true
	},
	{
		monster: Monsters.BrineRat,
		amount: [120, 170],
		weight: 2,
		monsters: [Monsters.BrineRat.id],
		combatLevel: 45,
		slayerLevel: 47,
		questPoints: 4,
		unlocked: true
	},
	{
		monster: Monsters.BronzeDragon,
		amount: [30, 50],
		weight: 5,
		monsters: [Monsters.BronzeDragon.id],
		extendedAmount: [30, 50],
		extendedUnlockId: SlayerTaskUnlocksEnum.PedalToTheMetals,
		combatLevel: 75,
		questPoints: 34,
		unlocked: true
	},
	{
		monster: Monsters.CaveKraken,
		amount: [80, 100],
		weight: 9,
		monsters: [Monsters.CaveKraken.id, Monsters.Kraken.id],
		extendedAmount: [150, 200],
		extendedUnlockId: SlayerTaskUnlocksEnum.KrackOn,
		combatLevel: 80,
		slayerLevel: 87,
		unlocked: true
	},
	{
		monster: Monsters.Dagannoth,
		amount: [120, 170],
		weight: 8,
		monsters: [
			Monsters.Dagannoth.id,
			Monsters.DagannothSpawn.id,
			Monsters.DaganothFledgeling.id,
			Monsters.DagannothSupreme.id,
			Monsters.DagannothRex.id,
			Monsters.DagannothPrime.id,
			DagannothKings.id
		],
		combatLevel: 75,
		questPoints: 2,
		unlocked: true
	},
	{
		monster: Monsters.DarkBeast,
		amount: [10, 15],
		weight: 5,
		monsters: [Monsters.DarkBeast.id],
		extendedAmount: [100, 150],
		extendedUnlockId: SlayerTaskUnlocksEnum.NeedMoreDarkness,
		combatLevel: 90,
		slayerLevel: 90,
		questPoints: 24,
		unlocked: true
	},
	{
		monster: Monsters.Drake,
		amount: [75, 138],
		weight: 10,
		monsters: [Monsters.Drake.id],
		slayerLevel: 84,
		unlocked: true
	},
	{
		monster: Monsters.DustDevil,
		amount: [120, 170],

		weight: 6,
		monsters: [Monsters.DustDevil.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.ToDustYouShallReturn,
		combatLevel: 70,
		slayerLevel: 65,
		questPoints: 12,
		unlocked: true
	},
	{
		monster: Monsters.FireGiant,
		amount: [120, 170],
		weight: 9,
		monsters: [Monsters.FireGiant.id],
		combatLevel: 65,
		unlocked: true
	},
	{
		monster: Monsters.FossilIslandWyvernSpitting,
		amount: [15, 30],

		weight: 9,
		monsters: [
			Monsters.FossilIslandWyvernAncient.id,
			Monsters.FossilIslandWyvernLongTailed.id,
			Monsters.FossilIslandWyvernSpitting.id,
			Monsters.FossilIslandWyvernTaloned.id
		],
		extendedAmount: [55, 75],
		extendedUnlockId: SlayerTaskUnlocksEnum.WyverNotherTwo,
		combatLevel: 60,
		slayerLevel: 66,
		questPoints: 3,
		unlocked: true
	},
	{
		monster: Monsters.Gargoyle,
		amount: [120, 170],

		weight: 6,
		monsters: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.GetSmashed,
		combatLevel: 80,
		slayerLevel: 75,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.GreaterDemon,
		amount: [120, 170],
		weight: 7,
		monsters: [Monsters.GreaterDemon.id, Monsters.Skotizo.id],
		extendedAmount: [150, 223],
		extendedUnlockId: SlayerTaskUnlocksEnum.GreaterChallenge,
		combatLevel: 75,
		unlocked: true
	},
	{
		monster: Monsters.Hellhound,
		amount: [120, 170],
		weight: 8,
		monsters: [Monsters.Hellhound.id, Monsters.Cerberus.id],
		combatLevel: 75,
		unlocked: true
	},
	{
		monster: Monsters.Hydra,
		amount: [125, 190],
		weight: 10,
		monsters: [Monsters.Hydra.id, Monsters.AlchemicalHydra.id],
		slayerLevel: 95,
		unlocked: true
	},
	{
		monster: Monsters.IronDragon,
		amount: [30, 50],

		weight: 5,
		monsters: [Monsters.IronDragon.id],
		extendedAmount: [60, 100],
		extendedUnlockId: SlayerTaskUnlocksEnum.PedalToTheMetals,
		combatLevel: 80,
		questPoints: 34,
		unlocked: true
	},
	{
		monster: Monsters.Jelly,
		amount: [120, 170],
		weight: 6,
		monsters: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLevel: 57,
		slayerLevel: 52,
		unlocked: true
	},
	{
		monster: Monsters.KalphiteWorker,
		amount: [120, 170],
		weight: 9,
		monsters: [
			Monsters.KalphiteWorker.id,
			Monsters.KalphiteSoldier.id,
			Monsters.KalphiteGuardian.id,
			Monsters.KalphiteQueen.id
		],
		combatLevel: 15,
		unlocked: true
	},
	{
		monster: Monsters.Kurask,
		amount: [120, 170],
		weight: 3,
		monsters: [Monsters.Kurask.id],
		combatLevel: 65,
		slayerLevel: 70,
		unlocked: true
	},
	{
		monster: Monsters.Lizardman,
		amount: [90, 110],
		weight: 8,
		monsters: [Monsters.Lizardman.id, Monsters.LizardmanBrute.id, Monsters.LizardmanShaman.id],
		unlocked: false
	},
	{
		monster: Monsters.MithrilDragon,
		amount: [3, 6],
		weight: 5,
		monsters: [Monsters.MithrilDragon.id],
		extendedAmount: [20, 40],
		extendedUnlockId: SlayerTaskUnlocksEnum.IReallyMithYou,
		unlocked: false
	},
	{
		monster: Monsters.Zygomite,
		amount: [10, 25],
		weight: 2,
		monsters: [Monsters.Zygomite.id, Monsters.AncientZygomite.id],
		combatLevel: 60,
		slayerLevel: 57,
		questPoints: 3,
		unlocked: true
	},
	{
		monster: Monsters.Nechryael,
		amount: [110, 110],

		weight: 7,
		monsters: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.NechsPlease,
		combatLevel: 85,
		slayerLevel: 80,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.RedDragon,
		amount: [30, 50],
		weight: 5,
		monsters: [Monsters.RedDragon.id, Monsters.BabyRedDragon.id, Monsters.BrutalRedDragon.id],
		questPoints: 34,
		unlocked: false
	},
	{
		monster: Monsters.RuneDragon,
		amount: [3, 6],
		weight: 5,
		monsters: [Monsters.RuneDragon.id],
		extendedAmount: [30, 60],
		extendedUnlockId: SlayerTaskUnlocksEnum.RUUUUUNE,
		questPoints: 205,
		unlocked: true
	},
	{
		monster: Monsters.SkeletalWyvern,
		amount: [5, 12],
		weight: 5,
		monsters: [Monsters.SkeletalWyvern.id],
		extendedAmount: [50, 70],
		extendedUnlockId: SlayerTaskUnlocksEnum.WyverNotherOne,
		combatLevel: 70,
		slayerLevel: 72,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.SmokeDevil,
		amount: [120, 170],
		weight: 7,
		monsters: [Monsters.SmokeDevil.id, Monsters.ThermonuclearSmokeDevil.id],
		combatLevel: 75,
		slayerLevel: 93,
		unlocked: true
	},
	{
		monster: Monsters.SteelDragon,
		amount: [30, 50],
		weight: 7,
		monsters: [Monsters.SteelDragon.id],
		extendedAmount: [40, 60],
		extendedUnlockId: SlayerTaskUnlocksEnum.PedalToTheMetals,
		combatLevel: 85,
		questPoints: 34,
		unlocked: true
	},
	{
		monster: Monsters.MountainTroll,
		amount: [120, 170],
		weight: 6,
		monsters: [Monsters.MountainTroll.id, Monsters.TrollGeneral.id],
		combatLevel: 60,
		unlocked: true
	},
	{
		monster: Monsters.Turoth,
		amount: [120, 170],
		weight: 3,
		monsters: [Monsters.Turoth.id],
		combatLevel: 60,
		slayerLevel: 55,
		unlocked: true
	},
	{
		monster: Monsters.FeralVampyre,
		amount: [100, 160],

		weight: 4,
		monsters: [
			Monsters.FeralVampyre.id,
			Monsters.VampyreJuvinate.id,
			Monsters.Vyrewatch.id,
			Monsters.VyrewatchSentinel.id
		],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.MoreAtStake,
		combatLevel: 35,
		questPoints: 1,
		unlocked: false
	},
	{
		monster: Monsters.Waterfiend,
		amount: [120, 170],
		weight: 2,
		monsters: [Monsters.Waterfiend.id],
		combatLevel: 75,
		unlocked: true
	},
	{
		monster: Monsters.Wyrm,
		amount: [125, 190],
		weight: 10,
		monsters: [Monsters.Wyrm.id],
		slayerLevel: 62,
		unlocked: true
	},
	...bossTasks
];
