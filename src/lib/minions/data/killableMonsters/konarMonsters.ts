import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import resolveItems, { deepResolveItems } from '../../../util/resolveItems';
import { KillableMonster } from '../../types';

export const konarMonsters: KillableMonster[] = [
	{
		id: Monsters.AdamantDragon.id,
		name: Monsters.AdamantDragon.name,
		aliases: Monsters.AdamantDragon.aliases,
		timeToFinish: Time.Second * 160,
		table: Monsters.AdamantDragon,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: resolveItems(['Anti-dragon shield', 'Antidote++(4)']),
		qpRequired: 205,
		itemInBankBoosts: [
			{
				[itemID('Dragon hunter lance')]: 10
			}
		]
	},
	{
		id: Monsters.BabyRedDragon.id,
		name: Monsters.BabyRedDragon.name,
		aliases: Monsters.BabyRedDragon.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.BabyRedDragon,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Dragon hunter lance')]: 10
			}
		]
	},
	{
		id: Monsters.BrutalRedDragon.id,
		name: Monsters.BrutalRedDragon.name,
		aliases: Monsters.BrutalRedDragon.aliases,
		timeToFinish: Time.Second * 155,
		table: Monsters.BrutalRedDragon,

		wildy: false,
		canBeKilled: true,
		existsInCatacombs: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Dragon hunter lance')]: 10
			}
		]
	},
	{
		id: Monsters.DarkBeast.id,
		name: Monsters.DarkBeast.name,
		aliases: Monsters.DarkBeast.aliases,
		timeToFinish: Time.Second * 55,
		table: Monsters.DarkBeast,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		qpRequired: 0,
		levelRequirements: {
			slayer: 90
		},
		superior: Monsters.NightBeast
	},
	{
		id: Monsters.Drake.id,
		name: Monsters.Drake.name,
		aliases: Monsters.Drake.aliases,
		timeToFinish: Time.Second * 80,
		table: Monsters.Drake,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: deepResolveItems([
			['Boots of stone', 'Boots of brimstone', 'Granite boots'],
			'Anti-dragon shield'
		]),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Dragon hunter lance')]: 10
			}
		],
		levelRequirements: {
			slayer: 84
		},

		superior: Monsters.GuardianDrake
	},
	{
		id: Monsters.Hydra.id,
		name: Monsters.Hydra.name,
		aliases: Monsters.Hydra.aliases,
		timeToFinish: Time.Second * 160,
		table: Monsters.Hydra,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: deepResolveItems([
			['Boots of stone', 'Boots of brimstone', 'Granite boots'],
			'Antidote++(4)'
		]),
		notifyDrops: resolveItems(['Hydra tail']),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Dragon hunter lance')]: 10
			}
		],
		levelRequirements: {
			slayer: 95
		},
		superior: Monsters.ColossalHydra
	},
	{
		id: Monsters.AlchemicalHydra.id,
		name: Monsters.AlchemicalHydra.name,
		aliases: Monsters.AlchemicalHydra.aliases,
		timeToFinish: Time.Second * 240,
		table: Monsters.AlchemicalHydra,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: deepResolveItems([
			['Boots of stone', 'Boots of brimstone', 'Granite boots'],
			'Antidote++(4)'
		]),
		notifyDrops: resolveItems([
			'Hydra leather',
			'Hydra tail',
			"Hydra's claw",
			'Ikkle hydra',
			'Jar of chemicals'
		]),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Dragon hunter crossbow')]: 8,
				[itemID('Dragon hunter lance')]: 10,
				[itemID('Twisted bow')]: 12
			}
		],
		slayerOnly: true,
		levelRequirements: {
			slayer: 95
		}
	},
	{
		id: Monsters.MithrilDragon.id,
		name: Monsters.MithrilDragon.name,
		aliases: Monsters.MithrilDragon.aliases,
		timeToFinish: Time.Second * 55,
		table: Monsters.MithrilDragon,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Dragon full helm']),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Dragon hunter lance')]: 10,
				[itemID('Dragon hunter crossbow')]: 10
			}
		]
	},
	{
		id: Monsters.RedDragon.id,
		name: Monsters.RedDragon.name,
		aliases: Monsters.RedDragon.aliases,
		timeToFinish: Time.Second * 54,
		table: Monsters.RedDragon,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0
	},
	{
		id: Monsters.RuneDragon.id,
		name: Monsters.RuneDragon.name,
		aliases: Monsters.RuneDragon.aliases,
		timeToFinish: Time.Second * 130,
		table: Monsters.RuneDragon,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield', 'Insulated boots']),
		notifyDrops: resolveItems(['Dragon metal lump', 'Draconic visage']),
		qpRequired: 205,
		itemInBankBoosts: [
			{
				[itemID('Dragon hunter lance')]: 10
			}
		]
	},
	{
		id: Monsters.SmokeDevil.id,
		name: Monsters.SmokeDevil.name,
		aliases: Monsters.SmokeDevil.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.SmokeDevil,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: deepResolveItems([['Facemask', 'Slayer helmet']]),
		notifyDrops: resolveItems(['Dragon chainbody']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 93
		},
		slayerOnly: true,
		superior: Monsters.NuclearSmokeDevil
	},
	{
		id: Monsters.ThermonuclearSmokeDevil.id,
		name: Monsters.ThermonuclearSmokeDevil.name,
		aliases: Monsters.ThermonuclearSmokeDevil.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.ThermonuclearSmokeDevil,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([['Facemask', 'Slayer helmet']]),
		notifyDrops: resolveItems(['Dragon chainbody', 'Smoke Battlestaff', 'Pet smoke devil']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 93
		},
		slayerOnly: true,
		itemInBankBoosts: [
			{
				[itemID('Dragon warhammer')]: 5,
				[itemID('Dragon claws')]: 10
			}
		]
	},
	{
		id: Monsters.Waterfiend.id,
		name: Monsters.Waterfiend.name,
		aliases: Monsters.Waterfiend.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.Waterfiend,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		notifyDrops: resolveItems(['Mist battlestaff']),
		qpRequired: 0
	}
];
