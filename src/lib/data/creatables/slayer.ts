import { resolveNameBank } from 'oldschooljs/dist/util';

import { SlayerTaskUnlocksEnum } from '../../slayer/slayerUnlocks';
import { Createable } from '../createables';

export const slayerCreatables: Createable[] = [
	{
		name: 'Dark totem',
		inputItems: resolveNameBank({
			'Dark totem base': 1,
			'Dark totem middle': 1,
			'Dark totem top': 1
		}),
		outputItems: resolveNameBank({ 'Dark totem': 1 }),
		GPCost: 0
	},
	{
		name: 'Dragon hunter lance',
		inputItems: resolveNameBank({
			"Hydra's claw": 1,
			'Zamorakian hasta': 1
		}),
		outputItems: resolveNameBank({ 'Dragon hunter lance': 1 }),
		GPCost: 0
	},
	{
		name: 'Ferocious gloves',
		inputItems: resolveNameBank({
			'Hydra leather': 1
		}),
		outputItems: resolveNameBank({ 'Ferocious gloves': 1 }),
		GPCost: 0
	},
	{
		name: 'Hydra leather',
		inputItems: resolveNameBank({
			'Ferocious gloves': 1
		}),
		outputItems: resolveNameBank({ 'Hydra leather': 1 }),
		GPCost: 0
	},
	{
		name: 'Uncut zenyte',
		inputItems: resolveNameBank({
			Onyx: 1,
			'Zenyte shard': 1
		}),
		outputItems: resolveNameBank({ 'Uncut zenyte': 1 }),
		GPCost: 0
	},
	{
		name: 'Neitiznot faceguard',
		inputItems: resolveNameBank({
			'Basilisk jaw': 1,
			'Helm of neitiznot': 1
		}),
		outputItems: resolveNameBank({ 'Neitiznot faceguard': 1 }),
		GPCost: 0
	},
	{
		name: 'Arclight',
		inputItems: resolveNameBank({
			Darklight: 1,
			'Ancient shard': 3
		}),
		outputItems: resolveNameBank({ Arclight: 1 }),
		GPCost: 0
	},
	{
		name: 'Boots of brimstone',
		inputItems: resolveNameBank({
			"Drake's claw": 1,
			'Boots of stone': 1
		}),
		outputItems: resolveNameBank({ 'Boots of brimstone': 1 }),
		GPCost: 0
	},
	{
		name: 'Devout boots',
		inputItems: resolveNameBank({
			"Drake's tooth": 1,
			'Holy sandals': 1
		}),
		outputItems: resolveNameBank({ 'Devout boots': 1 }),
		GPCost: 0
	},
	{
		name: 'Uncharged toxic trident',
		inputItems: resolveNameBank({
			'Magic fang': 1,
			'Uncharged trident': 1
		}),
		outputItems: resolveNameBank({ 'Uncharged toxic trident': 1 }),
		GPCost: 0
	},
	{
		name: "Bryophyta's staff",
		inputItems: resolveNameBank({
			'Nature rune': 1000,
			"Bryophyta's essence": 1,
			Battlestaff: 1
		}),
		outputItems: resolveNameBank({ "Bryophyta's staff": 1 }),
		GPCost: 0
	},
	{
		name: 'Toxic staff (uncharged)',
		inputItems: resolveNameBank({
			'Magic fang': 1,
			'Staff of the dead': 1
		}),
		outputItems: resolveNameBank({ 'Toxic staff (uncharged)': 1 }),
		GPCost: 0
	},
	{
		name: 'Abyssal tentacle',
		inputItems: resolveNameBank({
			'Kraken tentacle': 1,
			'Abyssal whip': 1
		}),
		outputItems: resolveNameBank({ 'Abyssal tentacle': 1 }),
		GPCost: 0
	},
	{
		name: 'Brimstone ring',
		inputItems: resolveNameBank({
			"Hydra's eye": 1,
			"Hydra's fang": 1,
			"Hydra's heart": 1
		}),
		outputItems: resolveNameBank({ 'Brimstone ring': 1 }),
		GPCost: 0
	},
	{
		name: 'Guardian boots',
		inputItems: resolveNameBank({
			'Black tourmaline core': 1,
			'Bandos boots': 1
		}),
		outputItems: resolveNameBank({ 'Guardian boots': 1 }),
		GPCost: 0
	},
	{
		name: 'Abyssal bludgeon',
		inputItems: resolveNameBank({
			'Bludgeon claw': 1,
			'Bludgeon spine': 1,
			'Bludgeon axon': 1
		}),
		outputItems: resolveNameBank({ 'Abyssal bludgeon': 1 }),
		GPCost: 0
	},
	{
		name: 'Uncharge black mask',
		inputItems: resolveNameBank({
			'Black mask (10)': 1
		}),
		outputItems: resolveNameBank({ 'Black mask': 1 }),
		GPCost: 0
	},
	{
		name: 'Slayer ring (8)',
		inputItems: resolveNameBank({
			'Gold bar': 1,
			'Enchanted gem': 1
		}),
		outputItems: resolveNameBank({ 'Slayer ring (8)': 1 }),
		GPCost: 0,
		requiredSkills: {
			crafting: 75
		},
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.RingBling]
	},
	{
		name: 'Slayer ring (eternal)',
		inputItems: resolveNameBank({
			'Gold bar': 1,
			'Eternal gem': 1
		}),
		outputItems: resolveNameBank({ 'Slayer ring (eternal)': 1 }),
		GPCost: 0,
		requiredSkills: {
			crafting: 75
		},
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.RingBling]
	},
	{
		name: 'Slayer helmet',
		inputItems: resolveNameBank({
			'Black mask': 1,
			Earmuffs: 1,
			Facemask: 1,
			'Nose peg': 1,
			'Spiny helmet': 1,
			'Enchanted gem': 1
		}),
		requiredSkills: {
			crafting: 55
		},
		outputItems: resolveNameBank({ 'Slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade]
	},
	{
		name: 'Slayer helmet (i)',
		inputItems: resolveNameBank({
			'Black mask (i)': 1,
			Earmuffs: 1,
			Facemask: 1,
			'Nose peg': 1,
			'Spiny helmet': 1,
			'Enchanted gem': 1
		}),
		outputItems: resolveNameBank({ 'Slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSkills: {
			crafting: 55
		},
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade]
	},
	{
		name: 'Revert slayer helmet',
		inputItems: resolveNameBank({ 'Slayer helmet': 1 }),
		outputItems: resolveNameBank({
			'Black mask': 1,
			Earmuffs: 1,
			Facemask: 1,
			'Nose peg': 1,
			'Spiny helmet': 1,
			'Enchanted gem': 1
		}),
		requiredSkills: {
			crafting: 55
		},
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade]
	},
	{
		name: 'Revert slayer helmet (i)',
		inputItems: resolveNameBank({ 'Slayer helmet (i)': 1 }),
		outputItems: resolveNameBank({
			'Black mask (i)': 1,
			Earmuffs: 1,
			Facemask: 1,
			'Nose peg': 1,
			'Spiny helmet': 1,
			'Enchanted gem': 1
		}),
		requiredSkills: {
			crafting: 55
		},
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade]
	},
	{
		name: 'Black slayer helmet',
		inputItems: resolveNameBank({ 'Slayer helmet': 1, 'Kbd heads': 1 }),
		outputItems: resolveNameBank({ 'Black slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KingBlackBonnet]
	},
	{
		name: 'Black slayer helmet (i)',
		inputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Kbd heads': 1 }),
		outputItems: resolveNameBank({ 'Black slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KingBlackBonnet]
	},
	{
		name: 'Revert black slayer helmet',
		outputItems: resolveNameBank({ 'Slayer helmet': 1, 'Kbd heads': 1 }),
		inputItems: resolveNameBank({ 'Black slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KingBlackBonnet]
	},
	{
		name: 'Revert black slayer helmet (i)',
		outputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Kbd heads': 1 }),
		inputItems: resolveNameBank({ 'Black slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KingBlackBonnet]
	},
	{
		name: 'Green slayer helmet',
		inputItems: resolveNameBank({ 'Slayer helmet': 1, 'Kq head': 1 }),
		outputItems: resolveNameBank({ 'Green slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KalphiteKhat]
	},
	{
		name: 'Green slayer helmet (i)',
		inputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Kq head': 1 }),
		outputItems: resolveNameBank({ 'Green slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KalphiteKhat]
	},
	{
		name: 'Revert green slayer helmet',
		outputItems: resolveNameBank({ 'Slayer helmet': 1, 'Kq head': 1 }),
		inputItems: resolveNameBank({ 'Green slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KalphiteKhat]
	},
	{
		name: 'Revert green slayer helmet (i)',
		outputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Kq head': 1 }),
		inputItems: resolveNameBank({ 'Green slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KalphiteKhat]
	},
	{
		name: 'Red slayer helmet',
		inputItems: resolveNameBank({ 'Slayer helmet': 1, 'Abyssal head': 1 }),
		outputItems: resolveNameBank({ 'Red slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UnholyHelmet]
	},
	{
		name: 'Red slayer helmet (i)',
		inputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Abyssal head': 1 }),
		outputItems: resolveNameBank({ 'Red slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UnholyHelmet]
	},
	{
		name: 'Revert red slayer helmet',
		outputItems: resolveNameBank({ 'Slayer helmet': 1, 'Abyssal head': 1 }),
		inputItems: resolveNameBank({ 'Red slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UnholyHelmet]
	},
	{
		name: 'Revert red slayer helmet (i)',
		outputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Abyssal head': 1 }),
		inputItems: resolveNameBank({ 'Red slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UnholyHelmet]
	},
	{
		name: 'Purple slayer helmet',
		inputItems: resolveNameBank({ 'Slayer helmet': 1, 'Dark claw': 1 }),
		outputItems: resolveNameBank({ 'Purple slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.DarkMantle]
	},
	{
		name: 'Purple slayer helmet (i)',
		inputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Dark claw': 1 }),
		outputItems: resolveNameBank({ 'Purple slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.DarkMantle]
	},
	{
		name: 'Revert purple slayer helmet',
		outputItems: resolveNameBank({ 'Slayer helmet': 1, 'Dark claw': 1 }),
		inputItems: resolveNameBank({ 'Purple slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.DarkMantle]
	},
	{
		name: 'Revert purple slayer helmet (i)',
		outputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Dark claw': 1 }),
		inputItems: resolveNameBank({ 'Purple slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.DarkMantle]
	},
	{
		name: 'Turquoise slayer helmet',
		inputItems: resolveNameBank({ 'Slayer helmet': 1, "Vorkath's head": 1 }),
		outputItems: resolveNameBank({ 'Turquoise slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UndeadHead]
	},
	{
		name: 'Turquoise slayer helmet (i)',
		inputItems: resolveNameBank({ 'Slayer helmet (i)': 1, "Vorkath's head": 1 }),
		outputItems: resolveNameBank({ 'Turquoise slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UndeadHead]
	},
	{
		name: 'Revert turquoise slayer helmet',
		outputItems: resolveNameBank({ 'Slayer helmet': 1, "Vorkath's head": 1 }),
		inputItems: resolveNameBank({ 'Turquoise slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UndeadHead]
	},
	{
		name: 'Revert turquoise slayer helmet (i)',
		outputItems: resolveNameBank({ 'Slayer helmet (i)': 1, "Vorkath's head": 1 }),
		inputItems: resolveNameBank({ 'Turquoise slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UndeadHead]
	},
	{
		name: 'Hydra slayer helmet',
		inputItems: resolveNameBank({ 'Slayer helmet': 1, 'Alchemical hydra heads': 1 }),
		outputItems: resolveNameBank({ 'Hydra slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UseMoreHead]
	},
	{
		name: 'Hydra slayer helmet (i)',
		inputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Alchemical hydra heads': 1 }),
		outputItems: resolveNameBank({ 'Hydra slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UseMoreHead]
	},
	{
		name: 'Revert hydra slayer helmet',
		outputItems: resolveNameBank({ 'Slayer helmet': 1, 'Alchemical hydra heads': 1 }),
		inputItems: resolveNameBank({ 'Hydra slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UseMoreHead]
	},
	{
		name: 'Revert hydra slayer helmet (i)',
		outputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Alchemical hydra heads': 1 }),
		inputItems: resolveNameBank({ 'Hydra slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UseMoreHead]
	},
	{
		name: 'Twisted slayer helmet',
		inputItems: resolveNameBank({ 'Slayer helmet': 1, 'Twisted horns': 1 }),
		outputItems: resolveNameBank({ 'Twisted slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.TwistedVision]
	},
	{
		name: 'Twisted slayer helmet (i)',
		inputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Twisted horns': 1 }),
		outputItems: resolveNameBank({ 'Twisted slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.TwistedVision]
	},
	{
		name: 'Revert twisted slayer helmet',
		outputItems: resolveNameBank({ 'Slayer helmet': 1, 'Twisted horns': 1 }),
		inputItems: resolveNameBank({ 'Twisted slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.TwistedVision]
	},
	{
		name: 'Revert twisted slayer helmet (i)',
		outputItems: resolveNameBank({ 'Slayer helmet (i)': 1, 'Twisted horns': 1 }),
		inputItems: resolveNameBank({ 'Twisted slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.TwistedVision]
	}
];
