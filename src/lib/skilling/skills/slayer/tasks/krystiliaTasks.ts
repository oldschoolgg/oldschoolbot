/*
import { Monsters } from 'oldschooljs';
import { SlayerTask } from '../../../types';

// Larrans keys??
const krystiliaTasks: SlayerTask[] = [
	{
		name: 'Ankou',
		amount: [40, 130],
		weight: 6,
		Id: Monsters.Ankou.id,
		wilderness: 31,
		unlocked: true
	},
	{
		// Add Armadylian guard as option?
		name: 'Aviansie',
		amount: [80, 150],
		weight: 7,
		//	alternatives: 'Armadylian guard',
		Id: [Monsters.Aviansie.id, Monsters.Armadylianguard.id],
		agiStrLvl: 60,
		wilderness: 27,
		unlocked: false
	},
	{
		// Different bandits and droprates? None of them added in monsters
		name: 'Bandit',
		amount: [75, 125],
		weight: 4,
		alternatives: 'Guard Bandit',
		Id: [Monsters.Bandit.id, Monsters.GuardBandit.id],
		wilderness: 20,
		unlocked: true
	},
	{
		// Grizzly bear not added in monsters
		name: 'Grizzly bear',
		amount: [50, 100],
		weight: 6,
		alternatives: 'Callisto',
		Id: [Monsters.Grizzlybear.id, Monsters.Callisto.id],
		wilderness: 20,
		unlocked: true
	},
	{
		// Black demon reventant caves?
		name: 'Black demon',
		amount: [100, 150],
		weight: 7,
		Id: Monsters.BlackDemon.id,
		wilderness: 18,
		unlocked: true
	},
	{
		// Black dragon reventant caves?
		name: 'Black dragon',
		amount: [5, 20],
		weight: 4,
		Id: Monsters.BlackDragon.id,
		wilderness: 40,
		unlocked: true
	},
	{
		// Black Knight not added in monsters
		name: 'Black Knight',
		amount: [75, 125],
		weight: 3,
		Id: Monsters.BlackKnight.id,
		wilderness: 37,
		unlocked: true
	},
	{
		name: 'Bloodveld',
		amount: [90, 140],
		weight: 4,
		Id: Monsters.Bloodveld.id,
		agiStrLvl: 60,
		wilderness: 27,
		unlocked: true
	},
	{
		// Neither added in monsters
		name: 'Chaos druid',
		amount: [50, 85],
		weight: 5,
		alternatives: 'Elder Chaos druid',
		Id: [Monsters.ChaosDruid.id, Monsters.ElderChaosDruid.id],
		wilderness: 6,
		unlocked: true
	},
	{
		// Two combat lvls, not added in monsters
		name: 'Dark warrior',
		amount: [70, 125],
		weight: 4,
		Id: Monsters.DarkWarrior.id,
		wilderness: 14,
		unlocked: true
	},
	{
		// Not added in monsters
		name: 'Earth warrior',
		amount: [75, 130],
		weight: 6,
		Id: Monsters.EarthWarrior.id,
		wilderness: 8,
		unlocked: true
	},
	{
		// Not added in monsters
		name: 'Ent',
		amount: [35, 60],
		weight: 5,
		Id: Monsters.Ent.id,
		wilderness: 16,
		unlocked: true
	},
	{
		// Not added in monsters, wildy drops?
		name: 'Fire giant',
		amount: [100, 150],
		weight: 7,
		Id: Monsters.FireGiant.id,
		wilderness: 53,
		unlocked: true
	},
	{
		// Revenant cave?
		name: 'Greater demon',
		amount: [100, 150],
		weight: 8,
		Id: Monsters.GreaterDemon.id,
		wilderness: 36,
		unlocked: true
	},
	{
		// Revenant cave?, Not added in monsters
		name: 'Green dragon',
		amount: [60, 100],
		weight: 4,
		Id: Monsters.GreenDragon.id,
		wilderness: 25,
		unlocked: true
	},
	{
		// Revenant cave?, Not added in monsters
		name: 'Hellhound',
		amount: [70, 123],
		weight: 7,
		alternatives: ['Skeleton Hellhound', 'Greater Skeleton Hellhound'],
		Id: [
			Monsters.Hellhound.id,
			Monsters.SkeletonHellhound.id,
			Monsters.GreaterSkeletonHellhound.id
		],
		wilderness: 36,
		unlocked: true
	},
	{
		// Wilderness drops?, Not added in monsters
		name: 'Hill Giant',
		amount: [100, 150],
		weight: 3,
		Id: Monsters.HillGiant.id,
		wilderness: 35,
		unlocked: true
	},
	{
		// Revenant cave?, Not added in monsters
		name: 'Ice giant',
		amount: [100, 160],
		weight: 6,
		Id: Monsters.IceGiant.id,
		wilderness: 42,
		unlocked: true
	},
	{
		// Not added in monsters
		name: 'Ice warrior',
		amount: [100, 150],
		weight: 7,
		Id: Monsters.IceWarrior.id,
		wilderness: 49,
		unlocked: true
	},
	{
		// Not added in monsters
		name: 'Lava dragon',
		amount: [35, 60],
		weight: 3,
		Id: Monsters.LavaDragon.id,
		wilderness: 39,
		unlocked: true
	},
	{
		// Revenant cave? ,Not added in monsters
		name: 'Lesser demon',
		amount: [80, 120],
		weight: 6,
		Id: Monsters.LesserDemon.id,
		wilderness: 34,
		unlocked: true
	},
	{
		// Not added in monsters
		name: 'Magic axe',
		amount: [70, 125],
		weight: 7,
		Id: Monsters.MagicAxe.id,
		wilderness: 55,
		unlocked: true
	},
	{
		// Not added in monsters
		name: 'Mammoth',
		amount: [75, 125],
		weight: 6,
		Id: Monsters.Mammoth.id,
		wilderness: 10,
		unlocked: true
	},
	{
		// Wildy? Not added in monsters
		name: 'Moss giant',
		amount: [100, 150],
		weight: 4,
		Id: Monsters.MossGiant.id,
		wilderness: 35,
		unlocked: true
	},
	{
		// Wildy? Not added in monsters
		name: 'Pirate',
		amount: [75, 125],
		weight: 3,
		Id: Monsters.Pirate.id,
		wilderness: 54,
		unlocked: true
	},
	{
		// Not added in monsters
		name: 'Revenant dragon',
		amount: [40, 100],
		weight: 5,
		alternatives: [
			'Revenant imp',
			'Revenant goblin',
			'Revenant pyrefiend',
			'Revenant hobgoblin',
			'Revenant cyclops',
			'Revenant hellhound',
			'Revenant demon',
			'Revenant ork',
			'Revenant dark beast',
			'Revenant knight'
		],
		Id: [
			Monsters.RevenantDragon.id,
			Monsters.RevenantImp.id,
			Monsters.RevenantGoblin.id,
			Monsters.RevenantPyrefiend.id,
			Monsters.RevenantHobgoblin.id,
			Monsters.RevenantCyclops.id,
			Monsters.RevenantHellhound.id,
			Monsters.RevenantDemon.id,
			Monsters.RevenantOrk.id,
			Monsters.RevenantDarkBeast.id,
			Monsters.RevenantKnight.id
		],
		wilderness: 31,
		unlocked: true
	},
	{
		// Two combats? Not added in monsters
		name: 'Rogue',
		amount: [75, 125],
		weight: 5,
		Id: Monsters.Rogue.id,
		wilderness: 52,
		unlocked: true
	},
	{
		// King scorpion not added in monsters, scorpia offsprings/guardians count.
		name: 'Scorpion',
		amount: [60, 100],
		weight: 6,
		alternatives: ['King Scorpion', 'Scorpia'],
		Id: [Monsters.Scorpion.id, Monsters.KingScorpion.id, Monsters.Scorpia.id],
		wilderness: 29,
		unlocked: true
	},
	{
		// More skeletons with different loots, Not added in monsters.
		name: 'Skeleton',
		amount: [60, 100],
		weight: 5,
		alternatives: ['Skeleton Hellhound', 'Greater Skeleton Hellhound', "Vet'ion"],
		Id: [
			Monsters.Skeleton.id,
			Monsters.SkeletonHellHound.id,
			Monsters.GreaterSkeletonHellhound.id,
			Monsters.Vetion.id
		],
		wilderness: 28,
		unlocked: true
	},
	{
		// Giant spider and deadly red spider not added in monsters,
		name: 'Spider',
		amount: [60, 100],
		weight: 6,
		alternatives: ['Giant Spider', 'Deadly red spider', 'Venenatis'],
		Id: [
			Monsters.Spider.id,
			Monsters.GiantSpider.id,
			Monsters.DeadlyRedSpider.id,
			Monsters.Venenatis.id
		],
		wilderness: 28,
		unlocked: true
	},
	{
		name: 'Spiritual ranger',
		amount: [100, 150],
		weight: 6,
		alternatives: ['Spiritual warrior', 'Spiritual mage'],
		Id: [Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id, Monsters.SpiritualMage.id],
		agiStrLvl: 60,
		questPoints: 1,
		wilderness: 26,
		unlocked: true
	},
	{
		name: 'Zombie',
		amount: [75, 125],
		weight: 3,
		Id: Monsters.Zombie.id,
		wilderness: 38,
		unlocked: true
	},
	{
		name: 'Chaos Fanatic',
		amount: [3, 35],
		weight: 8,
		Id: Monsters.ChaosFanatic.id,
		wilderness: 41,
		unlocked: false
	},
	{
		name: 'Crazy archaeologist',
		amount: [3, 35],
		weight: 8,
		Id: Monsters.CrazyArchaeologist.id,
		wilderness: 23,
		unlocked: false
	},
	{
		name: 'Scorpia',
		amount: [3, 35],
		weight: 8,
		Id: Monsters.Scorpia.id,
		wilderness: 53,
		unlocked: false
	},
	{
		name: 'Chaos Elemental',
		amount: [3, 35],
		weight: 8,
		Id: Monsters.ChaosElemental.id,
		wilderness: 53,
		unlocked: false
	},
	{
		name: 'Callisto',
		amount: [3, 35],
		weight: 8,
		Id: Monsters.Callisto.id,
		wilderness: 42,
		unlocked: false
	},
	{
		name: 'Venenatis',
		amount: [3, 35],
		weight: 8,
		Id: Monsters.Venenatis.id,
		wilderness: 28,
		unlocked: false
	},
	{
		name: "Vet'ion",
		amount: [3, 35],
		weight: 8,
		Id: Monsters.Vetion.id,
		wilderness: 35,
		unlocked: false
	}
];

export default krystiliaTasks;
*/
