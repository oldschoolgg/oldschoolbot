import { Monsters } from 'oldschooljs';

import DagannothKings from '../../minions/data/killableMonsters/bosses/groups/DagannothKings';
import { AssignableSlayerTask } from '../types';

export const vannakaTasks: AssignableSlayerTask[] = [
	{
		monster: Monsters.AberrantSpectre,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		combatLevel: 65,
		slayerLevel: 60,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.AbyssalDemon,
		amount: [60, 120],
		weight: 5,
		monsters: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		combatLevel: 85,
		slayerLevel: 85,
		unlocked: true
	},
	{
		monster: Monsters.Ankou,
		amount: [25, 35],
		weight: 7,
		monsters: [Monsters.Ankou.id],
		combatLevel: 40,
		unlocked: true
	},
	{
		monster: Monsters.Banshee,
		amount: [60, 120],
		weight: 6,
		monsters: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLevel: 20,
		slayerLevel: 15,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Basilisk,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLevel: 40,
		slayerLevel: 40,
		unlocked: true
	},
	{
		monster: Monsters.Bloodveld,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.Bloodveld.id, Monsters.MutatedBloodveld.id],
		combatLevel: 50,
		slayerLevel: 50,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.BlueDragon,
		amount: [60, 120],
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
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.BrineRat.id],
		combatLevel: 45,
		slayerLevel: 47,
		questPoints: 4,
		unlocked: true
	},
	{
		monster: Monsters.BronzeDragon,
		amount: [10, 20],
		weight: 7,
		monsters: [Monsters.BronzeDragon.id],
		combatLevel: 75,
		questPoints: 34,
		unlocked: true
	},
	{
		monster: Monsters.CaveBug,
		amount: [10, 20],
		weight: 7,
		monsters: [Monsters.CaveBug.id],
		slayerLevel: 7,
		unlocked: true
	},
	{
		monster: Monsters.CaveCrawler,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.CaveCrawler.id],
		combatLevel: 10,
		slayerLevel: 10,
		unlocked: true
	},
	{
		monster: Monsters.CaveSlime,
		amount: [10, 20],
		weight: 7,
		monsters: [Monsters.CaveSlime.id],
		combatLevel: 15,
		slayerLevel: 17,
		unlocked: true
	},
	{
		monster: Monsters.Cockatrice,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.Cockatrice.id],
		combatLevel: 25,
		slayerLevel: 25,
		unlocked: true
	},
	{
		monster: Monsters.CrawlingHand,
		amount: [60, 120],
		weight: 6,
		monsters: [Monsters.CrawlingHand.id],
		slayerLevel: 5,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Crocodile,
		amount: [60, 120],
		weight: 6,
		monsters: [Monsters.Crocodile.id],
		combatLevel: 50,
		unlocked: true
	},
	{
		monster: Monsters.Dagannoth,
		amount: [60, 120],
		weight: 7,
		monsters: [
			Monsters.Dagannoth.id,
			Monsters.DagannothSpawn.id,
			Monsters.DaganothFledgeling.id,
			Monsters.DagannothSupreme.id,
			Monsters.DagannothRex.id,
			Monsters.DagannothPrime.id,
			DagannothKings.id
		],
		combatLevel: 75,
		questPoints: 2,
		unlocked: true
	},
	{
		monster: Monsters.DustDevil,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.DustDevil.id],
		combatLevel: 70,
		slayerLevel: 65,
		questPoints: 12,
		unlocked: true
	},
	{
		monster: Monsters.EarthWarrior,
		amount: [40, 80],
		weight: 6,
		monsters: [Monsters.EarthWarrior.id],
		combatLevel: 35,
		unlocked: true
	},
	{
		monster: Monsters.ElfWarrior,
		amount: [40, 100],
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
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.FeverSpider.id],
		combatLevel: 40,
		slayerLevel: 42,
		questPoints: 7,
		unlocked: true
	},
	{
		monster: Monsters.FireGiant,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.FireGiant.id],
		combatLevel: 65,
		unlocked: true
	},
	{
		monster: Monsters.Gargoyle,
		amount: [60, 120],
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
		monster: Monsters.GreenDragon,
		amount: [40, 80],
		weight: 6,
		monsters: [Monsters.GreenDragon.id, Monsters.BabyGreenDragon.id, Monsters.BrutalGreenDragon.id],
		combatLevel: 52,
		questPoints: 34,
		unlocked: true
	},
	{
		monster: Monsters.HarpieBugSwarm,
		amount: [60, 120],
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
		amount: [40, 80],
		weight: 7,
		monsters: [Monsters.Hellhound.id, Monsters.Cerberus.id],
		combatLevel: 75,
		unlocked: true
	},
	{
		monster: Monsters.HillGiant,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.HillGiant.id, Monsters.Obor.id, Monsters.Cyclops.id],
		combatLevel: 25,
		unlocked: true
	},
	{
		monster: Monsters.Hobgoblin,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.Hobgoblin.id],
		combatLevel: 20,
		unlocked: true
	},
	{
		monster: Monsters.IceGiant,
		amount: [40, 80],
		weight: 7,
		monsters: [Monsters.IceGiant.id],
		combatLevel: 50,
		unlocked: true
	},
	{
		monster: Monsters.IceWarrior,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.IceWarrior.id],
		combatLevel: 45,
		unlocked: true
	},
	{
		monster: Monsters.InfernalMage,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.InfernalMage.id],
		combatLevel: 40,
		slayerLevel: 45,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Jelly,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLevel: 57,
		slayerLevel: 52,
		unlocked: true
	},
	{
		monster: Monsters.JungleHorror,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.JungleHorror.id],
		combatLevel: 65,
		questPoints: 11,
		unlocked: true
	},
	{
		monster: Monsters.KalphiteWorker,
		amount: [60, 120],
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
		monster: Monsters.Killerwatt,
		amount: [30, 80],
		weight: 6,
		monsters: [Monsters.Killerwatt.id],
		combatLevel: 50,
		slayerLevel: 37,
		questPoints: 4,
		unlocked: true
	},
	{
		monster: Monsters.Kurask,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.Kurask.id],
		combatLevel: 65,
		slayerLevel: 70,
		unlocked: true
	},
	{
		monster: Monsters.Lizard,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.Lizard.id, Monsters.SmallLizard.id, Monsters.DesertLizard.id, Monsters.SulphurLizard.id],
		slayerLevel: 22,
		unlocked: true
	},
	{
		monster: Monsters.LesserDemon,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.LesserDemon.id],
		combatLevel: 60,
		unlocked: true
	},
	{
		monster: Monsters.Mogre,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.Mogre.id],
		combatLevel: 30,
		slayerLevel: 32,
		unlocked: true
	},
	{
		monster: Monsters.Molanisk,
		amount: [39, 50],
		weight: 7,
		monsters: [Monsters.Molanisk.id],
		combatLevel: 50,
		slayerLevel: 39,
		questPoints: 8,
		unlocked: true
	},
	{
		monster: Monsters.MossGiant,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.MossGiant.id, Monsters.Bryophyta.id],
		combatLevel: 40,
		unlocked: true
	},
	{
		monster: Monsters.Nechryael,
		amount: [60, 120],
		weight: 5,
		monsters: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLevel: 85,
		slayerLevel: 80,
		questPoints: 1,
		unlocked: true
	},
	{
		monster: Monsters.Ogre,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.Ogre.id, Monsters.OgressShaman.id, Monsters.OgressWarrior.id],
		combatLevel: 40,
		unlocked: true
	},
	{
		monster: Monsters.Otherworldlybeing,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.Otherworldlybeing.id],
		combatLevel: 40,
		questPoints: 3,
		unlocked: true
	},
	{
		monster: Monsters.Pyrefiend,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.Pyrefiend.id, Monsters.Pyrelord.id],
		combatLevel: 25,
		slayerLevel: 30,
		unlocked: true
	},
	{
		monster: Monsters.Rockslug,
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.Rockslug.id],
		combatLevel: 20,
		slayerLevel: 20,
		unlocked: true
	},
	{
		monster: Monsters.Shade,
		amount: [60, 120],
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
		amount: [60, 120],
		weight: 6,
		monsters: [Monsters.SeaSnakeHatchling.id, Monsters.SeaSnakeYoung.id],
		combatLevel: 50,
		slayerLevel: 40,
		questPoints: 60,
		unlocked: true
	},
	{
		monster: Monsters.ShadowWarrior,
		amount: [40, 80],
		weight: 8,
		monsters: [Monsters.ShadowWarrior.id],
		combatLevel: 57,
		questPoints: 111,
		unlocked: true
	},
	{
		monster: Monsters.SpiritualMage,
		amount: [110, 170],

		weight: 12,
		monsters: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		levelRequirements: {
			slayer: 60
		},
		combatLevel: 60,
		slayerLevel: 63,
		questPoints: 3,
		unlocked: true,
		dontAssign: true
	},
	{
		monster: Monsters.SpiritualRanger,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		levelRequirements: {
			slayer: 60
		},
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
		amount: [60, 120],
		weight: 7,
		monsters: [Monsters.MountainTroll.id, Monsters.IceTroll.id, Monsters.TrollGeneral.id],
		combatLevel: 60,
		unlocked: true
	},
	{
		monster: Monsters.Turoth,
		amount: [60, 120],
		weight: 8,
		monsters: [Monsters.Turoth.id],
		combatLevel: 60,
		slayerLevel: 55,
		unlocked: true
	},
	{
		monster: Monsters.FeralVampyre,
		amount: [10, 20],
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
		monster: Monsters.WallBeast,
		amount: [10, 20],
		weight: 6,
		monsters: [Monsters.WallBeast.id],
		combatLevel: 30,
		slayerLevel: 35,
		unlocked: true
	},
	{
		monster: Monsters.Werewolf,
		amount: [40, 80],
		weight: 7,
		monsters: [Monsters.Werewolf.id],
		combatLevel: 60,
		questPoints: 1,
		unlocked: true
	}
];
