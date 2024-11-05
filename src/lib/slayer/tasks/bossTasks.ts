import { Monsters } from 'oldschooljs';

import type { AssignableSlayerTask } from '../types';

export const bossTasks: AssignableSlayerTask[] = [
	{
		monster: Monsters.AbyssalSire,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.AbyssalSire.id],
		slayerLevel: 85,
		isBoss: true
	},
	{
		monster: Monsters.AlchemicalHydra,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.AlchemicalHydra.id],
		slayerLevel: 95,
		isBoss: true
	},
	{
		monster: Monsters.Barrows,
		amount: [1, 6],
		weight: 1,
		levelRequirements: {
			prayer: 43
		},
		monsters: [Monsters.Barrows.id],
		isBoss: true
	},
	{
		monster: Monsters.Callisto,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.Callisto.id, Monsters.Artio.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.Cerberus,
		amount: [3, 35],
		weight: 1,
		levelRequirements: {
			prayer: 43
		},
		monsters: [Monsters.Cerberus.id],
		slayerLevel: 91,
		isBoss: true
	},
	{
		monster: Monsters.ChaosElemental,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.ChaosElemental.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.ChaosFanatic,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.ChaosFanatic.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.CommanderZilyana,
		amount: [3, 35],
		weight: 1,
		levelRequirements: {
			agility: 70,
			prayer: 43
		},
		monsters: [Monsters.CommanderZilyana.id],
		isBoss: true
	},
	{
		monster: Monsters.CrazyArchaeologist,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.CrazyArchaeologist.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.DagannothPrime,
		amount: [3, 35],
		weight: 1,
		levelRequirements: {
			prayer: 43
		},
		monsters: [Monsters.DagannothPrime.id, Monsters.DagannothSupreme.id, Monsters.DagannothRex.id],
		isBoss: true
	},
	{
		monster: Monsters.GeneralGraardor,
		amount: [3, 35],
		weight: 1,
		levelRequirements: {
			strength: 70,
			prayer: 43
		},
		monsters: [Monsters.GeneralGraardor.id],
		isBoss: true
	},
	{
		monster: Monsters.GiantMole,
		amount: [3, 35],
		weight: 1,
		levelRequirements: {
			prayer: 43
		},
		monsters: [Monsters.GiantMole.id],
		isBoss: true
	},
	{
		monster: Monsters.GrotesqueGuardians,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.GrotesqueGuardians.id],
		slayerLevel: 75,
		isBoss: true
	},
	{
		monster: Monsters.KrilTsutsaroth,
		amount: [3, 35],
		weight: 1,
		levelRequirements: {
			hitpoints: 70,
			prayer: 43
		},
		monsters: [Monsters.KrilTsutsaroth.id],
		isBoss: true
	},
	{
		monster: Monsters.KalphiteQueen,
		amount: [3, 35],
		weight: 1,
		levelRequirements: {
			prayer: 43
		},
		monsters: [Monsters.KalphiteQueen.id],
		isBoss: true
	},
	{
		monster: Monsters.KingBlackDragon,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.KingBlackDragon.id],
		isBoss: true
	},
	{
		monster: Monsters.Kraken,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.Kraken.id],
		slayerLevel: 87,
		isBoss: true
	},
	{
		monster: Monsters.Kreearra,
		amount: [3, 35],
		weight: 1,
		levelRequirements: {
			ranged: 70,
			prayer: 40
		},
		monsters: [Monsters.Kreearra.id],
		isBoss: true
	},
	{
		monster: Monsters.Sarachnis,
		amount: [3, 35],
		weight: 1,
		levelRequirements: {
			prayer: 43
		},
		monsters: [Monsters.Sarachnis.id],
		isBoss: true
	},
	{
		monster: Monsters.Scorpia,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.Scorpia.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.ThermonuclearSmokeDevil,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.ThermonuclearSmokeDevil.id],
		slayerLevel: 93,
		isBoss: true
	},
	{
		monster: Monsters.Venenatis,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.Venenatis.id, Monsters.Spindel.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.Vetion,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.Vetion.id, Monsters.Calvarion.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.Vorkath,
		amount: [3, 35],
		weight: 1,
		levelRequirements: {
			prayer: 43
		},
		questPoints: 205,
		monsters: [Monsters.Vorkath.id],
		isBoss: true
	},
	{
		monster: Monsters.Zulrah,
		amount: [3, 15],
		weight: 1,
		levelRequirements: {
			prayer: 43
		},
		questPoints: 75,
		monsters: [Monsters.Zulrah.id],
		isBoss: true
	},
	{
		monster: Monsters.Araxxor,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.Araxxor.id],
		isBoss: true,
		slayerLevel: 92
	}
];

export const wildernessBossTasks: AssignableSlayerTask[] = [
	{
		monster: Monsters.Callisto,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.Callisto.id, Monsters.Artio.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.ChaosElemental,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.ChaosElemental.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.ChaosFanatic,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.ChaosFanatic.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.CrazyArchaeologist,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.CrazyArchaeologist.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.Scorpia,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.Scorpia.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.Venenatis,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.Venenatis.id, Monsters.Spindel.id],
		isBoss: true,
		wilderness: true
	},
	{
		monster: Monsters.Vetion,
		amount: [3, 35],
		weight: 1,
		monsters: [Monsters.Vetion.id, Monsters.Calvarion.id],
		isBoss: true,
		wilderness: true
	}
];
