import { Monsters } from 'oldschooljs';

import { AssignableSlayerTask } from '../types';

export const turaelTasks: AssignableSlayerTask[] = [
	{
		name: 'Banshee',
		amount: [15, 50],
		weight: 8,
		alternatives: ['Twisted Banshee'],
		id: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLevel: 20,
		slayerLevel: 15,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Bat',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Giant bat'],
		id: [Monsters.Bat.id, Monsters.GiantBat.id],
		combatLevel: 5,
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
		name: 'Black bear',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Grizzly bear cub', 'Bear cub', 'Grizzly bear', 'Callisto'],
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
		name: 'Cave bug',
		amount: [10, 20],
		weight: 8,
		id: [Monsters.CaveBug.id],
		slayerLevel: 7,
		unlocked: true
	},
	{
		name: 'Cave crawler',
		amount: [15, 50],
		weight: 8,
		id: [Monsters.CaveCrawler.id],
		combatLevel: 10,
		slayerLevel: 10,
		unlocked: true
	},
	{
		name: 'Cave slime',
		amount: [10, 20],
		weight: 8,
		id: [Monsters.CaveSlime.id],
		combatLevel: 15,
		slayerLevel: 17,
		unlocked: true
	},
	{
		name: 'Cow',
		amount: [15, 50],
		weight: 8,
		alternatives: ['Cow calf', 'Undead cow'],
		id: [Monsters.Cow.id, Monsters.CowCalf.id, Monsters.UndeadCow.id],
		combatLevel: 5,
		unlocked: true
	},
	{
		name: 'Crawling hand',
		amount: [15, 50],
		weight: 8,
		id: [Monsters.CrawlingHand.id],
		slayerLevel: 5,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Guard dog',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Jackal', 'Wild dog' /* , 'Reanimated dog'*/],
		id: [
			Monsters.GuardDog.id,
			Monsters.Jackal.id,
			Monsters.WildDog.id /* ,
			Monsters.ReanimatedDog.id*/
		],
		combatLevel: 15,
		unlocked: true
	},
	{
		name: 'Dwarf',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Black Guard', 'Chaos Dwarf', 'Dwarf gang member'],
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
		name: 'Ghost',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Tortured soul'],
		id: [Monsters.Ghost.id, Monsters.TorturedSoul.id],
		combatLevel: 13,
		unlocked: true
	},
	{
		name: 'Goblin',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Cave goblin guard', 'General Graardor'],
		id: [Monsters.Goblin.id, Monsters.CaveGoblinGuard.id, Monsters.GeneralGraardor.id],
		unlocked: true
	},
	{
		name: 'Icefiend',
		amount: [15, 50],
		weight: 8,
		id: [Monsters.Icefiend.id],
		combatLevel: 20,
		unlocked: true
	},
	{
		name: 'Kalphite worker',
		amount: [15, 50],
		weight: 6,
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
		name: 'Lizard',
		amount: [15, 50],
		weight: 8,
		alternatives: ['Small Lizard', 'Desert Lizard', 'Sulphur Lizard'],
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
		name: 'Minotaur',
		amount: [10, 20],
		weight: 7,
		id: [Monsters.Minotaur.id],
		combatLevel: 7,
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
		name: 'Rat',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Giant rat', 'Dungeon rat', 'Crypt rat', 'Zombie rat', 'Brine rat'],
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
		name: 'Scorpion',
		amount: [15, 50],
		weight: 7,
		alternatives: [
			'King Scorpion',
			'Poison Scorpion',
			'Pit Scorpion',
			'Scorpia',
			'Lobstrosity' /* ,
			'Reanimated scorpion'*/
		],
		id: [
			Monsters.Scorpion.id,
			Monsters.KingScorpion.id,
			Monsters.PoisonScorpion.id,
			Monsters.PitScorpion.id,
			Monsters.Scorpia.id,
			Monsters.Lobstrosity.id /* ,
			Monsters.ReanimatedScorpion.id*/
		],
		combatLevel: 7,
		unlocked: true
	},
	{
		// Can be different types under 'Skeleton' in future maybe.
		name: 'Skeleton',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Skeleton mage', "Vet'ion", 'Skogre', 'Skeleton fremennik'],
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
		name: 'Wolf',
		amount: [15, 50],
		weight: 7,
		alternatives: ['Big Wolf', 'Desert Wolf', 'Ice wolf', 'Jungle wolf', 'White wolf'],
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
