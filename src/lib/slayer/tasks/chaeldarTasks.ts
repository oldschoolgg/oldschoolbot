import { Monsters } from 'oldschooljs';

import { SlayerTaskUnlocksEnum } from '../slayerUnlocks';
import type { AssignableSlayerTask } from '../types';
import { bossTasks } from './bossTasks';

export const chaeldarTasks: AssignableSlayerTask[] = [
	{
		monster: Monsters.AberrantSpectre,
		amount: [70, 130],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.SmellYaLater,
		weight: 8,
		monsters: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		combatLevel: 65,
		slayerLevel: 60,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.AbyssalDemon,
		amount: [70, 130],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.AugmentMyAbbies,
		weight: 12,
		monsters: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		combatLevel: 85,
		slayerLevel: 85,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Aviansie,
		amount: [70, 130],
		extendedAmount: [130, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.BirdsOfAFeather,
		weight: 9,
		monsters: [Monsters.Aviansie.id, Monsters.Kreearra.id],
		unlocked: false
	},
	{
		monster: Monsters.Basilisk,
		amount: [70, 130],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.Basilonger,
		weight: 7,
		monsters: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLevel: 40,
		slayerLevel: 40,
		unlocked: true
	},
	{
		monster: Monsters.BlackDemon,
		amount: [70, 130],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.ItsDarkInHere,
		weight: 10,
		monsters: [Monsters.BlackDemon.id, Monsters.DemonicGorilla.id, Monsters.Skotizo.id],
		combatLevel: 80,
		unlocked: true
	},
	{
		monster: Monsters.Bloodveld,
		amount: [70, 130],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.BleedMeDry,
		weight: 8,
		monsters: [Monsters.Bloodveld.id, Monsters.MutatedBloodveld.id],
		combatLevel: 50,
		slayerLevel: 50,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.BlueDragon,
		amount: [70, 130],
		weight: 8,
		monsters: [
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
		monster: Monsters.BrineRat,
		amount: [70, 130],
		weight: 7,
		monsters: [Monsters.BrineRat.id],
		combatLevel: 45,
		slayerLevel: 47,
		questPoints: 4,
		unlocked: true
	},
	{
		monster: Monsters.CaveHorror,
		amount: [70, 130],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.Horrorific,
		weight: 10,
		monsters: [Monsters.CaveHorror.id],
		combatLevel: 85,
		slayerLevel: 58,
		questPoints: 11,
		unlocked: true
	},
	{
		monster: Monsters.CaveKraken,
		amount: [30, 50],
		extendedAmount: [150, 200],
		extendedUnlockId: SlayerTaskUnlocksEnum.KrackOn,
		weight: 12,
		monsters: [Monsters.CaveKraken.id, Monsters.Kraken.id],
		combatLevel: 80,
		slayerLevel: 87,
		unlocked: true
	},
	{
		monster: Monsters.Dagannoth,
		amount: [70, 130],
		weight: 11,
		monsters: [
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
		monster: Monsters.DustDevil,
		amount: [70, 130],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.ToDustYouShallReturn,
		weight: 9,
		monsters: [Monsters.DustDevil.id],
		combatLevel: 70,
		slayerLevel: 65,
		questPoints: 12,
		unlocked: true
	},
	{
		monster: Monsters.ElfWarrior,
		amount: [70, 130],
		weight: 8,
		monsters: [
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
		monster: Monsters.FeverSpider,
		amount: [70, 130],
		weight: 7,
		monsters: [Monsters.FeverSpider.id],
		combatLevel: 40,
		slayerLevel: 42,
		questPoints: 7,
		unlocked: true
	},
	{
		monster: Monsters.FireGiant,
		amount: [70, 130],
		weight: 12,
		monsters: [Monsters.FireGiant.id],
		combatLevel: 65,
		unlocked: true
	},
	{
		monster: Monsters.FossilIslandWyvernSpitting,
		amount: [10, 20],
		extendedAmount: [55, 75],
		extendedUnlockId: SlayerTaskUnlocksEnum.WyverNotherTwo,
		weight: 7,
		monsters: [
			Monsters.FossilIslandWyvernSpitting.id,
			Monsters.FossilIslandWyvernTaloned.id,
			Monsters.FossilIslandWyvernLongTailed.id,
			Monsters.FossilIslandWyvernAncient.id
		],
		combatLevel: 60,
		slayerLevel: 66,
		questPoints: 3,
		unlocked: true
	},
	{
		monster: Monsters.Gargoyle,
		amount: [70, 130],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.GetSmashed,
		weight: 11,
		monsters: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLevel: 80,
		slayerLevel: 75,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.GreaterDemon,
		amount: [70, 130],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.GreaterChallenge,
		weight: 9,
		monsters: [
			Monsters.GreaterDemon.id,
			Monsters.KrilTsutsaroth.id,
			Monsters.Skotizo.id,
			Monsters.TormentedDemon.id
		],
		combatLevel: 70,
		unlocked: true
	},
	{
		monster: Monsters.Hellhound,
		amount: [70, 130],
		weight: 9,
		monsters: [Monsters.Hellhound.id, Monsters.Cerberus.id],
		combatLevel: 75,
		unlocked: true
	},
	{
		monster: Monsters.Jelly,
		amount: [70, 130],
		weight: 10,
		monsters: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLevel: 57,
		slayerLevel: 52,
		unlocked: true
	},
	{
		monster: Monsters.JungleHorror,
		amount: [70, 130],
		weight: 10,
		monsters: [Monsters.JungleHorror.id],
		combatLevel: 65,
		questPoints: 11,
		unlocked: true
	},
	{
		monster: Monsters.KalphiteWorker,
		amount: [70, 130],
		weight: 11,
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
		amount: [70, 130],
		weight: 12,
		monsters: [Monsters.Kurask.id],
		combatLevel: 65,
		slayerLevel: 70,
		unlocked: true
	},
	{
		monster: Monsters.LesserDemon,
		amount: [70, 130],
		weight: 9,
		monsters: [Monsters.LesserDemon.id],
		combatLevel: 60,
		unlocked: true
	},
	{
		monster: Monsters.Lizardman,
		amount: [50, 90],
		weight: 8,
		monsters: [Monsters.Lizardman.id, Monsters.LizardmanBrute.id, Monsters.LizardmanShaman.id],
		unlocked: false
	},
	{
		monster: Monsters.Zygomite,
		amount: [8, 15],
		weight: 7,
		monsters: [Monsters.Zygomite.id, Monsters.AncientZygomite.id],
		combatLevel: 60,
		slayerLevel: 57,
		questPoints: 3,
		unlocked: true
	},
	{
		monster: Monsters.Nechryael,
		amount: [70, 130],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.NechsPlease,
		weight: 12,
		monsters: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLevel: 85,
		slayerLevel: 80,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.ShadowWarrior,
		amount: [70, 130],
		weight: 8,
		monsters: [Monsters.ShadowWarrior.id],
		combatLevel: 60,
		questPoints: 111,
		unlocked: true
	},
	{
		monster: Monsters.SkeletalWyvern,
		amount: [10, 20],
		extendedAmount: [50, 70],
		extendedUnlockId: SlayerTaskUnlocksEnum.WyverNotherOne,
		weight: 7,
		monsters: [Monsters.SkeletalWyvern.id],
		combatLevel: 70,
		slayerLevel: 72,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.SpiritualRanger,
		amount: [70, 130],
		extendedAmount: [181, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.SpiritualFervour,
		weight: 12,
		monsters: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		combatLevel: 60,
		slayerLevel: 63,
		questPoints: 3,
		unlocked: true
	},
	{
		monster: Monsters.MountainTroll,
		amount: [70, 130],
		weight: 11,
		monsters: [Monsters.MountainTroll.id, Monsters.IceTroll.id, Monsters.TrollGeneral.id],
		combatLevel: 60,
		unlocked: true
	},
	{
		monster: Monsters.Turoth,
		amount: [70, 130],
		weight: 10,
		monsters: [Monsters.Turoth.id],
		combatLevel: 60,
		slayerLevel: 55,
		unlocked: true
	},
	{
		monster: Monsters.TzHaarKet,
		amount: [90, 150],
		weight: 8,
		monsters: [Monsters.TzHaarKet.id, Monsters.TzHaarXil.id, Monsters.TzHaarMej.id],
		unlocked: false
	},
	{
		monster: Monsters.FeralVampyre,
		amount: [80, 100],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.MoreAtStake,
		weight: 6,
		monsters: [
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
		monster: Monsters.Wyrm,
		amount: [60, 100],
		weight: 6,
		monsters: [Monsters.Wyrm.id],
		slayerLevel: 62,
		unlocked: true
	},
	...bossTasks
];
