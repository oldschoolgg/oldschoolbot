import { Monsters } from 'oldschooljs';

import { SlayerTaskUnlocksEnum } from '../slayerUnlocks';
import type { AssignableSlayerTask } from '../types';

export const vannakaTasks: AssignableSlayerTask[] = [
	{
		monster: Monsters.AberrantSpectre,
		amount: [40, 90],
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
		amount: [40, 90],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.AugmentMyAbbies,
		weight: 5,
		monsters: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		combatLevel: 85,
		slayerLevel: 85,
		unlocked: true
	},
	{
		monster: Monsters.Ankou,
		amount: [25, 35],
		extendedAmount: [91, 150],
		extendedUnlockId: SlayerTaskUnlocksEnum.AnkouVeryMuch,
		weight: 7,
		monsters: [Monsters.Ankou.id],
		combatLevel: 40,
		unlocked: true
	},
	{
		monster: Monsters.Basilisk,
		amount: [40, 90],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.Basilonger,
		weight: 8,
		monsters: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLevel: 40,
		slayerLevel: 40,
		unlocked: true
	},
	{
		monster: Monsters.Bloodveld,
		amount: [40, 90],
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
		amount: [40, 90],
		weight: 7,
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
		amount: [40, 90],
		weight: 7,
		monsters: [Monsters.BrineRat.id],
		combatLevel: 45,
		slayerLevel: 47,
		questPoints: 4,
		unlocked: true
	},
	{
		monster: Monsters.Cockatrice,
		amount: [40, 90],
		weight: 8,
		monsters: [Monsters.Cockatrice.id],
		combatLevel: 25,
		slayerLevel: 25,
		unlocked: true
	},
	{
		monster: Monsters.Crocodile,
		amount: [40, 90],
		weight: 6,
		monsters: [Monsters.Crocodile.id],
		combatLevel: 50,
		unlocked: true
	},
	{
		monster: Monsters.Dagannoth,
		amount: [40, 90],
		weight: 7,
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
		amount: [40, 90],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.ToDustYouShallReturn,
		weight: 8,
		monsters: [Monsters.DustDevil.id],
		combatLevel: 70,
		slayerLevel: 65,
		questPoints: 12,
		unlocked: true
	},
	{
		monster: Monsters.ElfWarrior,
		amount: [30, 70],
		weight: 7,
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
		amount: [30, 90],
		weight: 7,
		monsters: [Monsters.FeverSpider.id],
		combatLevel: 40,
		slayerLevel: 42,
		questPoints: 7,
		unlocked: true
	},
	{
		monster: Monsters.FireGiant,
		amount: [40, 90],
		weight: 7,
		monsters: [Monsters.FireGiant.id],
		combatLevel: 65,
		unlocked: true
	},
	{
		monster: Monsters.Gargoyle,
		amount: [40, 90],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.GetSmashed,
		weight: 5,
		monsters: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLevel: 80,
		slayerLevel: 75,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Ghoul,
		amount: [10, 40],
		weight: 7,
		monsters: [Monsters.Ghoul.id],
		combatLevel: 25,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.HarpieBugSwarm,
		amount: [40, 90],
		weight: 8,
		monsters: [Monsters.HarpieBugSwarm.id],
		combatLevel: 45,
		slayerLevel: 33,
		levelRequirements: {
			firemaking: 33,
			slayer: 33
		},
		unlocked: true
	},
	{
		monster: Monsters.Hellhound,
		amount: [30, 60],
		weight: 7,
		monsters: [Monsters.Hellhound.id, Monsters.Cerberus.id],
		combatLevel: 75,
		unlocked: true
	},
	{
		monster: Monsters.HillGiant,
		amount: [40, 90],
		weight: 7,
		monsters: [Monsters.HillGiant.id, Monsters.Obor.id, Monsters.Cyclops.id],
		combatLevel: 25,
		unlocked: true
	},
	{
		monster: Monsters.Hobgoblin,
		amount: [40, 90],
		weight: 7,
		monsters: [Monsters.Hobgoblin.id],
		combatLevel: 20,
		unlocked: true
	},
	{
		monster: Monsters.IceGiant,
		amount: [30, 80],
		weight: 7,
		monsters: [Monsters.IceGiant.id],
		combatLevel: 50,
		unlocked: true
	},
	{
		monster: Monsters.IceWarrior,
		amount: [40, 90],
		weight: 7,
		monsters: [Monsters.IceWarrior.id],
		combatLevel: 45,
		unlocked: true
	},
	{
		monster: Monsters.InfernalMage,
		amount: [40, 90],
		weight: 8,
		monsters: [Monsters.InfernalMage.id],
		combatLevel: 40,
		slayerLevel: 45,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Jelly,
		amount: [40, 90],
		weight: 8,
		monsters: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLevel: 57,
		slayerLevel: 52,
		unlocked: true
	},
	{
		monster: Monsters.JungleHorror,
		amount: [40, 90],
		weight: 8,
		monsters: [Monsters.JungleHorror.id],
		combatLevel: 65,
		questPoints: 11,
		unlocked: true
	},
	{
		monster: Monsters.KalphiteWorker,
		amount: [40, 90],
		weight: 7,
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
		amount: [40, 90],
		weight: 7,
		monsters: [Monsters.Kurask.id],
		combatLevel: 65,
		slayerLevel: 70,
		unlocked: true
	},
	{
		monster: Monsters.LesserDemon,
		amount: [40, 90],
		weight: 7,
		monsters: [Monsters.LesserDemon.id],
		combatLevel: 60,
		unlocked: true
	},
	{
		monster: Monsters.Mogre,
		amount: [40, 90],
		weight: 7,
		monsters: [Monsters.Mogre.id],
		combatLevel: 30,
		slayerLevel: 32,
		unlocked: true
	},
	{
		monster: Monsters.Molanisk,
		amount: [40, 50],
		weight: 7,
		monsters: [Monsters.Molanisk.id],
		combatLevel: 50,
		slayerLevel: 39,
		questPoints: 8,
		unlocked: true
	},
	{
		monster: Monsters.MossGiant,
		amount: [40, 90],
		weight: 7,
		monsters: [Monsters.MossGiant.id, Monsters.Bryophyta.id],
		combatLevel: 40,
		unlocked: true
	},
	{
		monster: Monsters.Nechryael,
		amount: [40, 90],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.NechsPlease,
		weight: 5,
		monsters: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLevel: 85,
		slayerLevel: 80,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Ogre,
		amount: [40, 90],
		weight: 7,
		monsters: [Monsters.Ogre.id, Monsters.OgressShaman.id, Monsters.OgressWarrior.id],
		combatLevel: 40,
		unlocked: true
	},
	{
		monster: Monsters.Otherworldlybeing,
		amount: [40, 90],
		weight: 8,
		monsters: [Monsters.Otherworldlybeing.id],
		combatLevel: 40,
		questPoints: 3,
		unlocked: true
	},
	{
		monster: Monsters.Pyrefiend,
		amount: [40, 90],
		weight: 8,
		monsters: [Monsters.Pyrefiend.id, Monsters.Pyrelord.id],
		combatLevel: 25,
		slayerLevel: 30,
		unlocked: true
	},
	{
		monster: Monsters.Shade,
		amount: [40, 90],
		weight: 8,
		monsters: [
			Monsters.Shade.id,
			Monsters.LoarShade.id,
			Monsters.PhrinShade.id,
			Monsters.RiylShade.id,
			Monsters.AsynShade.id,
			Monsters.FiyrShade.id,
			Monsters.UriumShade.id
		],
		combatLevel: 30,
		unlocked: true
	},
	{
		monster: Monsters.SeaSnakeHatchling,
		amount: [40, 90],
		weight: 6,
		monsters: [Monsters.SeaSnakeHatchling.id, Monsters.SeaSnakeYoung.id],
		combatLevel: 50,
		slayerLevel: 40,
		questPoints: 60,
		unlocked: true
	},
	{
		monster: Monsters.ShadowWarrior,
		amount: [30, 80],
		weight: 8,
		monsters: [Monsters.ShadowWarrior.id],
		combatLevel: 60,
		questPoints: 111,
		unlocked: true
	},
	{
		monster: Monsters.SpiritualRanger,
		amount: [40, 90],
		extendedAmount: [181, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.SpiritualFervour,
		weight: 8,
		monsters: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		combatLevel: 60,
		slayerLevel: 63,
		questPoints: 3,
		unlocked: true
	},
	{
		monster: Monsters.TerrorDog,
		amount: [20, 45],
		weight: 6,
		monsters: [Monsters.TerrorDog.id],
		combatLevel: 60,
		slayerLevel: 40,
		questPoints: 3,
		unlocked: true
	},
	{
		monster: Monsters.MountainTroll,
		amount: [40, 90],
		weight: 7,
		monsters: [Monsters.MountainTroll.id, Monsters.IceTroll.id, Monsters.TrollGeneral.id],
		combatLevel: 60,
		unlocked: true
	},
	{
		monster: Monsters.Turoth,
		amount: [30, 90],
		weight: 8,
		monsters: [Monsters.Turoth.id],
		combatLevel: 60,
		slayerLevel: 55,
		unlocked: true
	},
	{
		monster: Monsters.FeralVampyre,
		amount: [10, 20],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.MoreAtStake,
		weight: 7,
		monsters: [
			Monsters.FeralVampyre.id,
			Monsters.VampyreJuvinate.id,
			Monsters.Vyrewatch.id,
			Monsters.VyrewatchSentinel.id
		],
		combatLevel: 35,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Werewolf,
		amount: [30, 60],
		weight: 7,
		monsters: [Monsters.Werewolf.id],
		combatLevel: 60,
		questPoints: 1,
		unlocked: true
	}
];
