import { Monsters } from 'oldschooljs';

import { AssignableSlayerTask } from '../types';

export const chaeldarTasks: AssignableSlayerTask[] = [
	{
		name: 'Aberrant spectre',
		amount: [110, 170],
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
		amount: [110, 170],
		weight: 12,
		alternatives: ['Abyssal sire'],
		id: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		combatLevel: 85,
		slayerLevel: 85,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Aviansie',
		amount: [110, 170],
		weight: 9,
		alternatives: ["Kree'arra"],
		id: [Monsters.Aviansie.id, Monsters.Kreearra.id],
		unlocked: false
	},
	{
		name: 'Banshee',
		amount: [110, 170],
		weight: 5,
		alternatives: ['Twisted Banshee'],
		id: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLevel: 20,
		slayerLevel: 15,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Basilisk',
		amount: [110, 170],
		weight: 7,
		alternatives: ['Basilisk Knight'],
		id: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLevel: 40,
		slayerLevel: 40,
		unlocked: true
	},
	{
		name: 'Black Demon',
		amount: [110, 170],
		weight: 10,
		alternatives: ['Demonic Gorilla', 'Porazdir', 'Skotizo'],
		id: [
			Monsters.BlackDemon.id,
			Monsters.DemonicGorilla.id,
			Monsters.Porazdir.id,
			Monsters.Skotizo.id
		],
		combatLevel: 80,
		unlocked: true
	},
	{
		name: 'Bloodveld',
		amount: [110, 170],
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
		amount: [110, 170],
		weight: 8,
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
		amount: [110, 170],
		weight: 7,
		id: [Monsters.BrineRat.id],
		combatLevel: 45,
		slayerLevel: 47,
		questPoints: 4,
		unlocked: true
	},
	{
		name: 'Bronze Dragon',
		amount: [10, 20],
		weight: 11,
		id: [Monsters.BronzeDragon.id],
		combatLevel: 75,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Cave crawler',
		amount: [110, 170],
		weight: 5,
		id: [Monsters.CaveCrawler.id],
		combatLevel: 10,
		slayerLevel: 10,
		unlocked: true
	},
	{
		name: 'Cave horror',
		amount: [110, 170],

		weight: 10,
		id: [Monsters.CaveHorror.id],
		combatLevel: 85,
		slayerLevel: 58,
		questPoints: 11,
		unlocked: true
	},
	{
		name: 'Cave kraken',
		amount: [30, 50],

		weight: 12,
		alternatives: ['Kraken'],
		id: [Monsters.CaveKraken.id, Monsters.Kraken.id],
		combatLevel: 80,
		slayerLevel: 87,
		unlocked: true
	},
	{
		name: 'Cave slime',
		amount: [10, 20],
		weight: 6,
		id: [Monsters.CaveSlime.id],
		combatLevel: 15,
		slayerLevel: 17,
		unlocked: true
	},
	{
		name: 'Cockatrice',
		amount: [110, 170],
		weight: 6,
		id: [Monsters.Cockatrice.id],
		combatLevel: 25,
		slayerLevel: 25,
		unlocked: true
	},
	{
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
		amount: [110, 170],

		weight: 9,
		id: [Monsters.DustDevil.id],
		combatLevel: 70,
		slayerLevel: 65,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Elf warrior',
		amount: [110, 170],
		weight: 8,
		alternatives: [
			'Iorwerth Archer',
			'Elf Archer',
			'Iorwerth Warrior',
			'Mourner' /* ,
			'Reanimated elf'*/
		],
		id: [
			Monsters.ElfWarrior.id,
			Monsters.IorwerthArcher.id,
			Monsters.ElfArcher.id,
			Monsters.IorwerthWarrior.id,
			Monsters.Mourner.id /* ,
			Monsters.ReanimatedElf.id*/
		],
		combatLevel: 70,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Fever spider',
		amount: [110, 170],
		weight: 7,
		id: [Monsters.FeverSpider.id],
		combatLevel: 40,
		slayerLevel: 42,
		questPoints: 7,
		unlocked: true
	},
	{
		name: 'Fire giant',
		amount: [110, 170],
		weight: 12,
		id: [Monsters.FireGiant.id],
		combatLevel: 65,
		unlocked: true
	},
	{
		name: 'Spitting wyvern',
		amount: [10, 20],

		weight: 7,
		alternatives: ['Taloned Wyvern', 'Long-tailed Wyvern', 'Ancient Wyvern'],
		id: [
			Monsters.FossilIslandWyvernSpitting.id,
			Monsters.FossilIslandWyvernTaloned.id,
			Monsters.FossilIslandWyvernLongTailed.id,
			Monsters.FossilIslandWyvernAncient.id
		],
		combatLevel: 60,
		slayerLevel: 66,
		questPoints: 3,
		unlocked: true
	},
	{
		name: 'Gargoyle',
		amount: [110, 170],

		weight: 11,
		alternatives: ['Grotesque Guardians'],
		id: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLevel: 80,
		slayerLevel: 75,
		questPoints: 1,
		unlocked: true
	},
	{
		// Revenant cave in future?
		name: 'Greater demon',
		amount: [110, 170],
		weight: 9,
		alternatives: ["K'ril Tsutsaroth", 'Skotizo'],
		id: [Monsters.GreaterDemon.id, Monsters.KrilTsutsaroth.id, Monsters.Skotizo.id],
		combatLevel: 70,
		unlocked: true
	},
	{
		name: 'Harpie Bug Swarm',
		amount: [110, 170],
		weight: 6,
		id: [Monsters.HarpieBugSwarm.id],
		combatLevel: 45,
		slayerLevel: 33,
		unlocked: true
	},
	{
		// Skeleton dogs vetion?
		name: 'Hellhound',
		amount: [110, 170],
		weight: 9,
		alternatives: ['Cerberus' /* , 'Skeleton Hellhound', 'Greater Skeleton Hellhound'*/],
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
		name: 'Infernal Mage',
		amount: [110, 170],
		weight: 7,
		id: [Monsters.InfernalMage.id],
		combatLevel: 40,
		slayerLevel: 45,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Iron dragon',
		amount: [25, 45],

		weight: 12,
		id: [Monsters.IronDragon.id],
		combatLevel: 80,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Jelly',
		amount: [110, 170],
		weight: 10,
		alternatives: ['Warped Jelly'],
		id: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLevel: 57,
		slayerLevel: 52,
		unlocked: true
	},
	{
		name: 'Jungle horror',
		amount: [110, 170],
		weight: 10,
		id: [Monsters.JungleHorror.id],
		combatLevel: 65,
		questPoints: 11,
		unlocked: true
	},
	{
		name: 'Kalphite worker',
		amount: [110, 170],
		weight: 11,
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
		name: 'Kurask',
		amount: [110, 170],
		weight: 12,
		id: [Monsters.Kurask.id],
		combatLevel: 65,
		slayerLevel: 70,
		unlocked: true
	},
	{
		// Revenant cave? ZakInGritch part of kril?
		name: 'Lesser demon',
		amount: [110, 170],
		weight: 9,
		//	alternatives: ["Zakl'n Gritch"],
		id: [Monsters.LesserDemon.id /* , Monsters.ZaklnGritch.id*/],
		combatLevel: 60,
		unlocked: true
	},
	{
		name: 'Lizardman',
		amount: [70, 90],
		weight: 8,
		alternatives: ['Lizardman brute', 'Lizardman Shaman'],
		id: [Monsters.Lizardman.id, Monsters.LizardmanBrute.id, Monsters.LizardmanShaman.id],
		unlocked: false
	},
	{
		name: 'Lizard',
		amount: [110, 170],
		weight: 5,
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
		name: 'Mogre',
		amount: [110, 170],
		weight: 6,
		id: [Monsters.Mogre.id],
		combatLevel: 30,
		slayerLevel: 32,
		unlocked: true
	},
	{
		name: 'Molanisk',
		amount: [39, 50],
		weight: 6,
		id: [Monsters.Molanisk.id],
		combatLevel: 50,
		slayerLevel: 39,
		questPoints: 8,
		unlocked: true
	},
	{
		name: 'Zygomite',
		amount: [8, 15],
		weight: 7,
		alternatives: ['Ancient Zygomite'],
		id: [Monsters.Zygomite.id, Monsters.AncientZygomite.id],
		combatLevel: 60,
		slayerLevel: 57,
		questPoints: 3,
		unlocked: true
	},
	{
		name: 'Nechryael',
		amount: [110, 170],

		weight: 12,
		alternatives: ['Greater Nechryael'],
		id: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLevel: 85,
		slayerLevel: 80,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Pyrefiend',
		amount: [110, 170],
		weight: 6,
		alternatives: ['Pyrelord'],
		id: [Monsters.Pyrefiend.id],
		combatLevel: 25,
		slayerLevel: 30,
		unlocked: true
	},
	{
		name: 'Rockslug',
		amount: [110, 170],
		weight: 5,
		id: [Monsters.Rockslug.id],
		combatLevel: 20,
		slayerLevel: 20,
		unlocked: true
	},
	{
		name: 'Shadow warrior',
		amount: [110, 170],
		weight: 8,
		id: [Monsters.ShadowWarrior.id],
		combatLevel: 60,
		questPoints: 111,
		unlocked: true
	},
	{
		name: 'Skeletal Wyvern',
		amount: [10, 20],
		weight: 7,
		id: [Monsters.SkeletalWyvern.id],
		combatLevel: 70,
		slayerLevel: 72,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Spiritual ranger',
		amount: [110, 170],

		weight: 12,
		alternatives: ['Spiritual warrior', 'Spiritual mage'],
		id: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		combatLevel: 60,
		slayerLevel: 63,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Mountain troll',
		amount: [110, 170],
		weight: 11,
		alternatives: ['Ice troll', 'Troll general'],
		id: [Monsters.MountainTroll.id, Monsters.IceTroll.id, Monsters.TrollGeneral.id],
		combatLevel: 60,
		unlocked: true
	},
	{
		name: 'Turoth',
		amount: [110, 170],
		weight: 10,
		id: [Monsters.Turoth.id],
		combatLevel: 60,
		slayerLevel: 55,
		unlocked: true
	},
	{
		// Infernal cave
		name: 'TzHaar-Ket',
		amount: [90, 150],
		alternatives: ['TzTok-Jad', 'TzKal-Zuk' /* , 'Reanimated TzHaar'*/],
		weight: 8,
		id: [
			Monsters.TzHaarKet.id,
			Monsters.TzTokJad.id
			/* Monsters.TzKalZuk.id, Monsters.ReanimatedTzHaar.id*/
		],
		unlocked: false
	},
	{
		name: 'Feral Vampyre',
		amount: [80, 120],
		weight: 6,
		alternatives: ['Vampyre Juvinate', 'Vyrewatch', 'Vyrewatch Sentinel'],
		id: [
			Monsters.FeralVampyre.id,
			Monsters.VampyreJuvinate.id,
			Monsters.Vyrewatch.id,
			Monsters.VyrewatchSentinel.id
		],
		combatLevel: 35,
		questPoints: 1,
		unlocked: false
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
		name: 'Wyrm',
		amount: [60, 120],
		weight: 6,
		id: [Monsters.Wyrm.id],
		slayerLevel: 62,
		unlocked: true
	}
];
