/*
import { Monsters } from 'oldschooljs';
import { Task } from '../../../types';

// Handle extended amounts??
const chaeldarTasks: Task[] = [
	{
		// Deviant spectre not added in monsters. Quest locked.
		name: 'Aberrant spectre',
		amount: [110, 170],
		extendedAmount: [200, 250],
		weight: 8,
		alternatives: 'Deviant Spectre',
		Id: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		combatLvl: 65,
		slayerLvl: 60,
		unlocked: true
	},
	{
		// Greater abyssal and abyssal sire not added in monsters. Quest locked.
		name: 'Abyssal demon',
		amount: [110, 170],
		extendedAmount: [200, 250],
		weight: 12,
		alternatives: ['Abyssal sire', 'Greater abyssal demon'],
		Id: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id, Monsters.GreaterAbyssalDemon.id],
		combatLvl: 85,
		slayerLvl: 85,
		unlocked: true
	},
	{
		// Agility/Strength lock in future? Count Kreeerra guards?
		name: 'Aviansie',
		amount: [110, 170],
		extendedAmount: [130, 250],
		weight: 9,
		alternatives: "Kree'arra",
		Id: [Monsters.Aviansie.id, Monsters.Kreearra.id],
		unlocked: false
	},
	{
		// Twisted banshee not added in monsters, quest lock.
		name: 'Banshee',
		amount: [110, 170],
		weight: 5,
		alternatives: 'Twisted Banshee',
		Id: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLvl: 20,
		slayerLvl: 15,
		unlocked: true
	},
	{
		// Defence lvl?
		name: 'Basilisk',
		amount: [110, 170],
		extendedAmount: [200, 250],
		weight: 7,
		alternatives: 'Basilisk Knight',
		Id: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLvl: 40,
		slayerLvl: 40,
		//  defenceLvl: 20,
		unlocked: true
	},
	{
		// Some demons not added in monsters.
		name: 'Black Demon',
		amount: [110, 170],
		extendedAmount: [200, 250],
		weight: 10,
		alternatives: ['Demonic Gorilla', 'Balfrug Kreeyath', 'Porazdir', 'Skotizo'],
		Id: [
			Monsters.BlackDemon.id,
			Monsters.DemonicGorilla.id,
			Monsters.BalfrugKreeyath.id,
			Monsters.Porazdir.id,
			Monsters.Skotizo.id
		],
		combatLvl: 80,
		unlocked: true
	},
	{
		// Quest lock. Mutaed bloodveld not added in monsters.
		name: 'Bloodveld',
		amount: [110, 170],
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
		amount: [110, 170],
		weight: 8,
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
		amount: [110, 170],
		weight: 7,
		Id: Monsters.BrineRat.id,
		combatLvl: 45,
		slayerLvl: 47,
		unlocked: true
	},
	{
		// Quest lock, Not added in monsters.
		name: 'Bronze Dragon',
		amount: [10, 20],
		extendedAmount: [30, 50],
		weight: 11,
		Id: Monsters.BronzeDragon.id,
		combatLvl: 75,
		unlocked: true
	},
	{
		name: 'Cave crawler',
		amount: [110, 170],
		weight: 5,
		Id: Monsters.CaveCrawler.id,
		combatLvl: 10,
		slayerLvl: 10,
		unlocked: true
	},
	{
		// Quest lock
		name: 'Cave horror',
		amount: [110, 170],
		extendedAmount: [200, 250],
		weight: 10,
		Id: Monsters.CaveHorror.id,
		combatLvl: 85,
		slayerLvl: 58,
		unlocked: true
	},
	{
		// Kraken not added to monsters, Magelvl?
		name: 'Cave kraken',
		amount: [30, 50],
		extendedAmount: [150, 200],
		weight: 12,
		alternatives: 'Kraken',
		Id: [Monsters.CaveKraken.id, Monsters.Kraken.id],
		combatLvl: 80,
		slayerLvl: 87,
		//  mageLvl: 50,
		unlocked: true
	},
	{
		name: 'Cave slime',
		amount: [10, 20],
		weight: 6,
		Id: Monsters.CaveSlime.id,
		combatLvl: 15,
		slayerLvl: 17,
		unlocked: true
	},
	{
		// Defencelvl? Not added to monsters.
		name: 'Cockatrice',
		amount: [110, 170],
		weight: 6,
		Id: Monsters.Cockatrice.id,
		combatLvl: 25,
		slayerLvl: 25,
		//  defenceLvl: 20,
		unlocked: true
	},
	{
		// Quest lock. Dagannoth spawn and fledgeling not added to monsters.
		name: 'Dagannoth',
		amount: [110, 170],
		weight: 11,
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
		// Quest lock.
		name: 'Dust devil',
		amount: [110, 170],
		extendedAmount: [200, 250],
		weight: 9,
		Id: Monsters.DustDevil.id,
		combatLvl: 70,
		slayerLvl: 65,
		unlocked: true
	},
	{
		// Quest lock, Most elves not added to monsters.
		name: 'Elf warrior',
		amount: [110, 170],
		weight: 8,
		alternatives: [
			'Iorwerth Archer',
			'Elf Archer',
			'Iorwerth Warrior',
			'Mourner',
			'PrifddinasGuard',
			'Reanimated elf'
		],
		Id: [
			Monsters.ElfWarrior.id,
			Monsters.IorwerthArcher.id,
			Monsters.ElfArcher.id,
			Monsters.IorwerthWarrior.id,
			Monsters.Mourner.id,
			Monsters.PrifddinasGuard.id,
			Monsters.ReanimatedElf.id
		],
		combatLvl: 70,
		unlocked: true
	},
	{
		// Quest lock, not added to monsters.
		name: 'Fever spider',
		amount: [110, 170],
		weight: 7,
		Id: Monsters.FeverSpider.id,
		combatLvl: 40,
		slayerLvl: 42,
		unlocked: true
	},
	{
		name: 'Fire giant',
		amount: [110, 170],
		weight: 12,
		Id: Monsters.FireGiant.id,
		combatLvl: 65,
		unlocked: true
	},
	{
		// Check Monsters.FossilIslandWyvernAncient.id, seperate wyverns? Quest lock.
		name: 'Spitting wyvern',
		amount: [10, 20],
		extendedAmount: [55, 75],
		weight: 7,
		alternatives: ['Taloned Wyvern', 'Long-tailed Wyvern', 'Ancient Wyvern'],
		Id: [
			Monsters.SpittingWyvern.id,
			Monsters.TalonedWyvern.id,
			Monsters.LongTailedWyvern.id,
			Monsters.AncientWyvern.id
		],
		combatLvl: 60,
		slayerLvl: 66,
		unlocked: true
	},
	{
		// Quest lock?, Grotesque Guardians not added to monsters.
		name: 'Gargoyle',
		amount: [110, 170],
		extendedAmount: [200, 250],
		weight: 11,
		alternatives: 'Grotesque Guardians',
		Id: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLvl: 80,
		slayerLvl: 75,
		unlocked: true
	},
	{
		// Revenant cave? Some demons not added to monsters.
		name: 'Greater demon',
		amount: [110, 170],
		extendedAmount: [150, 250],
		weight: 9,
		alternatives: ["K'ril Tsutsaroth", 'Tstanon Karlak', 'Skotizo'],
		Id: [
			Monsters.GreaterDemon.id,
			Monsters.KrilTsutsaroth,
			Monsters.TstanonKarlak.id,
			Monsters.Skotizo.id
		],
		combatLvl: 70,
		unlocked: true
	},
	{
		// Not added in monsters. Firemaking?
		name: 'Harpie Bug Swarm',
		amount: [110, 170],
		weight: 6,
		Id: Monsters.HarpieBugSwarm.id,
		combatLvl: 45,
		slayerLvl: 33,
		//  firemakingLvl: 33,
		unlocked: true
	},
	{
		// Revenant cave?, Not added in monsters, Cerberus unlocked??
		name: 'Hellhound',
		amount: [110, 170],
		weight: 9,
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
		// Not added in monsters. Quest lock?
		name: 'Infernal Mage',
		amount: [110, 170],
		weight: 7,
		Id: Monsters.InfernalMage.id,
		combatLvl: 40,
		slayerLvl: 45,
		unlocked: true
	},
	{
		// Quest lock.
		name: 'Iron dragon',
		amount: [25, 45],
		extendedAmount: [60, 100],
		weight: 12,
		Id: Monsters.IronDragon.id,
		combatLvl: 80,
		unlocked: true
	},
	{
		// Not added in monsters.
		name: 'Jelly',
		amount: [110, 170],
		weight: 10,
		alternatives: 'Warped Jelly',
		Id: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLvl: 57,
		slayerLvl: 52,
		unlocked: true
	},
	{
		// Not added in monsters. Quest locked.
		name: 'Jungle horror',
		amount: [110, 170],
		weight: 10,
		Id: Monsters.JungleHorror.id,
		combatLvl: 65,
		unlocked: true
	},
	{
		// KalphSolider and Guardian not added in monsters.
		name: 'Kalphite worker',
		amount: [110, 170],
		weight: 11,
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
		name: 'Kurask',
		amount: [110, 170],
		weight: 12,
		Id: Monsters.Kurask.id,
		combatLvl: 65,
		slayerLvl: 70,
		unlocked: true
	},
	{
		// Revenant cave? ,Not added in monsters
		name: 'Lesser demon',
		amount: [110, 170],
		weight: 9,
		alternatives: "Zakl'n Gritch",
		Id: [Monsters.LesserDemon.id, Monsters.ZaklnGritch.id],
		combatLvl: 60,
		unlocked: true
	},
	{
		// Lizardman brute not added in monsters.
		name: 'Lizardman',
		amount: [70, 90],
		weight: 8,
		alternatives: ['Lizardman brute', 'Lizardman Shaman'],
		Id: [Monsters.Lizardman.id, Monsters.LizardmanBrute.id, Monsters.LizardmanShaman],
		unlocked: false
	},
	{
		// Sulphur locked behind 44 slayer, All not added in monsters.
		name: 'Lizard',
		amount: [110, 170],
		weight: 5,
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
		// Not added in monsters. Quest lock.
		name: 'Mogre',
		amount: [110, 170],
		weight: 6,
		Id: Monsters.Mogre.id,
		combatLvl: 30,
		slayerLvl: 32,
		unlocked: true
	},
	{
		// Not added in monsters. Quest lock.
		name: 'Molanisk',
		amount: [39, 50],
		weight: 6,
		Id: Monsters.Molanisk.id,
		combatLvl: 50,
		slayerLvl: 39,
		unlocked: true
	},
	{
		// Ancient Zygomite not added to monsters, Quest lock.
		name: 'Zygomite',
		amount: [8, 15],
		weight: 7,
		alternatives: 'Ancient Zygomite',
		Id: [Monsters.Zygomite.id, Monsters.AncientZygomite.id],
		combatLvl: 60,
		slayerLvl: 57,
		unlocked: true
	},
	{
		// Greater Nechryael not added in monsters, Quest lock.
		name: 'Nechryael',
		amount: [110, 170],
		extendedAmount: [200, 250],
		weight: 12,
		alternatives: 'Greater Nechryael',
		Id: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLvl: 85,
		slayerLvl: 80,
		unlocked: true
	},
	{
		// Not added in monsters.
		name: 'Pyrefiend',
		amount: [110, 170],
		weight: 6,
		Id: Monsters.Pyrefiend.id,
		combatLvl: 25,
		slayerLvl: 30,
		unlocked: true
	},
	{
		// Not added in monsters.
		name: 'Rockslug',
		amount: [110, 170],
		weight: 5,
		Id: Monsters.Rockslug.id,
		combatLvl: 20,
		slayerLvl: 20,
		unlocked: true
	},
	{
		// Not added in monsters. Quest lock
		name: 'Shadow warrior',
		amount: [110, 170],
		weight: 8,
		Id: Monsters.ShadowWarrior.id,
		combatLvl: 60,
		unlocked: true
	},
	{
		// Quest lock.
		name: 'Skeletal Wyvern',
		amount: [10, 20],
		extendedAmount: [50, 70],
		weight: 7,
		Id: Monsters.SkeletalWyvern.id,
		combatLvl: 70,
		slayerLvl: 72,
		unlocked: true
	},
	{
		// Agility/Strength lock in future? Quest lock? Different slayer lvls for warrior(68) and mage(83).
		name: 'Spiritual ranger',
		amount: [110, 170],
		extendedAmount: [180, 250],
		weight: 12,
		alternatives: ['Spiritual warrior', 'Spiritual mage'],
		Id: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		combatLvl: 60,
		slayerLvl: 63,
		unlocked: true
	},
	{
		// Ice troll and troll general Not added in monsters.
		name: 'Mountain troll',
		amount: [110, 170],
		weight: 11,
		alternatives: ['Ice troll', 'Troll general'],
		Id: [Monsters.MountainTroll.id, Monsters.IceTroll.id, Monsters.TrollGeneral.id],
		combatLvl: 60,
		unlocked: true
	},
	{
		name: 'Turoth',
		amount: [110, 170],
		weight: 10,
		Id: Monsters.Turoth.id,
		combatLvl: 60,
		slayerLvl: 55,
		unlocked: true
	},
	{
		// Not added in monsters.
		name: 'TzHaar-Ket',
		amount: [90, 150],
		alternatives: ['TzTok-Jad', 'TzKal-Zuk'],
		weight: 8,
		Id: [Monsters.TzHaarKet.id, Monsters.TzTokJad.id, Monsters.TzKalZuk.id],
		unlocked: false
	},
	{
		// No Vampyres added in monsters. Quest lock?
		name: 'Feral Vampyre',
		amount: [80, 120],
		extendedAmount: [200, 250],
		weight: 6,
		alternatives: ['Vampyre Juvinate', 'Vyrewatch', 'Vyrewatch Sentinel'],
		Id: [
			Monsters.FeralVampyre.id,
			Monsters.VampyreJuvinate.id,
			Monsters.Vyrewatch.id,
			Monsters.VyrewatchSentinel.id
		],
		unlocked: false
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
		name: 'Wyrm',
		amount: [60, 120],
		weight: 6,
		Id: Monsters.Wyrm.id,
		slayerLvl: 62,
		unlocked: true
	}
];

export default chaeldarTasks;
*/
