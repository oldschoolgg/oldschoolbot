import { Monsters } from 'oldschooljs';
import { SlayerTask } from '../../../types';

const vannakaTasks: SlayerTask[] = [
	{
		name: 'Aberrant spectre',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 8,
		alternatives: ['Deviant Spectre'],
		Id: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		combatLvl: 65,
		slayerLvl: 60,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Abyssal demon',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 5,
		alternatives: ['Abyssal sire', 'Greater abyssal demon'],
		Id: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		combatLvl: 85,
		slayerLvl: 85,
		unlocked: true
	},
	{
		// Dark ankou part of skotizo?
		name: 'Ankou',
		amount: [25, 35],
		extendedAmount: [90, 150],
		weight: 7,
		alternatives: ['Dark Ankou'],
		Id: [Monsters.Ankou.id /* , Monsters.DarkAnkou.id*/],
		combatLvl: 40,
		unlocked: true
	},
	{
		name: 'Banshee',
		amount: [60, 120],
		weight: 6,
		alternatives: ['Twisted Banshee'],
		Id: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLvl: 20,
		slayerLvl: 15,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Basilisk',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 8,
		alternatives: ['Basilisk Knight'],
		Id: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLvl: 40,
		slayerLvl: 40,
		defenceLvl: 20,
		unlocked: true
	},
	{
		name: 'Bloodveld',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 8,
		alternatives: ['Mutated Bloodveld'],
		Id: [Monsters.Bloodveld.id, Monsters.MutatedBloodveld.id],
		combatLvl: 50,
		slayerLvl: 50,
		questPoints: 1,
		unlocked: true
	},
	{
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
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Brine rat',
		amount: [60, 120],
		weight: 7,
		Id: [Monsters.BrineRat.id],
		combatLvl: 45,
		slayerLvl: 47,
		questPoints: 4,
		unlocked: true
	},
	{
		name: 'Bronze Dragon',
		amount: [30, 50],
		weight: 7,
		Id: [Monsters.BronzeDragon.id],
		combatLvl: 75,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Cave bug',
		amount: [10, 20],
		weight: 7,
		Id: [Monsters.CaveBug.id],
		slayerLvl: 7,
		unlocked: true
	},
	{
		name: 'Cave crawler',
		amount: [60, 120],
		weight: 7,
		Id: [Monsters.CaveCrawler.id],
		combatLvl: 10,
		slayerLvl: 10,
		unlocked: true
	},
	{
		name: 'Cave slime',
		amount: [10, 20],
		weight: 7,
		Id: [Monsters.CaveSlime.id],
		combatLvl: 15,
		slayerLvl: 17,
		unlocked: true
	},
	{
		name: 'Cockatrice',
		amount: [60, 120],
		weight: 8,
		Id: [Monsters.Cockatrice.id],
		combatLvl: 25,
		slayerLvl: 25,
		defenceLvl: 20,
		unlocked: true
	},
	{
		name: 'Crawling Hand',
		amount: [60, 120],
		weight: 6,
		Id: [Monsters.CrawlingHand.id],
		slayerLvl: 5,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Crocodile',
		amount: [60, 120],
		weight: 6,
		Id: [Monsters.Crocodile.id],
		combatLvl: 50,
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
		Id: [
			Monsters.Dagannoth.id,
			Monsters.DagannothSpawn.id,
			Monsters.DagganothFledgeling.id,
			Monsters.DagannothSupreme.id,
			Monsters.DagannothRex.id,
			Monsters.DagannothPrime.id
		],
		combatLvl: 75,
		questPoints: 2,
		unlocked: true
	},
	{
		name: 'Dust devil',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 8,
		Id: [Monsters.DustDevil.id],
		combatLvl: 70,
		slayerLvl: 65,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Earth warrior',
		amount: [40, 80],
		weight: 6,
		Id: [Monsters.EarthWarrior.id],
		combatLvl: 35,
		unlocked: true
	},
	{
		name: 'Elf warrior',
		amount: [40, 100],
		weight: 7,
		alternatives: ['Iorwerth Archer', 'Elf Archer', 'Iorwerth Warrior', 'Mourner'],
		Id: [
			Monsters.ElfWarrior.id,
			Monsters.IorwerthArcher.id,
			Monsters.ElfArcher.id,
			Monsters.IorwerthWarrior.id,
			Monsters.Mourner.id
		],
		combatLvl: 70,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Fever spider',
		amount: [60, 120],
		weight: 7,
		Id: [Monsters.FeverSpider.id],
		combatLvl: 40,
		slayerLvl: 42,
		questPoints: 7,
		unlocked: true
	},
	{
		name: 'Fire giant',
		amount: [60, 120],
		weight: 7,
		Id: [Monsters.FireGiant.id],
		combatLvl: 65,
		unlocked: true
	},
	{
		name: 'Gargoyle',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 5,
		alternatives: ['Grotesque Guardians'],
		Id: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLvl: 80,
		slayerLvl: 75,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Ghoul',
		amount: [10, 40],
		weight: 7,
		Id: [Monsters.Ghoul.id],
		combatLvl: 25,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Green dragon',
		amount: [40, 80],
		weight: 6,
		alternatives: ['Baby Green dragon', 'Brutal Green dragon'],
		Id: [Monsters.GreenDragon.id, Monsters.BabyGreenDragon.id, Monsters.BrutalGreenDragon.id],
		combatLvl: 52,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Harpie Bug Swarm',
		amount: [60, 120],
		weight: 8,
		Id: [Monsters.HarpieBugSwarm.id],
		combatLvl: 45,
		slayerLvl: 33,
		firemakingLvl: 33,
		unlocked: true
	},
	{
		// Skeleton dogs summoned by vetion
		name: 'Hellhound',
		amount: [40, 80],
		weight: 7,
		alternatives: ['Cerberus', 'Skeleton Hellhound', 'Greater Skeleton Hellhound'],
		Id: [
			Monsters.Hellhound.id,
			Monsters.Cerberus
				.id /* ,
			Monsters.SkeletonHellhound.id,
			Monsters.GreaterSkeletonHellhound.id */
		],
		combatLvl: 75,
		unlocked: true
	},
	{
		name: 'Hill Giant',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Obor', 'Cyclops'],
		Id: [Monsters.HillGiant.id, Monsters.Obor.id, Monsters.Cyclopse.id],
		combatLvl: 25,
		unlocked: true
	},
	{
		name: 'Hobgoblin',
		amount: [60, 120],
		weight: 7,
		Id: [Monsters.Hobgoblin.id],
		combatLvl: 20,
		unlocked: true
	},
	{
		// Revenant cave in future?
		name: 'Ice giant',
		amount: [40, 80],
		weight: 7,
		Id: [Monsters.IceGiant.id],
		combatLvl: 50,
		unlocked: true
	},
	{
		name: 'Ice warrior',
		amount: [60, 120],
		weight: 7,
		Id: [Monsters.IceWarrior.id],
		combatLvl: 45,
		unlocked: true
	},
	{
		name: 'Infernal Mage',
		amount: [60, 120],
		weight: 8,
		Id: [Monsters.InfernalMage.id],
		combatLvl: 40,
		slayerLvl: 45,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Jelly',
		amount: [60, 120],
		weight: 8,
		alternatives: ['Warped Jelly'],
		Id: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLvl: 57,
		slayerLvl: 52,
		unlocked: true
	},
	{
		name: 'Jungle horror',
		amount: [60, 120],
		weight: 8,
		Id: [Monsters.JungleHorror.id],
		combatLvl: 65,
		questPoints: 11,
		unlocked: true
	},
	{
		name: 'Kalphite worker',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Kalphite soldier', 'Kalphite guardian', 'Kalphite Queen'],
		Id: [
			Monsters.KalphiteWorker.id,
			Monsters.KalphiteSoldier.id,
			Monsters.KalphiteGuardian.id,
			Monsters.KalphiteQueen.id
		],
		combatLvl: 15,
		unlocked: true
	},
	{
		name: 'Killerwatt',
		amount: [30, 80],
		weight: 6,
		Id: [Monsters.Killerwatt.id],
		combatLvl: 50,
		slayerLvl: 37,
		questPoints: 4,
		unlocked: true
	},
	{
		name: 'Kurask',
		amount: [60, 120],
		weight: 7,
		Id: [Monsters.Kurask.id],
		combatLvl: 65,
		slayerLvl: 70,
		unlocked: true
	},
	{
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
		// Revenant cave in future? Kril body guard, count in kril?
		name: 'Lesser demon',
		amount: [60, 120],
		weight: 7,
		alternatives: ["Zakl'n Gritch"],
		Id: [Monsters.LesserDemon.id /* , Monsters.ZaklnGritch.id*/],
		combatLvl: 60,
		unlocked: true
	},
	{
		name: 'Mogre',
		amount: [60, 120],
		weight: 7,
		Id: [Monsters.Mogre.id],
		combatLvl: 30,
		slayerLvl: 32,
		unlocked: true
	},
	{
		name: 'Molanisk',
		amount: [39, 50],
		weight: 7,
		Id: [Monsters.Molanisk.id],
		combatLvl: 50,
		slayerLvl: 39,
		questPoints: 8,
		unlocked: true
	},
	{
		name: 'Moss giant',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Bryophyta'],
		Id: [Monsters.MossGiant.id, Monsters.Bryophyta.id],
		combatLvl: 40,
		unlocked: true
	},
	{
		name: 'Nechryael',
		amount: [60, 120],
		extendedAmount: [200, 250],
		weight: 5,
		alternatives: ['Greater Nechryael'],
		Id: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLvl: 85,
		slayerLvl: 80,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Ogre',
		amount: [60, 120],
		weight: 7,
		alternatives: ['Ogress Shaman', 'Ogress Warrior'],
		Id: [Monsters.Ogre.id, Monsters.OgressShaman.id, Monsters.OgressWarrior.id],
		combatLvl: 40,
		unlocked: true
	},
	{
		name: 'Otherworldly being',
		amount: [60, 120],
		weight: 8,
		Id: [Monsters.Otherworldlybeing.id],
		combatLvl: 40,
		questPoints: 3,
		unlocked: true
	},
	{
		name: 'Pyrefiend',
		amount: [60, 120],
		weight: 8,
		alternatives: ['Pyrelord'],
		Id: [Monsters.Pyrefiend.id, Monsters.Pyrelord.id],
		combatLvl: 25,
		slayerLvl: 30,
		unlocked: true
	},
	{
		name: 'Rockslug',
		amount: [60, 120],
		weight: 7,
		Id: [Monsters.Rockslug.id],
		combatLvl: 20,
		slayerLvl: 20,
		unlocked: true
	},
	{
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
		name: 'Sea Snake Hatchling',
		amount: [60, 120],
		weight: 6,
		alternatives: ['Sea Snake Young'],
		Id: [Monsters.SeaSnakeHatchling.id, Monsters.SeaSnakeYoung.id],
		combatLvl: 50,
		slayerLvl: 40,
		questPoints: 60,
		unlocked: true
	},
	{
		name: 'Shadow warrior',
		amount: [40, 80],
		weight: 8,
		Id: [Monsters.ShadowWarrior.id],
		combatLvl: 57,
		questPoints: 111,
		unlocked: true
	},
	{
		name: 'Spiritual ranger',
		amount: [60, 120],
		extendedAmount: [180, 250],
		weight: 8,
		alternatives: ['Spiritual warrior', 'Spiritual mage'],
		Id: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		combatLvl: 60,
		slayerLvl: 63,
		agiStrLvl: 60,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Terror dog',
		amount: [20, 45],
		weight: 6,
		Id: [Monsters.TerrorDog.id],
		combatLvl: 60,
		slayerLvl: 40,
		questPoints: 3,
		unlocked: true
	},
	{
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
		Id: [Monsters.Turoth.id],
		combatLvl: 60,
		slayerLvl: 55,
		unlocked: true
	},
	{
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
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Wall beast',
		amount: [10, 20],
		weight: 6,
		Id: [Monsters.WallBeast.id],
		combatLvl: 30,
		slayerLvl: 35,
		defenceLvl: 5,
		unlocked: true
	},
	{
		name: 'Werewolf',
		amount: [40, 80],
		weight: 7,
		Id: [Monsters.Werewolf.id],
		combatLvl: 60,
		questPoints: 1,
		unlocked: true
	}
];

export default vannakaTasks;
