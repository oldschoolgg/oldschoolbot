import { Monsters } from 'oldschooljs';

import { AssignableSlayerTask } from '../types';

export const vannakaTasks: AssignableSlayerTask[] = [
	{
		name: 'Aberrant spectre',
		amount: [60, 120],

		weight: 8,
		alternatives: ['Deviant Spectre'],
		id: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		combatLevel: 65,
		slayerLevel: 60,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Abyssal demon',
		amount: [60, 120],

		weight: 5,
		alternatives: ['Abyssal sire'],
		id: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		combatLevel: 85,
		slayerLevel: 85,
		unlocked: true
	},
	{
		name: 'Ankou',
		amount: [25, 35],
		weight: 7,
		id: [Monsters.Ankou.id],
		combatLevel: 40,
		unlocked: true
	},
	{
		name: 'Banshee',
		amount: [60, 120],
		weight: 6,
		alternatives: ['Twisted Banshee'],
		id: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLevel: 20,
		slayerLevel: 15,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Basilisk',
		amount: [60, 120],

		weight: 8,
		alternatives: ['Basilisk Knight'],
		id: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLevel: 40,
		slayerLevel: 40,
		unlocked: true
	},
	{
		name: 'Bloodveld',
		amount: [60, 120],

		weight: 8,
		alternatives: ['Mutated Bloodveld'],
		id: [Monsters.Bloodveld.id, Monsters.MutatedBloodveld.id],
		combatLevel: 50,
		slayerLevel: 50,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Blue Dragon',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Baby Blue Dragon', 'Brutal Blue Dragon', 'Vorkath'],
		id: [
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
		name: 'Brine rat',
		amount: [60, 120],
		weight: 7,
		id: [Monsters.BrineRat.id],
		combatLevel: 45,
		slayerLevel: 47,
		questPoints: 4,
		unlocked: true
	},
	{
		name: 'Bronze Dragon',
		amount: [30, 50],
		weight: 7,
		id: [Monsters.BronzeDragon.id],
		combatLevel: 75,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Cave bug',
		amount: [10, 20],
		weight: 7,
		id: [Monsters.CaveBug.id],
		slayerLevel: 7,
		unlocked: true
	},
	{
		name: 'Cave crawler',
		amount: [60, 120],
		weight: 7,
		id: [Monsters.CaveCrawler.id],
		combatLevel: 10,
		slayerLevel: 10,
		unlocked: true
	},
	{
		name: 'Cave slime',
		amount: [10, 20],
		weight: 7,
		id: [Monsters.CaveSlime.id],
		combatLevel: 15,
		slayerLevel: 17,
		unlocked: true
	},
	{
		name: 'Cockatrice',
		amount: [60, 120],
		weight: 8,
		id: [Monsters.Cockatrice.id],
		combatLevel: 25,
		slayerLevel: 25,
		unlocked: true
	},
	{
		name: 'Crawling Hand',
		amount: [60, 120],
		weight: 6,
		id: [Monsters.CrawlingHand.id],
		slayerLevel: 5,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Crocodile',
		amount: [60, 120],
		weight: 6,
		id: [Monsters.Crocodile.id],
		combatLevel: 50,
		unlocked: true
	},
	{
		name: 'Dagannoth',
		amount: [60, 120],
		weight: 7,
		alternatives: [
			'Dagannoth spawn',
			'Dagannoth fledgeling',
			'Dagannoth Supreme',
			'Dagannoth Rex',
			'Dagannoth Prime'
		],
		id: [
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
		name: 'Dust devil',
		amount: [60, 120],

		weight: 8,
		id: [Monsters.DustDevil.id],
		combatLevel: 70,
		slayerLevel: 65,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Earth warrior',
		amount: [40, 80],
		weight: 6,
		id: [Monsters.EarthWarrior.id],
		combatLevel: 35,
		unlocked: true
	},
	{
		name: 'Elf warrior',
		amount: [40, 100],
		weight: 7,
		alternatives: ['Iorwerth Archer', 'Elf Archer', 'Iorwerth Warrior', 'Mourner'],
		id: [
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
		name: 'Fever spider',
		amount: [60, 120],
		weight: 7,
		id: [Monsters.FeverSpider.id],
		combatLevel: 40,
		slayerLevel: 42,
		questPoints: 7,
		unlocked: true
	},
	{
		name: 'Fire giant',
		amount: [60, 120],
		weight: 7,
		id: [Monsters.FireGiant.id],
		combatLevel: 65,
		unlocked: true
	},
	{
		name: 'Gargoyle',
		amount: [60, 120],

		weight: 5,
		alternatives: ['Grotesque Guardians'],
		id: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLevel: 80,
		slayerLevel: 75,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Ghoul',
		amount: [10, 40],
		weight: 7,
		id: [Monsters.Ghoul.id],
		combatLevel: 25,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Green dragon',
		amount: [40, 80],
		weight: 6,
		alternatives: ['Baby Green dragon', 'Brutal Green dragon'],
		id: [Monsters.GreenDragon.id, Monsters.BabyGreenDragon.id, Monsters.BrutalGreenDragon.id],
		combatLevel: 52,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Harpie Bug Swarm',
		amount: [60, 120],
		weight: 8,
		id: [Monsters.HarpieBugSwarm.id],
		combatLevel: 45,
		slayerLevel: 33,
		unlocked: true
	},
	{
		// Skeleton dogs summoned by vetion
		name: 'Hellhound',
		amount: [40, 80],
		weight: 7,
		alternatives: ['Cerberus', "Vet'ion"],
		id: [
			Monsters.Hellhound.id,
			Monsters.Cerberus
				.id /* ,
			Monsters.SkeletonHellhound.id,
			Monsters.GreaterSkeletonHellhound.id */
		],
		combatLevel: 75,
		unlocked: true
	},
	{
		name: 'Hill Giant',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Obor', 'Cyclops'],
		id: [Monsters.HillGiant.id, Monsters.Obor.id, Monsters.Cyclops.id],
		combatLevel: 25,
		unlocked: true
	},
	{
		name: 'Hobgoblin',
		amount: [60, 120],
		weight: 7,
		id: [Monsters.Hobgoblin.id],
		combatLevel: 20,
		unlocked: true
	},
	{
		// Revenant cave in future?
		name: 'Ice giant',
		amount: [40, 80],
		weight: 7,
		id: [Monsters.IceGiant.id],
		combatLevel: 50,
		unlocked: true
	},
	{
		name: 'Ice warrior',
		amount: [60, 120],
		weight: 7,
		id: [Monsters.IceWarrior.id],
		combatLevel: 45,
		unlocked: true
	},
	{
		name: 'Infernal Mage',
		amount: [60, 120],
		weight: 8,
		id: [Monsters.InfernalMage.id],
		combatLevel: 40,
		slayerLevel: 45,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Jelly',
		amount: [60, 120],
		weight: 8,
		alternatives: ['Warped Jelly'],
		id: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLevel: 57,
		slayerLevel: 52,
		unlocked: true
	},
	{
		name: 'Jungle horror',
		amount: [60, 120],
		weight: 8,
		id: [Monsters.JungleHorror.id],
		combatLevel: 65,
		questPoints: 11,
		unlocked: true
	},
	{
		name: 'Kalphite worker',
		amount: [60, 120],
		weight: 7,
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
		name: 'Killerwatt',
		amount: [30, 80],
		weight: 6,
		id: [Monsters.Killerwatt.id],
		combatLevel: 50,
		slayerLevel: 37,
		questPoints: 4,
		unlocked: true
	},
	{
		name: 'Kurask',
		amount: [60, 120],
		weight: 7,
		id: [Monsters.Kurask.id],
		combatLevel: 65,
		slayerLevel: 70,
		unlocked: true
	},
	{
		name: 'Lizard',
		amount: [60, 120],
		weight: 7,
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
		// Revenant cave in future? Kril body guard, count in kril?
		name: 'Lesser demon',
		amount: [60, 120],
		weight: 7,
		//		alternatives: ["Zakl'n Gritch"],
		id: [Monsters.LesserDemon.id /* , Monsters.ZaklnGritch.id*/],
		combatLevel: 60,
		unlocked: true
	},
	{
		name: 'Mogre',
		amount: [60, 120],
		weight: 7,
		id: [Monsters.Mogre.id],
		combatLevel: 30,
		slayerLevel: 32,
		unlocked: true
	},
	{
		name: 'Molanisk',
		amount: [39, 50],
		weight: 7,
		id: [Monsters.Molanisk.id],
		combatLevel: 50,
		slayerLevel: 39,
		questPoints: 8,
		unlocked: true
	},
	{
		name: 'Moss giant',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Bryophyta'],
		id: [Monsters.MossGiant.id, Monsters.Bryophyta.id],
		combatLevel: 40,
		unlocked: true
	},
	{
		name: 'Nechryael',
		amount: [60, 120],

		weight: 5,
		alternatives: ['Greater Nechryael'],
		id: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLevel: 85,
		slayerLevel: 80,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Ogre',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Ogress Shaman', 'Ogress Warrior'],
		id: [Monsters.Ogre.id, Monsters.OgressShaman.id, Monsters.OgressWarrior.id],
		combatLevel: 40,
		unlocked: true
	},
	{
		name: 'Otherworldly being',
		amount: [60, 120],
		weight: 8,
		id: [Monsters.Otherworldlybeing.id],
		combatLevel: 40,
		questPoints: 3,
		unlocked: true
	},
	{
		name: 'Pyrefiend',
		amount: [60, 120],
		weight: 8,
		id: [Monsters.Pyrefiend.id],
		combatLevel: 25,
		slayerLevel: 30,
		unlocked: true
	},
	{
		name: 'Rockslug',
		amount: [60, 120],
		weight: 7,
		id: [Monsters.Rockslug.id],
		combatLevel: 20,
		slayerLevel: 20,
		unlocked: true
	},
	{
		name: 'Shade',
		amount: [60, 120],
		weight: 8,
		alternatives: ['Loar Shade', 'Phrin Shade', 'Riyl Shade', 'Asyn Shade', 'Fiyr Shade'],
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
		name: 'Sea Snake Hatchling',
		amount: [60, 120],
		weight: 6,
		alternatives: ['Sea Snake Young'],
		id: [Monsters.SeaSnakeHatchling.id, Monsters.SeaSnakeYoung.id],
		combatLevel: 50,
		slayerLevel: 40,
		questPoints: 60,
		unlocked: true
	},
	{
		name: 'Shadow warrior',
		amount: [40, 80],
		weight: 8,
		id: [Monsters.ShadowWarrior.id],
		combatLevel: 57,
		questPoints: 111,
		unlocked: true
	},
	{
		name: 'Spiritual ranger',
		amount: [60, 120],
		weight: 8,
		alternatives: ['Spiritual warrior', 'Spiritual mage'],
		id: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		combatLevel: 60,
		slayerLevel: 63,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Terror dog',
		amount: [20, 45],
		weight: 6,
		id: [Monsters.TerrorDog.id],
		combatLevel: 60,
		slayerLevel: 40,
		questPoints: 3,
		unlocked: true
	},
	{
		name: 'Mountain troll',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Ice troll', 'Troll general'],
		id: [Monsters.MountainTroll.id, Monsters.IceTroll.id, Monsters.TrollGeneral.id],
		combatLevel: 60,
		unlocked: true
	},
	{
		name: 'Turoth',
		amount: [60, 120],
		weight: 8,
		id: [Monsters.Turoth.id],
		combatLevel: 60,
		slayerLevel: 55,
		unlocked: true
	},
	{
		name: 'Feral Vampyre',
		amount: [10, 20],

		weight: 7,
		alternatives: ['Vampyre Juvinate', 'Vyrewatch', 'Vyrewatch Sentinel'],
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
		name: 'Wall beast',
		amount: [10, 20],
		weight: 6,
		id: [Monsters.WallBeast.id],
		combatLevel: 30,
		slayerLevel: 35,
		unlocked: true
	},
	{
		name: 'Werewolf',
		amount: [40, 80],
		weight: 7,
		id: [Monsters.Werewolf.id],
		combatLevel: 60,
		questPoints: 1,
		unlocked: true
	}
];
