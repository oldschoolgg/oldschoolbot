import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util/util';

import { SlayerTaskUnlocksEnum } from '../../slayer/slayerUnlocks';
import type { Createable } from '../createables';

export const slayerCreatables: Createable[] = [
	{
		name: 'Dark totem',
		inputItems: new Bank({
			'Dark totem base': 1,
			'Dark totem middle': 1,
			'Dark totem top': 1
		}),
		outputItems: new Bank({ 'Dark totem': 1 }),
		GPCost: 0
	},
	{
		name: 'Dragon hunter lance',
		inputItems: new Bank({
			"Hydra's claw": 1,
			'Zamorakian hasta': 1
		}),
		outputItems: new Bank({ 'Dragon hunter lance': 1 }),
		GPCost: 0
	},
	{
		name: 'Ferocious gloves',
		inputItems: new Bank({
			'Hydra leather': 1
		}),
		outputItems: new Bank({ 'Ferocious gloves': 1 }),
		GPCost: 0
	},
	{
		name: 'Revert ferocious gloves',
		inputItems: new Bank({
			'Ferocious gloves': 1
		}),
		outputItems: new Bank({ 'Hydra leather': 1 }),
		GPCost: 0,
		noCl: true
	},
	{
		name: 'Uncut zenyte',
		inputItems: new Bank({
			Onyx: 1,
			'Zenyte shard': 1
		}),
		outputItems: new Bank({ 'Uncut zenyte': 1 }),
		GPCost: 0
	},
	{
		name: 'Neitiznot faceguard',
		inputItems: new Bank({
			'Basilisk jaw': 1,
			'Helm of neitiznot': 1
		}),
		outputItems: new Bank({ 'Neitiznot faceguard': 1 }),
		GPCost: 0
	},
	{
		name: 'Revert neitiznot faceguard',
		inputItems: new Bank({ 'Neitiznot faceguard': 1 }),
		outputItems: new Bank({
			'Basilisk jaw': 1,
			'Helm of neitiznot': 1
		}),
		GPCost: 0
	},
	{
		name: 'Arclight',
		inputItems: new Bank({
			Darklight: 1,
			'Ancient shard': 3
		}),
		outputItems: new Bank({ Arclight: 1 }),
		GPCost: 0
	},
	{
		name: 'Boots of brimstone',
		inputItems: new Bank({
			"Drake's claw": 1,
			'Boots of stone': 1
		}),
		outputItems: new Bank({ 'Boots of brimstone': 1 }),
		GPCost: 0
	},
	{
		name: 'Devout boots',
		inputItems: new Bank({
			"Drake's tooth": 1,
			'Holy sandals': 1
		}),
		outputItems: new Bank({ 'Devout boots': 1 }),
		GPCost: 0
	},
	{
		name: 'Uncharged toxic trident',
		inputItems: new Bank({
			'Magic fang': 1,
			'Uncharged trident': 1
		}),
		outputItems: new Bank({ 'Uncharged toxic trident': 1 }),
		GPCost: 0
	},
	{
		name: "Bryophyta's staff",
		inputItems: new Bank({
			'Nature rune': 1000,
			"Bryophyta's essence": 1,
			Battlestaff: 1
		}),
		outputItems: new Bank({ "Bryophyta's staff": 1 }),
		GPCost: 0
	},
	{
		name: 'Toxic staff (uncharged)',
		inputItems: new Bank({
			'Magic fang': 1,
			'Staff of the dead': 1
		}),
		outputItems: new Bank({ 'Toxic staff (uncharged)': 1 }),
		GPCost: 0
	},
	{
		name: 'Abyssal tentacle',
		inputItems: new Bank({
			'Kraken tentacle': 1,
			'Abyssal whip': 1
		}),
		outputItems: new Bank({ 'Abyssal tentacle': 1 }),
		GPCost: 0,
		maxCanOwn: 1,
		onCreate: async (qty, user) => {
			await user.update({ tentacle_charges: { increment: 10_000 * qty } });
			return {
				result: true,
				message: `Your Abyssal tentacle was given ${toKMB(
					10_000 * qty
				)} charges.\nUse \`/minion charge\` to add more.`
			};
		}
	},
	{
		name: 'Brimstone ring',
		inputItems: new Bank({
			"Hydra's eye": 1,
			"Hydra's fang": 1,
			"Hydra's heart": 1
		}),
		outputItems: new Bank({ 'Brimstone ring': 1 }),
		GPCost: 0
	},
	{
		name: 'Guardian boots',
		inputItems: new Bank({
			'Black tourmaline core': 1,
			'Bandos boots': 1
		}),
		outputItems: new Bank({ 'Guardian boots': 1 }),
		GPCost: 0
	},
	{
		name: 'Abyssal bludgeon',
		inputItems: new Bank({
			'Bludgeon claw': 1,
			'Bludgeon spine': 1,
			'Bludgeon axon': 1
		}),
		outputItems: new Bank({ 'Abyssal bludgeon': 1 }),
		GPCost: 0
	},
	{
		name: 'Uncharged black mask',
		inputItems: new Bank({
			'Black mask (10)': 1
		}),
		outputItems: new Bank({ 'Black mask': 1 }),
		GPCost: 0
	},
	{
		name: 'Slayer ring (8)',
		inputItems: new Bank({
			'Gold bar': 1,
			'Enchanted gem': 1
		}),
		outputItems: new Bank({ 'Slayer ring (8)': 1 }),
		GPCost: 0,
		requiredSkills: {
			crafting: 75
		},
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.RingBling]
	},
	{
		name: 'Slayer ring (eternal)',
		inputItems: new Bank({
			'Gold bar': 1,
			'Eternal gem': 1
		}),
		outputItems: new Bank({ 'Slayer ring (eternal)': 1 }),
		GPCost: 0,
		requiredSkills: {
			crafting: 75
		},
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.RingBling]
	},
	{
		name: 'Slayer helmet',
		inputItems: new Bank({
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
		outputItems: new Bank({ 'Slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade]
	},
	{
		name: 'Slayer helmet (i)',
		inputItems: new Bank({
			'Black mask (i)': 1,
			Earmuffs: 1,
			Facemask: 1,
			'Nose peg': 1,
			'Spiny helmet': 1,
			'Enchanted gem': 1
		}),
		outputItems: new Bank({ 'Slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSkills: {
			crafting: 55
		},
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade]
	},
	{
		name: 'Revert slayer helmet',
		inputItems: new Bank({ 'Slayer helmet': 1 }),
		outputItems: new Bank({
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
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade],
		noCl: true
	},
	{
		name: 'Revert slayer helmet (i)',
		inputItems: new Bank({ 'Slayer helmet (i)': 1 }),
		outputItems: new Bank({
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
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade],
		noCl: true
	},
	{
		name: 'Black slayer helmet',
		inputItems: new Bank({ 'Slayer helmet': 1, 'Kbd heads': 1 }),
		outputItems: new Bank({ 'Black slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KingBlackBonnet]
	},
	{
		name: 'Black slayer helmet (i)',
		inputItems: new Bank({ 'Slayer helmet (i)': 1, 'Kbd heads': 1 }),
		outputItems: new Bank({ 'Black slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KingBlackBonnet]
	},
	{
		name: 'Revert black slayer helmet',
		outputItems: new Bank({ 'Slayer helmet': 1, 'Kbd heads': 1 }),
		inputItems: new Bank({ 'Black slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KingBlackBonnet],
		noCl: true
	},
	{
		name: 'Revert black slayer helmet (i)',
		outputItems: new Bank({ 'Slayer helmet (i)': 1, 'Kbd heads': 1 }),
		inputItems: new Bank({ 'Black slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KingBlackBonnet],
		noCl: true
	},
	{
		name: 'Green slayer helmet',
		inputItems: new Bank({ 'Slayer helmet': 1, 'Kq head': 1 }),
		outputItems: new Bank({ 'Green slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KalphiteKhat]
	},
	{
		name: 'Green slayer helmet (i)',
		inputItems: new Bank({ 'Slayer helmet (i)': 1, 'Kq head': 1 }),
		outputItems: new Bank({ 'Green slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KalphiteKhat]
	},
	{
		name: 'Revert green slayer helmet',
		outputItems: new Bank({ 'Slayer helmet': 1, 'Kq head': 1 }),
		inputItems: new Bank({ 'Green slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KalphiteKhat],
		noCl: true
	},
	{
		name: 'Revert green slayer helmet (i)',
		outputItems: new Bank({ 'Slayer helmet (i)': 1, 'Kq head': 1 }),
		inputItems: new Bank({ 'Green slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.KalphiteKhat],
		noCl: true
	},
	{
		name: 'Red slayer helmet',
		inputItems: new Bank({ 'Slayer helmet': 1, 'Abyssal head': 1 }),
		outputItems: new Bank({ 'Red slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UnholyHelmet]
	},
	{
		name: 'Red slayer helmet (i)',
		inputItems: new Bank({ 'Slayer helmet (i)': 1, 'Abyssal head': 1 }),
		outputItems: new Bank({ 'Red slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UnholyHelmet]
	},
	{
		name: 'Revert red slayer helmet',
		outputItems: new Bank({ 'Slayer helmet': 1, 'Abyssal head': 1 }),
		inputItems: new Bank({ 'Red slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UnholyHelmet],
		noCl: true
	},
	{
		name: 'Revert red slayer helmet (i)',
		outputItems: new Bank({ 'Slayer helmet (i)': 1, 'Abyssal head': 1 }),
		inputItems: new Bank({ 'Red slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UnholyHelmet],
		noCl: true
	},
	{
		name: 'Purple slayer helmet',
		inputItems: new Bank({ 'Slayer helmet': 1, 'Dark claw': 1 }),
		outputItems: new Bank({ 'Purple slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.DarkMantle]
	},
	{
		name: 'Purple slayer helmet (i)',
		inputItems: new Bank({ 'Slayer helmet (i)': 1, 'Dark claw': 1 }),
		outputItems: new Bank({ 'Purple slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.DarkMantle]
	},
	{
		name: 'Revert purple slayer helmet',
		outputItems: new Bank({ 'Slayer helmet': 1, 'Dark claw': 1 }),
		inputItems: new Bank({ 'Purple slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.DarkMantle],
		noCl: true
	},
	{
		name: 'Revert purple slayer helmet (i)',
		outputItems: new Bank({ 'Slayer helmet (i)': 1, 'Dark claw': 1 }),
		inputItems: new Bank({ 'Purple slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.DarkMantle],
		noCl: true
	},
	{
		name: 'Turquoise slayer helmet',
		inputItems: new Bank({ 'Slayer helmet': 1, "Vorkath's head": 1 }),
		outputItems: new Bank({ 'Turquoise slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UndeadHead]
	},
	{
		name: 'Turquoise slayer helmet (i)',
		inputItems: new Bank({ 'Slayer helmet (i)': 1, "Vorkath's head": 1 }),
		outputItems: new Bank({ 'Turquoise slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UndeadHead]
	},
	{
		name: 'Revert turquoise slayer helmet',
		outputItems: new Bank({ 'Slayer helmet': 1, "Vorkath's head": 1 }),
		inputItems: new Bank({ 'Turquoise slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UndeadHead],
		noCl: true
	},
	{
		name: 'Revert turquoise slayer helmet (i)',
		outputItems: new Bank({ 'Slayer helmet (i)': 1, "Vorkath's head": 1 }),
		inputItems: new Bank({ 'Turquoise slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UndeadHead],
		noCl: true
	},
	{
		name: 'Hydra slayer helmet',
		inputItems: new Bank({ 'Slayer helmet': 1, 'Alchemical hydra heads': 1 }),
		outputItems: new Bank({ 'Hydra slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UseMoreHead]
	},
	{
		name: 'Hydra slayer helmet (i)',
		inputItems: new Bank({ 'Slayer helmet (i)': 1, 'Alchemical hydra heads': 1 }),
		outputItems: new Bank({ 'Hydra slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UseMoreHead]
	},
	{
		name: 'Revert hydra slayer helmet',
		outputItems: new Bank({ 'Slayer helmet': 1, 'Alchemical hydra heads': 1 }),
		inputItems: new Bank({ 'Hydra slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UseMoreHead],
		noCl: true
	},
	{
		name: 'Revert hydra slayer helmet (i)',
		outputItems: new Bank({ 'Slayer helmet (i)': 1, 'Alchemical hydra heads': 1 }),
		inputItems: new Bank({ 'Hydra slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.UseMoreHead],
		noCl: true
	},
	{
		name: 'Twisted slayer helmet',
		inputItems: new Bank({ 'Slayer helmet': 1, 'Twisted horns': 1 }),
		outputItems: new Bank({ 'Twisted slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.TwistedVision]
	},
	{
		name: 'Twisted slayer helmet (i)',
		inputItems: new Bank({ 'Slayer helmet (i)': 1, 'Twisted horns': 1 }),
		outputItems: new Bank({ 'Twisted slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.TwistedVision]
	},
	{
		name: 'Revert twisted slayer helmet',
		outputItems: new Bank({ 'Slayer helmet': 1, 'Twisted horns': 1 }),
		inputItems: new Bank({ 'Twisted slayer helmet': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.TwistedVision],
		noCl: true
	},
	{
		name: 'Revert twisted slayer helmet (i)',
		outputItems: new Bank({ 'Slayer helmet (i)': 1, 'Twisted horns': 1 }),
		inputItems: new Bank({ 'Twisted slayer helmet (i)': 1 }),
		GPCost: 0,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade, SlayerTaskUnlocksEnum.TwistedVision],
		noCl: true
	},
	{
		name: 'Emberlight',
		inputItems: new Bank({
			Arclight: 1,
			'Ancient shard': 10,
			'Tormented synapse': 1
		}),
		requiredSkills: { smithing: 74 },
		outputItems: new Bank({ Emberlight: 1 }),
		GPCost: 0
	},
	{
		name: 'Scorching bow',
		inputItems: new Bank({
			'Magic longbow (u)': 1,
			'Tormented synapse': 1
		}),
		requiredSkills: { fletching: 74 },
		outputItems: new Bank({ 'Scorching bow': 1 }),
		GPCost: 0
	},
	{
		name: 'Purging staff',
		inputItems: new Bank({
			Battlestaff: 1,
			'Iron bar': 1,
			'Tormented synapse': 1
		}),
		requiredSkills: { smithing: 55, crafting: 74 },
		outputItems: new Bank({ 'Purging staff': 1 }),
		GPCost: 0
	},
	{
		name: 'Burning claws',
		inputItems: new Bank({
			'Burning claw': 2
		}),
		outputItems: new Bank({ 'Burning claws': 1 }),
		GPCost: 0
	}
];
