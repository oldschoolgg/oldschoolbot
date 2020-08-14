import { Monsters } from 'oldschooljs';
import { SlayerTask } from '../../../types';

const duradelTasks: SlayerTask[] = [
	{
		name: 'Aberrant spectre',
		amount: [130, 200],
		extendedAmount: [200, 250],
		weight: 7,
		alternatives: ['Deviant Spectre'],
		Id: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		combatLvl: 65,
		slayerLvl: 60,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Abyssal demon',
		amount: [130, 200],
		extendedAmount: [200, 250],
		weight: 12,
		alternatives: ['Abyssal sire' /*, 'Reanimated abyssal'*/],
		Id: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id /*, Monsters.ReanimatedAbyssal.id*/],
		combatLvl: 85,
		slayerLvl: 85,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Adamant Dragon',
		amount: [4, 9],
		extendedAmount: [20, 30],
		weight: 2,
		Id: [Monsters.AdamantDragon.id],
		questPoints: 205,
		unlocked: true
	},
	{
		// Dark ankou from skotizo?
		name: 'Ankou',
		amount: [50, 80],
		extendedAmount: [90, 150],
		weight: 5,
		//		alternatives: ['Dark Ankou'],
		Id: [Monsters.Ankou.id /* , Monsters.DarkAnkou.id*/],
		combatLvl: 40,
		unlocked: true
	},
	{
		// Didn't add reanimated aviansie yet
		name: 'Aviansie',
		amount: [120, 200],
		extendedAmount: [130, 250],
		weight: 8,
		alternatives: ["Kree'arra" /*, 'Reanimated aviansie'*/],
		Id: [Monsters.Aviansie.id, Monsters.Kreearra.id /* , Monsters.ReanimatedAviansie*/],
		agiStrLvl: 60,
		unlocked: false
	},
	{
		name: 'Basilisk',
		amount: [130, 200],
		extendedAmount: [200, 250],
		weight: 7,
		alternatives: ['Basilisk Knight'],
		Id: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLvl: 40,
		slayerLvl: 40,
		defenceLvl: 20,
		unlocked: false
	},
	{
		// Count balfrug from kril?
		name: 'Black Demon',
		amount: [130, 200],
		extendedAmount: [200, 250],
		weight: 8,
		alternatives: ['Demonic Gorilla', /*'Balfrug Kreeyath',*/ 'Porazdir', 'Skotizo'],
		Id: [
			Monsters.BlackDemon.id,
			Monsters.DemonicGorilla.id,
			//		Monsters.BalfrugKreeyath.id,
			Monsters.Porazdir.id,
			Monsters.Skotizo.id
		],
		combatLvl: 80,
		unlocked: true
	},
	{
		name: 'Black Dragon',
		amount: [10, 20],
		extendedAmount: [40, 60],
		weight: 9,
		alternatives: ['Baby Black Dragon', 'King Black Dragon', 'Brutal Black Dragon'],
		Id: [
			Monsters.BlackDragon.id,
			Monsters.BabyBlackDragon.id,
			Monsters.BrutalBlackDragon.id,
			Monsters.KingBlackDragon.id
		],
		combatLvl: 80,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Bloodveld',
		amount: [130, 200],
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
		amount: [110, 170],
		weight: 4,
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
		// All the bosses in "Like a boss", seperate file.
		name: 'Boss',
		amount: [],
		alternatives: ['boss'],
		weight: 12,
		Id: [],
		unlocked: false
	},
	{
		name: 'Cave horror',
		amount: [130, 200],
		extendedAmount: [200, 250],
		weight: 4,
		Id: [Monsters.CaveHorror.id],
		combatLvl: 85,
		slayerLvl: 58,
		questPoints: 11,
		unlocked: true
	},
	{
		name: 'Cave kraken',
		amount: [100, 120],
		extendedAmount: [150, 200],
		weight: 9,
		alternatives: ['Kraken'],
		Id: [Monsters.CaveKraken.id, Monsters.Kraken.id],
		combatLvl: 80,
		slayerLvl: 87,
		magicLvl: 50,
		unlocked: true
	},
	{
		name: 'Dagannoth',
		amount: [130, 200],
		weight: 9,
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
		name: 'Dark beast',
		amount: [10, 20],
		extendedAmount: [100, 150],
		weight: 11,
		Id: [Monsters.DarkBeast.id],
		combatLvl: 90,
		slayerLvl: 90,
		questPoints: 24,
		unlocked: true
	},
	{
		name: 'Drake',
		amount: [50, 110],
		weight: 8,
		Id: [Monsters.Drake.id],
		slayerLvl: 84,
		unlocked: true
	},
	{
		name: 'Dust devil',
		amount: [130, 200],
		extendedAmount: [200, 250],
		weight: 5,
		Id: [Monsters.DustDevil.id],
		combatLvl: 70,
		slayerLvl: 65,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Elf warrior',
		amount: [100, 170],
		weight: 4,
		alternatives: [
			'Iorwerth Archer',
			'Elf Archer',
			'Iorwerth Warrior',
			'Mourner' /*,
			'Reanimated elf'*/
		],
		Id: [
			Monsters.ElfWarrior.id,
			Monsters.IorwerthArcher.id,
			Monsters.ElfArcher.id,
			Monsters.IorwerthWarrior.id,
			Monsters.Mourner.id /*,
			Monsters.ReanimatedElf.id*/
		],
		combatLvl: 70,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Fire giant',
		amount: [130, 200],
		weight: 7,
		Id: [Monsters.FireGiant.id],
		combatLvl: 65,
		unlocked: true
	},
	{
		name: 'Spitting wyvern',
		amount: [20, 60],
		extendedAmount: [55, 75],
		weight: 5,
		alternatives: ['Taloned Wyvern', 'Long-tailed Wyvern', 'Ancient Wyvern'],
		Id: [
			Monsters.FossilIslandWyvernAncient.id,
			Monsters.FossilIslandWyvernLongTailed.id,
			Monsters.FossilIslandWyvernSpitting.id,
			Monsters.FossilIslandWyvernTaloned.id
		],
		combatLvl: 60,
		slayerLvl: 66,
		questPoints: 3,
		unlocked: true
	},
	{
		name: 'Gargoyle',
		amount: [130, 200],
		extendedAmount: [200, 250],
		weight: 8,
		alternatives: ['Grotesque Guardians'],
		Id: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLvl: 80,
		slayerLvl: 75,
		questPoints: 1,
		unlocked: true
	},
	{
		// Revenant cave?
		name: 'Greater demon',
		amount: [130, 200],
		extendedAmount: [150, 250],
		weight: 9,
		alternatives: ["K'ril Tsutsaroth", 'Skotizo'],
		Id: [Monsters.GreaterDemon.id, Monsters.KrilTsutsaroth.id, Monsters.Skotizo.id],
		combatLvl: 70,
		unlocked: true
	},
	{
		// Revenant cave?, skeleton dogs from vetion?
		name: 'Hellhound',
		amount: [130, 200],
		weight: 10,
		alternatives: ['Cerberus' /*, 'Skeleton Hellhound', 'Greater Skeleton Hellhound'*/],
		Id: [
			Monsters.Hellhound.id,
			Monsters.Cerberus
				.id /* ,
			Monsters.SkeletonHellhound.id,
			Monsters.GreaterSkeletonHellhound.id
			*/
		],
		combatLvl: 75,
		unlocked: true
	},
	{
		name: 'Iron dragon',
		amount: [40, 60],
		extendedAmount: [60, 100],
		weight: 5,
		Id: [Monsters.IronDragon.id],
		combatLvl: 80,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Kalphite worker',
		amount: [130, 200],
		weight: 9,
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
		name: 'Kurask',
		amount: [130, 200],
		weight: 4,
		Id: [Monsters.Kurask.id],
		combatLvl: 65,
		slayerLvl: 70,
		unlocked: true
	},
	{
		name: 'Lizardman',
		amount: [130, 210],
		weight: 10,
		alternatives: ['Lizardman brute', 'Lizardman Shaman'],
		Id: [Monsters.Lizardman.id, Monsters.LizardmanBrute.id, Monsters.LizardmanShaman.id],
		unlocked: false
	},
	{
		name: 'Mithril Dragon',
		amount: [5, 10],
		extendedAmount: [20, 40],
		weight: 9,
		Id: [Monsters.MithrilDragon.id],
		unlocked: false
	},
	{
		name: 'Zygomite',
		amount: [20, 30],
		weight: 2,
		alternatives: ['Ancient Zygomite'],
		Id: [Monsters.Zygomite.id, Monsters.AncientZygomite.id],
		combatLvl: 60,
		slayerLvl: 57,
		questPoints: 3,
		unlocked: true
	},
	{
		name: 'Nechryael',
		amount: [110, 200],
		extendedAmount: [200, 250],
		weight: 9,
		alternatives: ['Greater Nechryael'],
		Id: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLvl: 85,
		slayerLvl: 80,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Red Dragon',
		amount: [30, 65],
		weight: 8,
		alternatives: ['Baby Red dragon', 'Brutal Red Dragon'],
		Id: [Monsters.RedDragon.id, Monsters.BabyRedDragon.id, Monsters.BrutalRedDragon.id],
		questPoints: 34,
		unlocked: false
	},
	{
		name: 'Rune Dragon',
		amount: [3, 8],
		extendedAmount: [30, 60],
		weight: 2,
		Id: [Monsters.RuneDragon.id],
		questPoints: 205,
		unlocked: true
	},
	{
		name: 'Skeletal Wyvern',
		amount: [20, 40],
		extendedAmount: [50, 70],
		weight: 7,
		Id: [Monsters.SkeletalWyvern.id],
		combatLvl: 70,
		slayerLvl: 72,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Smoke Devil',
		amount: [130, 200],
		weight: 9,
		alternatives: ['Thermonuclear Smoke Devil'],
		Id: [Monsters.SmokeDevil.id, Monsters.ThermonuclearSmokeDevil.id],
		combatLvl: 75,
		slayerLvl: 93,
		unlocked: true
	},
	{
		name: 'Spiritual ranger',
		amount: [130, 200],
		extendedAmount: [180, 250],
		weight: 7,
		alternatives: ['Spiritual warrior', 'Spiritual mage'],
		Id: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		combatLvl: 60,
		slayerLvl: 63,
		agiStrLvl: 60,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Steel Dragon',
		amount: [10, 20],
		extendedAmount: [40, 60],
		weight: 7,
		Id: [Monsters.SteelDragon.id],
		combatLvl: 85,
		questPoints: 34,
		unlocked: true
	},
	{
		name: 'Suqah',
		amount: [60, 90],
		extendedAmount: [180, 250],
		weight: 8,
		Id: [Monsters.Suqah.id],
		combatLvl: 85,
		questPoints: 12,
		unlocked: true
	},
	{
		name: 'Mountain troll',
		amount: [130, 200],
		weight: 6,
		alternatives: ['Ice troll', 'Troll general' /*, 'Reanimated troll'*/],
		Id: [
			Monsters.MountainTroll.id,
			Monsters.IceTroll.id,
			Monsters.TrollGeneral.id /*,
			Monsters.ReanimatedTroll.id*/
		],
		combatLvl: 60,
		unlocked: true
	},
	{
		// Extra Chance of major slayer xp from fight/infernal caves.
		name: 'TzHaar-Ket',
		amount: [130, 199],
		alternatives: ['TzTok-Jad', 'TzKal-Zuk'],
		weight: 10,
		Id: [Monsters.TzHaarKet.id, Monsters.TzTokJad.id /* , Monsters.TzKalZuk.id*/],
		unlocked: false
	},
	{
		name: 'Feral Vampyre',
		amount: [100, 210],
		extendedAmount: [200, 250],
		weight: 8,
		alternatives: ['Vampyre Juvinate', 'Vyrewatch', 'Vyrewatch Sentinel'],
		Id: [
			Monsters.FeralVampyre.id,
			Monsters.VampyreJuvinate.id,
			Monsters.Vyrewatch.id,
			Monsters.VyrewatchSentinel.id
		],
		combatLvl: 35,
		questPoints: 1,
		unlocked: false
	},
	{
		name: 'Waterfiend',
		amount: [130, 200],
		weight: 2,
		Id: [Monsters.Waterfiend.id],
		combatLvl: 75,
		unlocked: true
	},
	{
		name: 'Wyrm',
		amount: [100, 160],
		weight: 8,
		Id: [Monsters.Wyrm.id],
		slayerLvl: 62,
		unlocked: true
	}
];

export default duradelTasks;
