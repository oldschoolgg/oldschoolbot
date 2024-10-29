import { Monsters } from 'oldschooljs';

import { SlayerTaskUnlocksEnum } from '../slayerUnlocks';
import type { AssignableSlayerTask } from '../types';

export const mazchnaTasks: AssignableSlayerTask[] = [
	{
		monster: Monsters.Banshee,
		amount: [30, 50],
		weight: 8,
		monsters: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLevel: 20,
		slayerLevel: 15,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Bat,
		amount: [30, 50],
		weight: 7,
		monsters: [Monsters.Bat.id, Monsters.GiantBat.id],
		combatLevel: 5,
		unlocked: true
	},
	{
		monster: Monsters.BlackBear,
		amount: [30, 50],
		weight: 6,
		monsters: [
			Monsters.BlackBear.id,
			Monsters.GrizzlyBearCub.id,
			Monsters.BearCub.id,
			Monsters.GrizzlyBear.id,
			Monsters.Callisto.id
		],
		combatLevel: 13,
		unlocked: true
	},
	{
		monster: Monsters.Catablepon,
		amount: [20, 30],
		weight: 8,
		monsters: [Monsters.Catablepon.id],
		combatLevel: 35,
		unlocked: true
	},
	{
		monster: Monsters.CaveBug,
		amount: [10, 20],
		weight: 8,
		monsters: [Monsters.CaveBug.id],
		slayerLevel: 7,
		unlocked: true
	},
	{
		monster: Monsters.CaveCrawler,
		amount: [30, 50],
		weight: 8,
		monsters: [Monsters.CaveCrawler.id],
		combatLevel: 10,
		slayerLevel: 10,
		unlocked: true
	},
	{
		monster: Monsters.CaveSlime,
		amount: [10, 20],
		weight: 8,
		monsters: [Monsters.CaveSlime.id],
		combatLevel: 15,
		slayerLevel: 17,
		unlocked: true
	},
	{
		monster: Monsters.Cockatrice,
		amount: [30, 50],
		weight: 8,
		monsters: [Monsters.Cockatrice.id],
		combatLevel: 25,
		slayerLevel: 25,
		unlocked: true
	},
	{
		monster: Monsters.CrawlingHand,
		amount: [30, 50],
		weight: 8,
		monsters: [Monsters.CrawlingHand.id],
		slayerLevel: 5,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.GuardDog,
		amount: [30, 50],
		weight: 7,
		monsters: [Monsters.GuardDog.id, Monsters.Jackal.id, Monsters.WildDog.id],
		combatLevel: 15,
		unlocked: true
	},
	{
		monster: Monsters.FleshCrawler,
		amount: [15, 25],
		weight: 7,
		monsters: [Monsters.FleshCrawler.id],
		combatLevel: 15,
		unlocked: true
	},
	{
		monster: Monsters.Ghost,
		amount: [30, 50],
		weight: 7,
		monsters: [Monsters.Ghost.id, Monsters.TorturedSoul.id],
		combatLevel: 13,
		unlocked: true
	},
	{
		monster: Monsters.Ghoul,
		amount: [10, 20],
		weight: 7,
		monsters: [Monsters.Ghoul.id],
		combatLevel: 25,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.HillGiant,
		amount: [30, 50],
		weight: 7,
		monsters: [Monsters.HillGiant.id, Monsters.Obor.id, Monsters.Cyclops.id],
		combatLevel: 25,
		unlocked: true
	},
	{
		monster: Monsters.Hobgoblin,
		amount: [30, 50],
		weight: 7,
		monsters: [Monsters.Hobgoblin.id],
		combatLevel: 20,
		unlocked: true
	},
	{
		monster: Monsters.IceWarrior,
		amount: [40, 50],
		weight: 7,
		monsters: [Monsters.IceWarrior.id],
		combatLevel: 45,
		unlocked: true
	},
	{
		monster: Monsters.KalphiteWorker,
		amount: [30, 50],
		weight: 6,
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
		monster: Monsters.Killerwatt,
		amount: [30, 50],
		weight: 6,
		monsters: [Monsters.Killerwatt.id],
		combatLevel: 50,
		slayerLevel: 37,
		questPoints: 4,
		unlocked: true
	},
	{
		monster: Monsters.Lizard,
		amount: [30, 50],
		weight: 8,
		monsters: [Monsters.Lizard.id, Monsters.SmallLizard.id, Monsters.DesertLizard.id, Monsters.SulphurLizard.id],
		slayerLevel: 22,
		unlocked: true
	},
	{
		monster: Monsters.Mogre,
		amount: [30, 50],
		weight: 8,
		monsters: [Monsters.Mogre.id],
		combatLevel: 30,
		slayerLevel: 32,
		unlocked: true
	},
	{
		monster: Monsters.Pyrefiend,
		amount: [30, 50],
		weight: 8,
		monsters: [Monsters.Pyrefiend.id, Monsters.Pyrelord.id],
		combatLevel: 25,
		slayerLevel: 30,
		unlocked: true
	},
	{
		monster: Monsters.Rockslug,
		amount: [30, 50],
		weight: 8,
		monsters: [Monsters.Rockslug.id],
		combatLevel: 20,
		slayerLevel: 20,
		unlocked: true
	},
	{
		monster: Monsters.Scorpion,
		amount: [30, 50],
		weight: 7,
		monsters: [
			Monsters.Scorpion.id,
			Monsters.KingScorpion.id,
			Monsters.PoisonScorpion.id,
			Monsters.PitScorpion.id,
			Monsters.Scorpia.id,
			Monsters.Lobstrosity.id
		],
		combatLevel: 7,
		unlocked: true
	},
	{
		monster: Monsters.Shade,
		amount: [30, 70],
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
		monster: Monsters.Skeleton,
		amount: [30, 50],
		weight: 7,
		monsters: [
			Monsters.Skeleton.id,
			Monsters.SkeletonMage.id,
			Monsters.Vetion.id,
			Monsters.Skogre.id,
			Monsters.SkeletonFremennik.id
		],
		combatLevel: 15,
		unlocked: true
	},
	{
		monster: Monsters.FeralVampyre,
		amount: [10, 20],
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
		unlocked: true
	},
	{
		monster: Monsters.WallBeast,
		amount: [10, 20],
		weight: 7,
		monsters: [Monsters.WallBeast.id],
		combatLevel: 30,
		slayerLevel: 35,
		unlocked: true
	},
	{
		monster: Monsters.Wolf,
		amount: [30, 50],
		weight: 7,
		monsters: [
			Monsters.Wolf.id,
			Monsters.BigWolf.id,
			Monsters.DesertWolf.id,
			Monsters.IceWolf.id,
			Monsters.JungleWolf.id,
			Monsters.WhiteWolf.id
		],
		combatLevel: 20,
		unlocked: true
	},
	{
		monster: Monsters.Zombie,
		amount: [30, 50],
		weight: 7,
		monsters: [
			Monsters.Zombie.id,
			Monsters.MonkeyZombie.id,
			Monsters.UndeadChicken.id,
			Monsters.UndeadDruid.id,
			Monsters.UndeadOne.id,
			Monsters.ZombieRat.id,
			Monsters.Zogre.id,
			Monsters.Vorkath.id,
			Monsters.ArmouredZombie.id
		],
		combatLevel: 10,
		unlocked: true
	}
];
