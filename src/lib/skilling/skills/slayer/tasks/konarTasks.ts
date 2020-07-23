import { Monsters } from 'oldschooljs';
import { Task } from '../../../types';

// Handle extended amounts?? Brimstone keys?
const konarTasks: Task[] = [
	{
		// Deviant spectre not added in monsters.
		name: 'Aberrant spectre',
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 6,
		alternatives: 'Deviant Spectre',
		Id: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		combatLvl: 65,
		slayerLvl: 60,
		unlocked: true
	},
	{
		// Greater abyssal and abyssal sire not added in monsters.
		name: 'Abyssal demon',
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 9,
		alternatives: ['Abyssal sire', 'Greater abyssal demon'],
		Id: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id, Monsters.GreaterAbyssalDemon.id],
		combatLvl: 85,
		slayerLvl: 85,
		unlocked: true
	},
	{
		// Quest lock.
		name: 'Adamant Dragon',
		amount: [3, 6],
		extendedAmount: [20, 30],
		weight: 5,
		Id: Monsters.AdamantDragon.id,
		unlocked: true
	},
	{
		name: 'Ankou',
		amount: 50,
		extendedAmount: [90, 150],
		weight: 5,
		Id: Monsters.Ankou.id,
		combatLvl: 40,
		unlocked: true
	},
	{
		// Agility/Strength lock in future? Count Kreeerra guards?
		name: 'Aviansie',
		amount: [120, 170],
		extendedAmount: [130, 250],
		weight: 6,
		alternatives: "Kree'arra",
		Id: [Monsters.Aviansie.id, Monsters.Kreearra.id],
		unlocked: false
	},
	{
		// Defence lvl?
		name: 'Basilisk',
		amount: [110, 170],
		extendedAmount: [200, 250],
		weight: 5,
		alternatives: 'Basilisk Knight',
		Id: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id],
		combatLvl: 40,
		slayerLvl: 40,
		//  defenceLvl: 20,
		unlocked: false
	},
	{
		// Some demons not added in monsters.
		name: 'Black Demon',
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 9,
		alternatives: 'Skotizo',
		Id: [Monsters.BlackDemon.id, Monsters.Skotizo.id],
		combatLvl: 80,
		unlocked: true
	},
	{
		// Quest lock. Mutaed bloodveld not added in monsters.
		name: 'Bloodveld',
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 9,
		alternatives: 'Mutated Bloodveld',
		Id: [Monsters.Bloodveld.id, Monsters.MutatedBloodveld.id],
		combatLvl: 50,
		slayerLvl: 50,
		unlocked: true
	},
	{
		// Quest lock, Baby, Brutal blue dragon not added in monsters.
		name: 'Blue Dragon',
		amount: [120, 170],
		weight: 8,
		alternatives: ['Baby Blue Dragon', 'Brutal Blue Dragon'],
		Id: [Monsters.BlueDragon.id, Monsters.BabyBlueDragon.id, Monsters.BrutalBlueDragon.id],
		combatLvl: 65,
		unlocked: true
	},
	{
		// All the bosses in "Like a boss", seperate file.
		name: 'Boss',
		amount: [],
		alternatives: 'boss',
		weight: 8,
		Id: [],
		unlocked: false
	},
	{
		// Quest lock.
		name: 'Brine rat',
		amount: [120, 170],
		weight: 2,
		Id: Monsters.BrineRat.id,
		combatLvl: 45,
		slayerLvl: 47,
		unlocked: true
	},
	{
		// Quest lock, Not added in monsters.
		name: 'Bronze Dragon',
		amount: [30, 50],
		extendedAmount: [30, 50],
		weight: 5,
		Id: Monsters.BronzeDragon.id,
		combatLvl: 75,
		unlocked: true
	},
	{
		// Kraken not added to monsters, Magelvl?
		name: 'Cave kraken',
		amount: [80, 100],
		extendedAmount: [150, 200],
		weight: 9,
		alternatives: 'Kraken',
		Id: [Monsters.CaveKraken.id, Monsters.Kraken.id],
		combatLvl: 80,
		slayerLvl: 87,
		//  mageLvl: 50,
		unlocked: true
	},
	{
		// Quest lock. Dagannoth spawn and fledgeling not added to monsters.
		name: 'Dagannoth',
		amount: [120, 170],
		weight: 8,
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
		name: 'Dark beast',
		amount: [10, 15],
		extendedAmount: [100, 150],
		weight: 5,
		Id: Monsters.DarkBeast.id,
		combatLvl: 90,
		slayerLvl: 90,
		unlocked: true
	},
	{
		name: 'Drake',
		amount: [75, 138],
		weight: 10,
		Id: Monsters.Drake.id,
		combatLvl: 84,
		unlocked: true
	},
	{
		// Quest lock.
		name: 'Dust devil',
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 6,
		Id: Monsters.DustDevil.id,
		combatLvl: 70,
		slayerLvl: 65,
		unlocked: true
	},
	{
		name: 'Fire giant',
		amount: [120, 170],
		weight: 9,
		Id: Monsters.FireGiant.id,
		combatLvl: 65,
		unlocked: true
	},
	{
		// Check Monsters.FossilIslandWyvernAncient.id, seperate wyverns? Quest lock.
		name: 'Spitting wyvern',
		amount: [15, 30],
		extendedAmount: [55, 75],
		weight: 9,
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
		amount: [120, 170],
		extendedAmount: [200, 250],
		weight: 6,
		alternatives: 'Grotesque Guardians',
		Id: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id],
		combatLvl: 80,
		slayerLvl: 75,
		unlocked: true
	},
	{
		// Skotizo demons not added to monsters.
		name: 'Greater demon',
		amount: [120, 170],
		extendedAmount: [150, 223],
		weight: 7,
		alternatives: 'Skotizo',
		Id: [Monsters.GreaterDemon.id, Monsters.Skotizo.id],
		combatLvl: 75,
		unlocked: true
	},
	{
		// Cerberus unlocked??
		name: 'Hellhound',
		amount: [120, 170],
		weight: 8,
		alternatives: 'Cerberus',
		Id: [Monsters.Hellhound.id, Monsters.Cerberus.id],
		combatLvl: 75,
		unlocked: true
	},
	{
		// Not added to monsters.
		name: 'Hydra',
		amount: [125, 190],
		weight: 10,
		alternatives: 'Alchemical Hydra',
		Id: [Monsters.Hydra.id, Monsters.AlchemicalHydra.id],
		slayerLvl: 95,
		unlocked: true
	},
	{
		// Quest lock.
		name: 'Iron dragon',
		amount: [30, 50],
		extendedAmount: [60, 100],
		weight: 5,
		Id: Monsters.IronDragon.id,
		combatLvl: 80,
		unlocked: true
	},
	{
		// Not added in monsters.
		name: 'Jelly',
		amount: [120, 170],
		weight: 6,
		alternatives: 'Warped Jelly',
		Id: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		combatLvl: 57,
		slayerLvl: 52,
		unlocked: true
	},
	{
		// KalphSolider and Guardian not added in monsters.
		name: 'Kalphite worker',
		amount: [120, 170],
		weight: 9,
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
		amount: [120, 170],
		weight: 3,
		Id: Monsters.Kurask.id,
		combatLvl: 65,
		slayerLvl: 70,
		unlocked: true
	},
	{
		// Lizardman brute not added in monsters.
		name: 'Lizardman',
		amount: [90, 110],
		weight: 8,
		alternatives: ['Lizardman brute', 'Lizardman Shaman'],
		Id: [Monsters.Lizardman.id, Monsters.LizardmanBrute.id, Monsters.LizardmanShaman],
		unlocked: false
	},
	{
		// Quest lock?
		name: 'Mithril Dragon',
		amount: [3, 6],
		extendedAmount: [20, 40],
		weight: 5,
		Id: Monsters.MithrilDragon.id,
		unlocked: false
	},
	{
		// Ancient Zygomite not added to monsters, Quest lock.
		name: 'Zygomite',
		amount: [10, 25],
		weight: 2,
		alternatives: 'Ancient Zygomite',
		Id: [Monsters.Zygomite.id, Monsters.AncientZygomite.id],
		combatLvl: 60,
		slayerLvl: 57,
		unlocked: true
	},
	{
		// Greater Nechryael not added in monsters, Quest lock.
		name: 'Nechryael',
		amount: 110,
		extendedAmount: [200, 250],
		weight: 7,
		alternatives: 'Greater Nechryael',
		Id: [Monsters.Nechryael.id, Monsters.GreaterNechryael.id],
		combatLvl: 85,
		slayerLvl: 80,
		unlocked: true
	},
	{
		// Quest lock, baby /brute red dragon not added to monsters.
		name: 'Red Dragon',
		amount: [30, 50],
		weight: 5,
		alternatives: ['Baby Red dragon', 'Brutal Red Dragon'],
		Id: [Monsters.RedDragon.id, Monsters.BabyRedDragon.id, Monsters.BruteRedDragon.id],
		unlocked: false
	},
	{
		// Quest lock.
		name: 'Rune Dragon',
		amount: [3, 6],
		extendedAmount: [30, 60],
		weight: 5,
		Id: Monsters.RuneDragon.id,
		unlocked: true
	},
	{
		// Quest lock.
		name: 'Skeletal Wyvern',
		amount: [5, 12],
		extendedAmount: [50, 70],
		weight: 5,
		Id: Monsters.SkeletalWyvern.id,
		combatLvl: 70,
		slayerLvl: 72,
		unlocked: true
	},
	{
		// Thermonuclear Smoke devil not added to monsters.
		name: 'Smoke Devil',
		amount: [120, 170],
		weight: 7,
		alternatives: 'Thermonuclear Smoke Devil',
		Id: [Monsters.SmokeDevil.id, Monsters.ThermonuclearSmokeDevil.id],
		combatLvl: 75,
		slayerLvl: 93,
		unlocked: true
	},
	{
		// Lots of missing trolls in monsters.
		name: 'Mountain troll',
		amount: [120, 170],
		weight: 6,
		alternatives: ['Troll general', 'Thrower troll', 'Pee Hat', 'Kraka', 'Rock', 'Stick'],
		Id: [
			Monsters.MountainTroll.id,
			Monsters.TrollGeneral.id,
			Monsters.ThrowerTroll.id,
			Monsters.PeeHat.id,
			Monsters.Kraka.id,
			Monsters.Rock.id,
			Monsters.Stick.id
		],
		combatLvl: 60,
		unlocked: true
	},
	{
		name: 'Turoth',
		amount: [120, 170],
		weight: 3,
		Id: Monsters.Turoth.id,
		combatLvl: 60,
		slayerLvl: 55,
		unlocked: true
	},
	{
		// No Vampyres added in monsters. Quest lock?
		name: 'Feral Vampyre',
		amount: [100, 160],
		extendedAmount: [200, 250],
		weight: 4,
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
		// Not added to monsters.
		name: 'Waterfiend',
		amount: [120, 170],
		weight: 2,
		Id: Monsters.Waterfiend.id,
		combatLvl: 75,
		unlocked: true
	},
	{
		name: 'Wyrm',
		amount: [125, 190],
		weight: 10,
		Id: Monsters.Wyrm.id,
		slayerLvl: 62,
		unlocked: true
	}
];

export default konarTasks;
