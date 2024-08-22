import { Monsters } from 'oldschooljs';

import { SlayerTaskUnlocksEnum } from '../slayerUnlocks';
import type { AssignableSlayerTask } from '../types';
import { wildernessBossTasks } from './bossTasks';

export const krystiliaTasks: AssignableSlayerTask[] = [
	{
		monster: Monsters.AbyssalDemon,
		amount: [75, 125],
		weight: 5,
		monsters: [Monsters.AbyssalDemon.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.AugmentMyAbbies,
		slayerLevel: 85,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Ankou,
		amount: [75, 125],
		weight: 6,
		monsters: [Monsters.Ankou.id],
		extendedAmount: [91, 150],
		extendedUnlockId: SlayerTaskUnlocksEnum.AnkouVeryMuch,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Aviansie,
		amount: [75, 125],
		weight: 7,
		monsters: [Monsters.Aviansie.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.BirdsOfAFeather,
		unlocked: true,
		wilderness: true
	},
	// {
	//	monster: Monsters.Bandit,
	//	amount: [75, 125],
	//	weight: 4,
	//	monsters: [Monsters.Bandit.id],
	//	unlocked: true,
	//	wilderness: true
	// },
	{
		monster: Monsters.GrizzlyBear,
		amount: [65, 100],
		weight: 6,
		monsters: [Monsters.GrizzlyBear.id, Monsters.Artio.id, Monsters.Callisto.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.BlackDemon,
		amount: [100, 150],
		weight: 7,
		monsters: [Monsters.BlackDemon.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.ItsDarkInHere,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.BlackDragon,
		amount: [8, 16],
		weight: 4,
		monsters: [Monsters.BlackDragon.id],
		extendedAmount: [40, 60],
		extendedUnlockId: SlayerTaskUnlocksEnum.FireAndDarkness,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.BlackKnight,
		amount: [75, 125],
		weight: 3,
		monsters: [Monsters.BlackKnight.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Bloodveld,
		amount: [70, 110],
		weight: 4,
		monsters: [Monsters.Bloodveld.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.BleedMeDry,
		slayerLevel: 50,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.ChaosDruid,
		amount: [50, 90],
		weight: 5,
		monsters: [Monsters.ChaosDruid.id, Monsters.ElderChaosDruid.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.DarkWarrior,
		amount: [75, 125],
		weight: 4,
		monsters: [Monsters.DarkWarrior.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.DustDevil,
		amount: [75, 125],
		weight: 5,
		monsters: [Monsters.DustDevil.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.ToDustYouShallReturn,
		slayerLevel: 65,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.EarthWarrior,
		amount: [75, 125],
		weight: 6,
		monsters: [Monsters.EarthWarrior.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Ent,
		amount: [35, 60],
		weight: 5,
		monsters: [Monsters.Ent.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.FireGiant,
		amount: [75, 125],
		weight: 7,
		monsters: [Monsters.FireGiant.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.GreaterDemon,
		amount: [100, 150],
		weight: 8,
		monsters: [Monsters.GreaterDemon.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.GreaterChallenge,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.GreenDragon,
		amount: [65, 100],
		weight: 4,
		monsters: [Monsters.GreenDragon.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Hellhound,
		amount: [75, 125],
		weight: 7,
		monsters: [Monsters.Hellhound.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.HillGiant,
		amount: [75, 125],
		weight: 3,
		monsters: [Monsters.HillGiant.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.IceGiant,
		amount: [100, 150],
		weight: 6,
		monsters: [Monsters.IceGiant.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.IceWarrior,
		amount: [100, 150],
		weight: 7,
		monsters: [Monsters.IceWarrior.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Jelly,
		amount: [100, 150],
		weight: 5,
		monsters: [Monsters.Jelly.id],
		slayerLevel: 52,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.LavaDragon,
		amount: [35, 60],
		weight: 3,
		monsters: [Monsters.LavaDragon.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.LesserDemon,
		amount: [80, 120],
		weight: 6,
		monsters: [Monsters.LesserDemon.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.MagicAxe,
		amount: [75, 125],
		weight: 7,
		monsters: [Monsters.MagicAxe.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Mammoth,
		amount: [75, 125],
		weight: 6,
		monsters: [Monsters.Mammoth.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.MossGiant,
		amount: [100, 150],
		weight: 4,
		monsters: [Monsters.MossGiant.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.GreaterNechryael,
		amount: [75, 125],
		weight: 5,
		monsters: [Monsters.GreaterNechryael.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.NechsPlease,
		slayerLevel: 80,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Pirate,
		amount: [62, 75],
		weight: 3,
		monsters: [Monsters.Pirate.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.RevenantImp,
		amount: [40, 100],
		weight: 5,
		monsters: [
			Monsters.RevenantCyclops.id,
			Monsters.RevenantDarkBeast.id,
			Monsters.RevenantDemon.id,
			Monsters.RevenantDragon.id,
			Monsters.RevenantGoblin.id,
			Monsters.RevenantHellhound.id,
			Monsters.RevenantHobgoblin.id,
			Monsters.RevenantImp.id,
			Monsters.RevenantKnight.id,
			Monsters.RevenantOrk.id,
			Monsters.RevenantPyrefiend.id
		],
		extendedAmount: [100, 150],
		extendedUnlockId: SlayerTaskUnlocksEnum.Revenenenenenants,
		unlocked: true,
		wilderness: true
	},
	// {
	// 	monster: Monsters.Rogue,
	// 	amount: [75, 125],
	// 	weight: 5,
	// 	monsters: [Monsters.Rogue.id],
	// 	unlocked: true,
	// 	wilderness: true
	// },
	{
		monster: Monsters.Scorpion,
		amount: [65, 100],
		weight: 6,
		monsters: [Monsters.Scorpia.id, Monsters.Scorpion.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Skeleton,
		amount: [65, 100],
		weight: 5,
		monsters: [Monsters.Skeleton.id, Monsters.Vetion.id, Monsters.Calvarion.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Spider,
		amount: [65, 100],
		weight: 6,
		monsters: [Monsters.Spider.id, Monsters.Venenatis.id, Monsters.Spindel.id],
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.SpiritualRanger,
		amount: [100, 150],
		weight: 6,
		monsters: [Monsters.SpiritualMage.id, Monsters.SpiritualRanger.id, Monsters.SpiritualWarrior.id],
		extendedAmount: [181, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.SpiritualFervour,
		slayerLevel: 63,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Zombie,
		amount: [75, 125],
		weight: 3,
		monsters: [Monsters.Zombie.id],
		unlocked: true,
		wilderness: true
	},
	...wildernessBossTasks
];
