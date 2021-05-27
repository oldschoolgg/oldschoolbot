import { Monsters } from 'oldschooljs';

import { AssignableSlayerTask } from '../types';

export const bossTasks: readonly AssignableSlayerTask[] = [
	{
		name: 'Abyssal sire',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.AbyssalSire.id],
		slayerLevel: 85
	},
	{
		name: 'Alchemical hydra',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.AlchemicalHydra.id],
		slayerLevel: 95
	},
	{
		name: 'Barrows',
		amount: [1, 6],
		weight: 1,
		id: [Monsters.Barrows.id]
	},
	{
		name: 'Callisto',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.Callisto.id]
	},
	{
		name: 'Cerberus',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.Cerberus.id],
		slayerLevel: 91
	},
	{
		name: 'Chaos elemental',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.ChaosElemental.id]
	},
	{
		name: 'Chaos fanatic',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.ChaosFanatic.id]
	},
	{
		name: 'Commander Zilyana',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.CommanderZilyana.id]
	},
	{
		name: 'Crazy archaeologist',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.CrazyArchaeologist.id]
	},
	{
		name: 'Dagannoth prime',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.DagannothPrime.id]
	},
	{
		name: 'Dagannoth supreme',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.DagannothSupreme.id]
	},
	{
		name: 'Dagannoth rex',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.DagannothRex.id]
	},
	{
		name: 'General graardor',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.GeneralGraardor.id]
	},
	{
		name: 'Giant mole',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.GiantMole.id]
	},
	{
		name: 'Grotesque guardians',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.GrotesqueGuardians.id],
		slayerLevel: 75
	},
	{
		name: 'Kril tsutsaroth',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.KrilTsutsaroth.id]
	},
	{
		name: 'Kalphite queen',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.KalphiteQueen.id]
	},
	{
		name: 'King black dragon',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.KingBlackDragon.id]
	},
	{
		name: 'Kraken',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.Kraken.id],
		slayerLevel: 87
	},
	{
		name: "Kree'arra",
		amount: [3, 35],
		weight: 1,
		id: [Monsters.Kreearra.id]
	},
	{
		name: 'Sarachnis',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.Sarachnis.id]
	},
	{
		name: 'Scorpia',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.Scorpia.id]
	},
	{
		name: 'Thermonuclear smoke devil',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.ThermonuclearSmokeDevil.id],
		slayerLevel: 93
	},
	{
		name: 'Venenatis',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.Venenatis.id]
	},
	{
		name: "Vet'ion",
		amount: [3, 35],
		weight: 1,
		id: [Monsters.Vetion.id]
	},
	{
		name: 'Vorkath',
		amount: [3, 35],
		weight: 1,
		id: [Monsters.Vorkath.id]
	},
	{
		name: 'Zulrah',
		amount: [3, 15],
		weight: 1,
		id: [Monsters.Zulrah.id]
	}
] as const;
