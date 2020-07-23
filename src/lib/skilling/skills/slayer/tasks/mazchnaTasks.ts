import { Monsters } from 'oldschooljs';
import { Task } from '../../../types';

const mazchnaTasks: Task[] = [
	{
		//Twisted Banshee not added in monsters. Quest lock?
		name: 'Banshee',
		amount: [40, 70],
		weight: 8,
		alternatives: 'Twisted Banshee',
		Id: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLvl: 20,
		slayerLvl: 15,
		unlocked: true
	},
	{
		//Giant bat not added in monsters.
		name: 'Bat',
		amount: [40, 70],
		weight: 7,
		alternatives: 'Giant bat',
		Id: [Monsters.Bat.id, Monsters.GiantBat.id],
		combatLvl: 5,
		unlocked: true
	},
	{
		//Wrong name on Black bear in Monsters? Rest of bears except callisto not added in monsters.
		name: 'Black bear',
		amount: [40, 70],
		weight: 6,
		alternatives: ['Grizzly bear cub', 'Bear cub', 'Grizzly bear', 'Callisto'],
		Id: [
			Monsters.BlackBear.id,
			Monsters.GrizzlyBearCub.id,
			Monsters.BearCub.id,
			Monsters.GrizzlyBear.id,
			Monsters.Callisto.id
		],
		combatLvl: 13,
		unlocked: true
	},
	{
		//Not added in monsters.
		name: 'Catablepon',
		amount: [20, 30],
		weight: 8,
		Id: Monsters.Catablepon.id,
		combatLvl: 35,
		unlocked: true
	},
	{
		name: 'Cave bug',
		amount: [10, 20],
		weight: 8,
		Id: Monsters.CaveBug.id,
		slayerLvl: 7,
		unlocked: true
	},
	{
		name: 'Cave crawler',
		amount: [40, 70],
		weight: 8,
		Id: Monsters.CaveCrawler.id,
		combatLvl: 10,
		slayerLvl: 10,
		unlocked: true
	},
	{
		name: 'Cave slime',
		amount: [10, 20],
		weight: 8,
		Id: Monsters.CaveSlime.id,
		combatLvl: 15,
		slayerLvl: 17,
		unlocked: true
	},
	{
		//Defence lvl? Not added in monsters.
		name: 'Cockatrice',
		amount: [40, 70],
		weight: 8,
		Id: Monsters.Cockatrice.id,
		combatLvl: 25,
		slayerLvl: 25,
		//  defenceLvl: 20,
		unlocked: true
	},
	{
		//Quest lock?
		name: 'Crawling hand',
		amount: [40, 70],
		weight: 8,
		Id: Monsters.CrawlingHand.id,
		slayerLvl: 5,
		unlocked: true
	},
	{
		// Sulphur locked behind 44 slayer, All not added in monsters.
		name: 'Lizard',
		amount: [40, 70],
		weight: 8,
		alternatives: ['Small Lizard', 'Desert Lizard', 'Sulphur Lizard'],
		Id: [
			Monsters.Lizard.id,
			Monsters.SmallLizard.id,
			Monsters.DesertLizard.id,
			Monsters.SulphurLizard.id
		],
		slayerLvl: 22,
		unlocked: true
	},
	{
		//Not all dogs are added in monsters.
		name: 'Guard dog',
		amount: [40, 70],
		weight: 7,
		alternatives: ['Jackal', 'Wild dog', 'Reanimated dog'],
		Id: [
			Monsters.GuardDog.id,
			Monsters.Jackal.id,
			Monsters.WildDog.id,
			Monsters.ReanimatedDog.id
		],
		combatLvl: 15,
		unlocked: true
	},
	{
		//Not added in monsters.
		name: 'Earth warrior',
		amount: [40, 70],
		weight: 6,
		Id: Monsters.EarthWarrior.id,
		combatLvl: 35,
		unlocked: true
	},
	{
		//Not added in monsters.
		name: 'Flesh Crawler',
		amount: [15, 25],
		weight: 7,
		Id: Monsters.FleshCrawler.id,
		combatLvl: 15,
		unlocked: true
	},
	{
		//Tortured soul added in monsters.
		name: 'Ghost',
		amount: [40, 70],
		weight: 7,
		alternatives: 'Tortured soul',
		Id: [Monsters.Ghost.id, Monsters.TorturedSoul.id],
		combatLvl: 13,
		unlocked: true
	},
	{
		//Not added in monsters. Quest lock?
		name: 'Ghoul',
		amount: [10, 20],
		weight: 7,
		Id: Monsters.Ghoul.id,
		combatLvl: 25,
		unlocked: true
	},
	{
		//Not added in monsters.
		name: 'Hill Giant',
		amount: [40, 70],
		weight: 7,
		alternatives: ['Obor', 'Cyclops'],
		Id: [Monsters.HillGiant.id, Monsters.Obor.id, Monsters.Cyclops.id],
		combatLvl: 25,
		unlocked: true
	},
	{
		//Not added in monsters.
		name: 'Hobgoblin',
		amount: [40, 70],
		weight: 7,
		Id: Monsters.Hobgoblin.id,
		combatLvl: 20,
		unlocked: true
	},
	{
		//Not added in monsters.
		name: 'Ice warrior',
		amount: [40, 70],
		weight: 7,
		Id: Monsters.IceWarrior.id,
		combatLvl: 45,
		unlocked: true
	},
	{
		// KalphSolider and Guardian not added in monsters.
		name: 'Kalphite worker',
		amount: [40, 70],
		weight: 6,
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
		//Not added in monsters. Quest lock?
		name: 'Killerwatt',
		amount: [30, 80],
		weight: 6,
		Id: Monsters.Killerwatt.id,
		combatLvl: 50,
		slayerLvl: 37,
		unlocked: true
	},
	{
		//Not added in monsters. Quest lock?
		name: 'Mogre',
		amount: [40, 70],
		weight: 8,
		Id: Monsters.Mogre.id,
		combatLvl: 30,
		slayerLvl: 32,
		unlocked: true
	},
	{
		//Not added in monsters.
		name: 'Pyrefiend',
		amount: [40, 70],
		weight: 8,
		Id: Monsters.Pyrefiend.id,
		combatLvl: 25,
		slayerLvl: 30,
		unlocked: true
	},
	{
		//Not added in monsters.
		name: 'Rockslug',
		amount: [40, 70],
		weight: 8,
		Id: Monsters.Rockslug.id,
		combatLvl: 20,
		slayerLvl: 20,
		unlocked: true
	},
	{
		// Lots of scorpions not added in monsters.
		name: 'Scorpion',
		amount: [40, 70],
		weight: 7,
		alternatives: [
			'King Scorpion',
			'Poison Scorpion',
			'Pit Scorpion',
			'Scorpia',
			'Lobstrosity',
			'Reanimated scorpion'
		],
		Id: [
			Monsters.Scorpion.id,
			Monsters.KingScorpion.id,
			Monsters.PoisionScorpion.id,
			Monsters.PitScorpion.id,
			Monsters.Scorpia.id,
			Monsters.Lobstrosity.id,
			Monsters.ReanimatedScorpion.id
		],
		combatLvl: 7,
		unlocked: true
	},
	{
		// None of the shades added in monsters.
		name: 'Shade',
		amount: [40, 70],
		weight: 8,
		alternatives: ['Loar Shade', 'Phrin Shade', 'Riyl Shade', 'Asyn Shade', 'Fiyr Shade'],
		Id: [
			Monsters.Shade.id,
			Monsters.LoarShade.id,
			Monsters.PhrinShade.id,
			Monsters.RiylShade.id,
			Monsters.AsynShade.id,
			Monsters.FiyrShade.id
		],
		combatLvl: 30,
		unlocked: true
	},
	{
		//Not all skeletons added in monsters. And different types under 'Skeleton'.
		name: 'Skeleton',
		amount: [40, 70],
		weight: 7,
		alternatives: ['Skeleton mage', "Vet'ion", 'Skogre', 'Skeleton fremennik'],
		Id: [
			Monsters.SkeletonMage.id,
			Monsters.Vetion.id,
			Monsters.Skogre.id,
			Monsters.SkeletonFremennik.id
		],
		combatLvl: 15,
		unlocked: true
	},
	{
		//No Vampyres added in monsters. Quest lock?
		name: 'Feral Vampyre',
		amount: [10, 20],
		weight: 6,
		alternatives: ['Vampyre Juvinate', 'Vyrewatch', 'Vyrewatch Sentinel'],
		Id: [
			Monsters.FeralVampyre.id,
			Monsters.VampyreJuvinate.id,
			Monsters.Vyrewatch.id,
			Monsters.VyrewatchSentinel.id
		],
		combatLvl: 35,
		unlocked: true
	},
	{
		//Defence lvl?
		name: 'Wall beast',
		amount: [10, 20],
		weight: 7,
		Id: Monsters.WallBeast.id,
		combatLvl: 30,
		slayerLvl: 35,
		//	defenceLvl: 5,
		unlocked: true
	},
	{
		//Most wolfs not added to monsters.
		name: 'Wolf',
		amount: [40, 70],
		weight: 7,
		alternatives: ['Big Wolf', 'Desert Wolf', 'Ice wolf', 'Jungle wolf', 'White wolf'],
		Id: [
			Monsters.Wolf.id,
			Monsters.BigWolf.id,
			Monsters.DesertWolf.id,
			Monsters.IceWolf.id,
			Monsters.JungleWolf.id,
			Monsters.WhiteWolf.id
		],
		combatLvl: 20,
		unlocked: true
	},
	{
		//Most alternative zombies not added, different zombie combat lvls different drops?
		name: 'Zombie',
		amount: [40, 70],
		weight: 7,
		alternatives: [
			'Monkey Zombie',
			'Undead chicken',
			'Undead cow',
			'Undead Druid',
			'Undead one',
			'Zombie rat',
			'Zogre',
			'Vorkath'
		],
		Id: [
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
		combatLvl: 10,
		unlocked: true
	}
];

export default mazchnaTasks;
