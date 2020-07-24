/*
import { Monsters } from 'oldschooljs';
import { Task } from '../../../types';

// Handle extended amounts??
const vannakaTasks: Task[] = [
	{
		// Deviant spectre not added in monsters. Quest locked?
		name: 'Aberrant spectre',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 8,
		alternatives: 'Deviant Spectre',
		Id: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		combatLvl: 65,
		slayerLvl: 60,
		unlocked: true
	},
	{
		// Greater abyssal and abyssal sire not added in monsters.
		name: 'Abyssal demon',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 5,
		alternatives: ['Abyssal sire', 'Greater abyssal demon'],
		Id: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id, Monsters.GreaterAbyssalDemon.id],
		combatLvl: 85,
		slayerLvl: 85,
		unlocked: true
	},
	{
		// Dark ankou not added in monsters.
		name: 'Ankou',
		amount: [25, 35],
		extendedAmount: [90, 150],
		weight: 7,
		alternatives: 'Dark Ankou',
		Id: [Monsters.Ankou.id, Monsters.DarkAnkou.id],
		combatLvl: 40,
		unlocked: true
	},
	{
		// Twisted banshee not added in monsters, quest lock?
		name: 'Banshee',
		amount: [60, 120],
		weight: 6,
		alternatives: 'Twisted Banshee',
		Id: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLvl: 20,
		slayerLvl: 15,
		unlocked: true
	},
	{
		// Defence lvl?
		name: 'Basilisk',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 8,
		alternatives: 'Basilisk Knight',
		Id: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLvl: 40,
		slayerLvl: 40,
		//  defenceLvl: 20,
		unlocked: true
	},
	{
		// Quest lock? Mutaed bloodveld not added in monsters.
		name: 'Bloodveld',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 8,
		alternatives: 'Mutated Bloodveld',
		Id: [Monsters.Bloodveld.id, Monsters.MutatedBloodveld.id],
		combatLvl: 50,
		slayerLvl: 50,
		unlocked: true
	},
	{
		// Quest lock, Baby, Brutal blue dragon not added in monsters.
		name: 'Blue Dragon',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Baby Blue Dragon', 'Brutal Blue Dragon', 'Vorkath'],
		Id: [
			Monsters.BlueDragon.id,
			Monsters.BabyBlueDragon.id,
			Monsters.BrutalBlueDragon.id,
			Monsters.Vorkath.id
		],
		combatLvl: 65,
		unlocked: true
	},
	{
		// Quest lock?
		name: 'Brine rat',
		amount: [60, 120],
		weight: 7,
		Id: Monsters.BrineRat.id,
		combatLvl: 45,
		slayerLvl: 47,
		unlocked: true
	},
	{
		// Quest lock, Not added in monsters.
		name: 'Bronze Dragon',
		amount: [30, 50],
		weight: 7,
		Id: Monsters.BronzeDragon.id,
		combatLvl: 75,
		unlocked: true
	},
	{
		name: 'Cave bug',
		amount: [10, 20],
		weight: 7,
		Id: Monsters.CaveBug.id,
		slayerLvl: 7,
		unlocked: true
	},
	{
		name: 'Cave crawler',
		amount: [60, 120],
		weight: 7,
		Id: Monsters.CaveCrawler.id,
		combatLvl: 10,
		slayerLvl: 10,
		unlocked: true
	},
	{
		name: 'Cave slime',
		amount: [10, 20],
		weight: 7,
		Id: Monsters.CaveSlime.id,
		combatLvl: 15,
		slayerLvl: 17,
		unlocked: true
	},
	{
		// Defencelvl? Not added to monsters.
		name: 'Cockatrice',
		amount: [60, 120],
		weight: 8,
		Id: Monsters.Cockatrice.id,
		combatLvl: 25,
		slayerLvl: 25,
		//  defenceLvl: 20,
		unlocked: true
	},
	{
		// Quest lock?
		name: 'Crawling Hand',
		amount: [60, 120],
		weight: 6,
		Id: Monsters.CrawlingHand.id,
		slayerLvl: 5,
		unlocked: true
	},
	{
		// Not added to monsters.
		name: 'Crocodile',
		amount: [60, 120],
		weight: 6,
		Id: Monsters.Crocodile.id,
		combatLvl: 50,
		unlocked: true
	},
	{
		// Quest lock? Dagannoth spawn and fledgeling not added to monsters.
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
		Id: [
			Monsters.Dagannoth.id,
			Monsters.DagannothSpawn.id,
			Monsters.DagannothFledgeling.id,
			Monsters.DagannothSupreme.id,
			Monsters.DagannothRex.id,
			Monsters.DagannothPrime.id
		],
		combatLvl: 75,
		unlocked: true
	},
	{
		// Quest lock?
		name: 'Dust devil',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 8,
		Id: Monsters.DustDevil.id,
		combatLvl: 70,
		slayerLvl: 65,
		unlocked: true
	},
	{
		// Not added to monsters.
		name: 'Earth warrior',
		amount: [40, 80],
		weight: 6,
		Id: Monsters.EarthWarrior.id,
		combatLvl: 35,
		unlocked: true
	},
	{
		// Quest lock, Most elves not added to monsters.
		name: 'Elf warrior',
		amount: [40, 100],
		weight: 7,
		alternatives: [
			'Iorwerth Archer',
			'Elf Archer',
			'Iorwerth Warrior',
			'Mourner',
			'PrifddinasGuard'
		],
		Id: [
			Monsters.ElfWarrior.id,
			Monsters.IorwerthArcher.id,
			Monsters.ElfArcher.id,
			Monsters.IorwerthWarrior.id,
			Monsters.Mourner.id,
			Monsters.PrifddinasGuard.id
		],
		combatLvl: 70,
		unlocked: true
	},
	{
		// Quest lock, not added to monsters.
		name: 'Fever spider',
		amount: [60, 120],
		weight: 7,
		Id: Monsters.FeverSpider.id,
		combatLvl: 40,
		slayerLvl: 42,
		unlocked: true
	},
	{
		name: 'Fire giant',
		amount: [60, 120],
		weight: 7,
		Id: Monsters.FireGiant.id,
		combatLvl: 65,
		unlocked: true
	},
	{
		// Quest lock?, Grotesque Guardians not added to monsters.
		name: 'Gargoyle',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 5,
		alternatives: 'Grotesque Guardians',
		Id: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLvl: 80,
		slayerLvl: 75,
		unlocked: true
	},
	{
		// Not added in monsters. Quest lock?
		name: 'Ghoul',
		amount: [10, 40],
		weight: 7,
		Id: Monsters.Ghoul.id,
		combatLvl: 25,
		unlocked: true
	},
	{
		// No green dragons added in monsters. Quest lock?
		name: 'Green dragon',
		amount: [40, 80],
		weight: 6,
		alternatives: ['Baby Green dragon', 'Brutal Green dragon'],
		Id: [Monsters.GreenDragon.id, Monsters.BabyGreenDragon.id, Monsters.BrutalGreenDragon.id],
		combatLvl: 52,
		unlocked: true
	},
	{
		// Not added in monsters. Firemaking?
		name: 'Harpie Bug Swarm',
		amount: [60, 120],
		weight: 8,
		Id: Monsters.HarpieBugSwarm.id,
		combatLvl: 45,
		slayerLvl: 33,
		//  firemakingLvl: 33,
		unlocked: true
	},
	{
		// Revenant cave?, Not added in monsters, Cerberus unlocked??
		name: 'Hellhound',
		amount: [40, 80],
		weight: 7,
		alternatives: ['Cerberus', 'Skeleton Hellhound', 'Greater Skeleton Hellhound'],
		Id: [
			Monsters.Hellhound.id,
			Monsters.Cerberus.id,
			Monsters.SkeletonHellhound.id,
			Monsters.GreaterSkeletonHellhound.id
		],
		combatLvl: 75,
		unlocked: true
	},
	{
		// Not added in monsters.
		name: 'Hill Giant',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Obor', 'Cyclops'],
		Id: [Monsters.HillGiant.id, Monsters.Obor.id, Monsters.Cyclops.id],
		combatLvl: 25,
		unlocked: true
	},
	{
		// Not added in monsters.
		name: 'Hobgoblin',
		amount: [60, 120],
		weight: 7,
		Id: Monsters.Hobgoblin.id,
		combatLvl: 20,
		unlocked: true
	},
	{
		// Revenant cave?, Not added in monsters
		name: 'Ice giant',
		amount: [40, 80],
		weight: 7,
		Id: Monsters.IceGiant.id,
		combatLvl: 50,
		unlocked: true
	},
	{
		// Not added in monsters.
		name: 'Ice warrior',
		amount: [60, 120],
		weight: 7,
		Id: Monsters.IceWarrior.id,
		combatLvl: 45,
		unlocked: true
	},
	{
		// Not added in monsters. Quest lock?
		name: 'Infernal Mage',
		amount: [60, 120],
		weight: 8,
		Id: Monsters.InfernalMage.id,
		combatLvl: 40,
		slayerLvl: 45,
		unlocked: true
	},
	{
		// Not added in monsters.
		name: 'Jelly',
		amount: [60, 120],
		weight: 8,
		alternatives: 'Warped Jelly',
		Id: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLvl: 57,
		slayerLvl: 52,
		unlocked: true
	},
	{
		// Not added in monsters. Quest locked.
		name: 'Jungle horror',
		amount: [60, 120],
		weight: 8,
		Id: Monsters.JungleHorror.id,
		combatLvl: 65,
		unlocked: true
	},
	{
		// KalphSolider and Guardian not added in monsters.
		name: 'Kalphite worker',
		amount: [60, 120],
		weight: 7,
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
		// Not added in monsters. Quest lock?
		name: 'Killerwatt',
		amount: [30, 80],
		weight: 6,
		Id: Monsters.Killerwatt.id,
		combatLvl: 50,
		slayerLvl: 37,
		unlocked: true
	},
	{
		name: 'Kurask',
		amount: [60, 120],
		weight: 7,
		Id: Monsters.Kurask.id,
		combatLvl: 65,
		slayerLvl: 70,
		unlocked: true
	},
	{
		// Sulphur locked behind 44 slayer, All not added in monsters.
		name: 'Lizard',
		amount: [60, 120],
		weight: 7,
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
		// Revenant cave? ,Not added in monsters
		name: 'Lesser demon',
		amount: [60, 120],
		weight: 7,
		alternatives: "Zakl'n Gritch",
		Id: [Monsters.LesserDemon.id, Monsters.ZaklnGritch.id],
		combatLvl: 60,
		unlocked: true
	},
	{
		// Not added in monsters. Quest lock?
		name: 'Mogre',
		amount: [60, 120],
		weight: 7,
		Id: Monsters.Mogre.id,
		combatLvl: 30,
		slayerLvl: 32,
		unlocked: true
	},
	{
		// Not added in monsters. Quest lock?
		name: 'Molanisk',
		amount: [39, 50],
		weight: 7,
		Id: Monsters.Molanisk.id,
		combatLvl: 50,
		slayerLvl: 39,
		unlocked: true
	},
	{
		// Wildy? Not added in monsters
		name: 'Moss giant',
		amount: [60, 120],
		weight: 7,
		alternatives: 'Bryophyta',
		Id: [Monsters.MossGiant.id, Monsters.Bryophyta.id],
		combatLvl: 40,
		unlocked: true
	},
	{
		// Greater Nechryael not added in monsters, Quest lock?
		name: 'Nechryael',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 5,
		alternatives: 'Greater Nechryael',
		Id: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLvl: 85,
		slayerLvl: 80,
		unlocked: true
	},
	{
		// Not added in monsters
		name: 'Ogre',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Ogress Shaman', 'Ogress Warrior'],
		Id: [Monsters.Ogre.id, Monsters.OgressShaman.id, Monsters.OgressWarrior.id],
		combatLvl: 40,
		unlocked: true
	},
	{
		// Not added in monsters. Quest lock?
		name: 'Otherworldly being',
		amount: [60, 120],
		weight: 8,
		Id: Monsters.OtherworldlyBeing.id,
		combatLvl: 40,
		unlocked: true
	},
	{
		// Not added in monsters.
		name: 'Pyrefiend',
		amount: [60, 120],
		weight: 8,
		Id: Monsters.Pyrefiend.id,
		combatLvl: 25,
		slayerLvl: 30,
		unlocked: true
	},
	{
		// Not added in monsters.
		name: 'Rockslug',
		amount: [60, 120],
		weight: 7,
		Id: Monsters.Rockslug.id,
		combatLvl: 20,
		slayerLvl: 20,
		unlocked: true
	},
	{
		// None of the shades added in monsters.
		name: 'Shade',
		amount: [60, 120],
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
		// Not added in monsters. Quest lock
		name: 'Sea Snake',
		amount: [60, 120],
		weight: 6,
		alternatives: ['Sea Snake Hatchling', 'Sea Snake Young'],
		Id: [Monsters.SeaSnake.id, Monsters.SeaSnakeHatchling.id, Monsters.SeaSnakeYoung.id],
		combatLvl: 50,
		slayerLvl: 40,
		unlocked: true
	},
	{
		// Not added in monsters. Quest lock
		name: 'Shadow warrior',
		amount: [40, 80],
		weight: 8,
		Id: Monsters.ShadowWarrior.id,
		combatLvl: 60,
		unlocked: true
	},
	{
		// Agility/Strength lock in future? Quest lock? Different slayer lvls for warrior(68) and mage(83).
		name: 'Spiritual ranger',
		amount: [60, 120],
		extendedAmount: [180, 250],
		weight: 8,
		alternatives: ['Spiritual warrior', 'Spiritual mage'],
		Id: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		combatLvl: 60,
		slayerLvl: 63,
		unlocked: true
	},
	{
		// Not added in monsters. Quest lock
		name: 'Terror dog',
		amount: [20, 45],
		weight: 6,
		Id: Monsters.TerrorDog.id,
		combatLvl: 60,
		slayerLvl: 40,
		unlocked: true
	},
	{
		// Ice troll and troll general Not added in monsters.
		name: 'Mountain troll',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Ice troll', 'Troll general'],
		Id: [Monsters.MountainTroll.id, Monsters.IceTroll.id, Monsters.TrollGeneral.id],
		combatLvl: 60,
		unlocked: true
	},
	{
		name: 'Turoth',
		amount: [60, 120],
		weight: 8,
		Id: Monsters.Turoth.id,
		combatLvl: 60,
		slayerLvl: 55,
		unlocked: true
	},
	{
		// No Vampyres added in monsters. Quest lock?
		name: 'Feral Vampyre',
		amount: [10, 20],
		extendedAmount: [200, 250],
		weight: 7,
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
		// Defence lvl?
		name: 'Wall beast',
		amount: [10, 20],
		weight: 6,
		Id: Monsters.WallBeast.id,
		combatLvl: 30,
		slayerLvl: 35,
		//	defenceLvl: 5,
		unlocked: true
	},
	{
		// Not added to monsters. Quest lock.
		name: 'Werewolf',
		amount: [40, 80],
		weight: 7,
		Id: Monsters.WereWolf.id,
		combatLvl: 60,
		unlocked: true
	}
];

export default vannakaTasks;
*/
