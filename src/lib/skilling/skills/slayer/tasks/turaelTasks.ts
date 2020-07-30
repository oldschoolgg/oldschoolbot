import { Monsters } from 'oldschooljs';
import { SlayerTask } from '../../../types';

const turaelTasks: SlayerTask[] = [
	{
		name: 'Banshee',
		amount: [15, 50],
		weight: 8,
		alternatives: 'Twisted Banshee',
		Id: [Monsters.Banshee.id /* , Monsters.TwistedBanshee.id*/],
		combatLvl: 20,
		slayerLvl: 15,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Bat',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Giant bat', 'Deathwing'],
		Id: [Monsters.Bat.id /* , Monsters.GiantBat.id, Monsters.Deathwing.id*/],
		combatLvl: 5,
		unlocked: true
	},
	{
		name: 'Bird',
		amount: [15, 50],
		weight: 6,
		alternatives: [
			'Chicken',
			'Mounted terrorbird gnome',
			'Terrorbird',
			'Rooster',
			'Chompy bird',
			'Seagull',
			'Penguin',
			'Duck',
			'Duckling'
		],
		Id: [
			/*
			Monsters.Chicken.id,
			Monsters.MountedTerrorbirdGnome.id,
			Monsters.Terrorbird.id,
			Monsters.Rooster.id,
			Monsters.ChompyBird.id,
			Monsters.Seagull.id,
			Monsters.Penguin.id,
			Monsters.Duck.id,
			Monsters.Duckling.id
			*/
		],
		unlocked: true
	},
	{
		// Is Monsters.Bear.id === BlackBear?
		name: 'Black bear',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Grizzly bear cub', 'Bear cub', 'Grizzly bear', 'Callisto'],
		Id: [
			/*
			Monsters.BlackBear.id,
			Monsters.GrizzlyBearCub.id,
			Monsters.BearCub.id,
			Monsters.GrizzlyBear.id,
			Monsters.Callisto.id
			*/
		],
		combatLvl: 13,
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
		amount: [15, 50],
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
		name: 'Cow',
		amount: [15, 50],
		weight: 8,
		alternatives: ['Cow calf', 'Undead cow'],
		Id: [Monsters.Cow.id /* , Monsters.CowCalf.id, Monsters.UndeadCow.id*/],
		combatLvl: 5,
		unlocked: true
	},
	{
		name: 'Crawling hand',
		amount: [15, 50],
		weight: 8,
		Id: Monsters.CrawlingHand.id,
		slayerLvl: 5,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Guard dog',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Jackal', 'Wild dog', 'Reanimated dog'],
		Id: [
			Monsters.GuardDog
				.id /* ,
			Monsters.Jackal.id,
			Monsters.WildDog.id,
			Monsters.ReanimatedDog.id
			*/
		],
		combatLvl: 15,
		unlocked: true
	},
	{
		name: 'Dwarf',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Black Guard', 'Chaos Dwarf', 'Dwarf gang member'],
		Id: [
			Monsters.Dwarf
				.id /* ,
			Monsters.BlackGuard.id,
			Monsters.ChaosDwarf.id,
			Monsters.DwarfGangMember.id
			*/
		],
		combatLvl: 6,
		unlocked: true
	},
	{
		name: 'Ghost',
		amount: [15, 50],
		weight: 7,
		alternatives: 'Tortured soul',
		Id: [Monsters.Ghost.id /* , Monsters.TorturedSoul.id*/],
		combatLvl: 13,
		unlocked: true
	},
	{
		// generalgraddor multiple goblin kills?
		name: 'Goblin',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Cave goblin guard', 'General Graardor'],
		Id: [Monsters.Goblin.id /* , Monsters.CaveGoblinGuard.id*/, Monsters.GeneralGraardor.id],
		unlocked: true
	},
	{
		name: 'Icefiend',
		amount: [15, 50],
		weight: 8,
		Id: Monsters.Icefiend.id,
		combatLvl: 20,
		unlocked: true
	},
	{
		name: 'Kalphite worker',
		amount: [15, 50],
		weight: 6,
		alternatives: ['Kalphite soldier', 'Kalphite guardian', 'Kalphite Queen'],
		Id: [
			Monsters.KalphiteWorker
				.id /* ,
			Monsters.KalphiteSolider.id,
			Monsters.KalphiteGuardian.id*/,
			Monsters.KalphiteQueen.id
		],
		combatLvl: 15,
		unlocked: true
	},
	{
		// Sulphur should be locked behind 44 slayer.
		name: 'Lizard',
		amount: [15, 50],
		weight: 8,
		alternatives: ['Small Lizard', 'Desert Lizard', 'Sulphur Lizard'],
		Id: [
			Monsters.Lizard
				.id /* ,
			Monsters.SmallLizard.id,
			Monsters.DesertLizard.id,
			Monsters.SulphurLizard.id
			*/
		],
		slayerLvl: 22,
		unlocked: true
	},
	{
		name: 'Minotaur',
		amount: [10, 20],
		weight: 7,
		Id: Monsters.Minotaur.id,
		combatLvl: 7,
		unlocked: true
	},
	{
		name: 'Monkey',
		amount: [15, 50],
		weight: 6,
		alternatives: [
			'Monkey Guard',
			'Monkey Archer',
			'Monkey Zombie',
			'Demonic Gorilla',
			'Tortured Gorilla'
		],
		Id: [
			Monsters.Monkey
				.id /* ,
			Monsters.MonkeyGuard.id,
			Monsters.MonkeyArcher.id,
			Monsters.MonkeyZombie.id,
			Monsters.DemonicGorilla.id,
			Monsters.TorturedGorilla.id
			*/
		],
		unlocked: true
	},
	{
		name: 'Rat',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Giant rat', 'Dungeon rat', 'Crypt rat', 'Zombie rat', 'Brine rat'],
		Id: [
			Monsters.Rat.id /* ,
			Monsters.GiantRat.id,
			Monsters.DungeonRat.id,
			Monsters.CryptRat.id,
			Monsters.ZombieRat.id*/,	
			Monsters.BrineRat.id
		],
		unlocked: true
	},
	{
		name: 'Scorpion',
		amount: [15, 50],
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
			Monsters.Scorpion
				.id /* ,
			Monsters.KingScorpion.id,
			Monsters.PoisionScorpion.id,
			Monsters.PitScorpion.id,
			Monsters.Scorpia.id,
			Monsters.Lobstrosity.id,
			Monsters.ReanimatedScorpion.id
			*/
		],
		combatLvl: 7,
		unlocked: true
	},
	{
		// Can be different types under 'Skeleton' in future maybe.
		name: 'Skeleton',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Skeleton mage', "Vet'ion", 'Skogre', 'Skeleton fremennik'],
		Id: [
			Monsters.Skeleton.id,
			//	Monsters.SkeletonMage.id,
			Monsters.Vetion.id /* ,
			Monsters.Skogre.id,
			Monsters.SkeletonFremennik.id
			*/
		],
		combatLvl: 15,
		unlocked: true
	},
	{
		// Sarachnis not added in monsters yet.
		name: 'Spider',
		amount: [15, 50],
		weight: 6,
		alternatives: [
			'Giant spider',
			'Shadow spider',
			'Giant crypt spider',
			'Sarachnis',
			'Temple Spider',
			'Venenatis'
		],
		Id: [
			Monsters.Spider
				.id /* ,
			Monsters.GiantSpider.id,
			Monsters.ShadowSpider.id,
			Monsters.GiantCryptSpider.id,
			Monsters.Sarachnis.id,
			Monsters.TempleSpider.id*/,
			Monsters.Venenatis.id
		],
		unlocked: true
	},
	{
		name: 'Wolf',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Big Wolf', 'Desert Wolf', 'Ice wolf', 'Jungle wolf', 'White wolf'],
		Id: [
			Monsters.Wolf
				.id /* ,
			Monsters.BigWolf.id,
			Monsters.DesertWolf.id,
			Monsters.IceWolf.id,
			Monsters.JungleWolf.id,
			Monsters.WhiteWolf.id
			*/
		],
		combatLvl: 20,
		unlocked: true
	},
	{
		// In future different zombie combat lvls different drops?
		name: 'Zombie',
		amount: [15, 50],
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
			Monsters.Zombie
				.id /* ,
			Monsters.MonkeyZombie.id,
			Monsters.UndeadChicken.id,
			Monsters.UndeadCow.id,
			Monsters.UndeadDruid.id,
			Monsters.UndeadOne.id,
			Monsters.ZombieRat.id,
			Monsters.Zogre.id*/,
			Monsters.Vorkath.id
		],
		combatLvl: 10,
		unlocked: true
	}
];

export default turaelTasks;
