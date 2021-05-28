import { Monsters } from 'oldschooljs';

import { AssignableSlayerTask } from '../types';

export const turaelTasks: AssignableSlayerTask[] = [
	{
		monster: Monsters.Banshee,
		amount: [15, 50],
		weight: 8,
		id: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLevel: 20,
		slayerLevel: 15,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Bat,
		amount: [15, 50],
		weight: 7,
		id: [Monsters.Bat.id, Monsters.GiantBat.id],
		combatLevel: 5,
		unlocked: true
	},
	{
		monster: Monsters.Bird,
		amount: [15, 50],
		weight: 6,
		id: [
			Monsters.Chicken.id,
			Monsters.MountedTerrorBirdGnome.id,
			Monsters.TerrorBird.id,
			Monsters.Rooster.id,
			Monsters.ChompyBird.id,
			Monsters.Seagull.id,
			Monsters.Penguin.id,
			Monsters.Duck.id,
			Monsters.Duckling.id
		],
		unlocked: true
	},
	{
		monster: Monsters.BlackBear,
		amount: [15, 50],
		weight: 7,
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
		monster: Monsters.CaveBug,
		amount: [10, 20],
		weight: 8,
		id: [Monsters.CaveBug.id],
		slayerLevel: 7,
		unlocked: true
	},
	{
		monster: Monsters.CaveCrawler,
		amount: [15, 50],
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
		monster: Monsters.Cow,
		amount: [15, 50],
		weight: 8,
		id: [Monsters.Cow.id, Monsters.CowCalf.id, Monsters.UndeadCow.id],
		combatLevel: 5,
		unlocked: true
	},
	{
		monster: Monsters.CrawlingHand,
		amount: [15, 50],
		weight: 8,
		id: [Monsters.CrawlingHand.id],
		slayerLevel: 5,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.GuardDog,
		amount: [15, 50],
		weight: 7,
		id: [Monsters.GuardDog.id, Monsters.Jackal.id, Monsters.WildDog.id],
		combatLevel: 15,
		unlocked: true
	},
	{
		monster: Monsters.Dwarf,
		amount: [15, 50],
		weight: 7,
		id: [
			Monsters.Dwarf.id,
			Monsters.BlackGuard.id,
			Monsters.ChaosDwarf.id,
			Monsters.DwarfGangMember.id
		],
		combatLevel: 6,
		unlocked: true
	},
	{
		monster: Monsters.Ghost,
		amount: [15, 50],
		weight: 7,
		id: [Monsters.Ghost.id, Monsters.TorturedSoul.id],
		combatLevel: 13,
		unlocked: true
	},
	{
		monster: Monsters.Goblin,
		amount: [15, 50],
		weight: 7,
		id: [Monsters.Goblin.id, Monsters.CaveGoblinGuard.id, Monsters.GeneralGraardor.id],
		unlocked: true
	},
	{
		monster: Monsters.Icefiend,
		amount: [15, 50],
		weight: 8,
		id: [Monsters.Icefiend.id],
		combatLevel: 20,
		unlocked: true
	},
	{
		monster: Monsters.KalphiteWorker,
		amount: [15, 50],
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
		monster: Monsters.Lizard,
		amount: [15, 50],
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
		monster: Monsters.Minotaur,
		amount: [10, 20],
		weight: 7,
		id: [Monsters.Minotaur.id],
		combatLevel: 7,
		unlocked: true
	},
	{
		monster: Monsters.Monkey,
		amount: [15, 50],
		weight: 6,
		id: [
			Monsters.Monkey.id,
			Monsters.MonkeyGuard.id,
			Monsters.MonkeyArcher.id,
			Monsters.MonkeyZombie.id,
			Monsters.DemonicGorilla.id,
			Monsters.TorturedGorilla.id
		],
		unlocked: true
	},
	{
		monster: Monsters.Rat,
		amount: [15, 50],
		weight: 7,
		id: [
			Monsters.Rat.id,
			Monsters.GiantRat.id,
			Monsters.DungeonRat.id,
			Monsters.CryptRat.id,
			Monsters.ZombieRat.id,
			Monsters.BrineRat.id
		],
		unlocked: true
	},
	{
		monster: Monsters.Scorpion,
		amount: [15, 50],
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
		monster: Monsters.Skeleton,
		amount: [15, 50],
		weight: 7,
		id: [
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
		monster: Monsters.Spider,
		amount: [15, 50],
		weight: 6,
		id: [
			Monsters.Spider.id,
			Monsters.GiantSpider.id,
			Monsters.ShadowSpider.id,
			Monsters.GiantCryptSpider.id,
			Monsters.Sarachnis.id,
			Monsters.TempleSpider.id,
			Monsters.Venenatis.id
		],
		unlocked: true
	},
	{
		monster: Monsters.Wolf,
		amount: [15, 50],
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
		amount: [15, 50],
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
