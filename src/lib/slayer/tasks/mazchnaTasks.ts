import { Monsters } from 'oldschooljs';

import { AssignableSlayerTask } from '../types';

export const mazchnaTasks: AssignableSlayerTask[] = [
	{
		monster: Monsters.Banshee,
		amount: [40, 70],
		weight: 8,
		id: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLevel: 20,
		slayerLevel: 15,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Bat,
		amount: [40, 70],
		weight: 7,
		id: [Monsters.Bat.id, Monsters.GiantBat.id],
		combatLevel: 5,
		unlocked: true
	},
	{
		monster: Monsters.BlackBear,
		amount: [40, 70],
		weight: 6,
		id: [
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
		id: [Monsters.Catablepon.id],
		combatLevel: 35,
		unlocked: true
	},
	{
		monster: Monsters.CaveBug,
		amount: [10, 20],
		weight: 8,
		id: [Monsters.CaveBug.id],
		slayerLevel: 7,
		unlocked: true
	},
	{
		monster: Monsters.CaveCrawler,
		amount: [40, 70],
		weight: 8,
		id: [Monsters.CaveCrawler.id],
		combatLevel: 10,
		slayerLevel: 10,
		unlocked: true
	},
	{
		monster: Monsters.CaveSlime,
		amount: [10, 20],
		weight: 8,
		id: [Monsters.CaveSlime.id],
		combatLevel: 15,
		slayerLevel: 17,
		unlocked: true
	},
	{
		monster: Monsters.Cockatrice,
		amount: [40, 70],
		weight: 8,
		id: [Monsters.Cockatrice.id],
		combatLevel: 25,
		slayerLevel: 25,
		unlocked: true
	},
	{
		monster: Monsters.CrawlingHand,
		amount: [40, 70],
		weight: 8,
		id: [Monsters.CrawlingHand.id],
		slayerLevel: 5,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Lizard,
		amount: [40, 70],
		weight: 8,
		id: [
			Monsters.Lizard.id,
			Monsters.SmallLizard.id,
			Monsters.DesertLizard.id,
			Monsters.SulphurLizard.id
		],
		slayerLevel: 22,
		unlocked: true
	},
	{
		monster: Monsters.GuardDog,
		amount: [40, 70],
		weight: 7,
		id: [Monsters.GuardDog.id, Monsters.Jackal.id, Monsters.WildDog.id],
		combatLevel: 15,
		unlocked: true
	},
	{
		monster: Monsters.EarthWarrior,
		amount: [40, 70],
		weight: 6,
		id: [Monsters.EarthWarrior.id],
		combatLevel: 35,
		unlocked: true
	},
	{
		monster: Monsters.FleshCrawler,
		amount: [15, 25],
		weight: 7,
		id: [Monsters.FleshCrawler.id],
		combatLevel: 15,
		unlocked: true
	},
	{
		monster: Monsters.Ghost,
		amount: [40, 70],
		weight: 7,
		id: [Monsters.Ghost.id, Monsters.TorturedSoul.id],
		combatLevel: 13,
		unlocked: true
	},
	{
		monster: Monsters.Ghoul,
		amount: [10, 20],
		weight: 7,
		id: [Monsters.Ghoul.id],
		combatLevel: 25,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.HillGiant,
		amount: [40, 70],
		weight: 7,
		id: [Monsters.HillGiant.id, Monsters.Obor.id, Monsters.Cyclops.id],
		combatLevel: 25,
		unlocked: true
	},
	{
		monster: Monsters.Hobgoblin,
		amount: [40, 70],
		weight: 7,
		id: [Monsters.Hobgoblin.id],
		combatLevel: 20,
		unlocked: true
	},
	{
		monster: Monsters.IceWarrior,
		amount: [40, 70],
		weight: 7,
		id: [Monsters.IceWarrior.id],
		combatLevel: 45,
		unlocked: true
	},
	{
		monster: Monsters.KalphiteWorker,
		amount: [40, 70],
		weight: 6,
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
		monster: Monsters.Killerwatt,
		amount: [30, 80],
		weight: 6,
		id: [Monsters.Killerwatt.id],
		combatLevel: 50,
		slayerLevel: 37,
		questPoints: 4,
		unlocked: true
	},
	{
		monster: Monsters.Mogre,
		amount: [40, 70],
		weight: 8,
		id: [Monsters.Mogre.id],
		combatLevel: 30,
		slayerLevel: 32,
		unlocked: true
	},
	{
		monster: Monsters.Pyrefiend,
		amount: [40, 70],
		weight: 8,
		id: [Monsters.Pyrefiend.id],
		combatLevel: 25,
		slayerLevel: 30,
		unlocked: true
	},
	{
		monster: Monsters.Rockslug,
		amount: [40, 70],
		weight: 8,
		id: [Monsters.Rockslug.id],
		combatLevel: 20,
		slayerLevel: 20,
		unlocked: true
	},
	{
		monster: Monsters.Scorpion,
		amount: [40, 70],
		weight: 7,
		id: [
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
		amount: [40, 70],
		weight: 8,
		id: [
			Monsters.Shade.id,
			Monsters.LoarShade.id,
			Monsters.PhrinShade.id,
			Monsters.RiylShade.id,
			Monsters.AsynShade.id,
			Monsters.FiyrShade.id
		],
		combatLevel: 30,
		unlocked: true
	},
	{
		monster: Monsters.Skeleton,
		amount: [40, 70],
		weight: 7,
		id: [
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
		weight: 6,
		id: [
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
		id: [Monsters.WallBeast.id],
		combatLevel: 30,
		slayerLevel: 35,
		unlocked: true
	},
	{
		monster: Monsters.Wolf,
		amount: [40, 70],
		weight: 7,
		id: [
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
		amount: [40, 70],
		weight: 7,
		id: [
			Monsters.Zombie.id,
			Monsters.MonkeyZombie.id,
			Monsters.UndeadChicken.id,
			Monsters.UndeadCow.id,
			Monsters.UndeadDruid.id,
			Monsters.UndeadOne.id,
			Monsters.ZombieRat.id,
			Monsters.Zogre.id,
			Monsters.Vorkath.id
		],
		combatLevel: 10,
		unlocked: true
	}
];
