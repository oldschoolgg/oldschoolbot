import { Monsters } from 'oldschooljs';
import { KillableMonster } from '../../../types';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import itemID from '../../../../util/itemID';
import { Time } from '../../../../constants';
// import { GearSetupTypes, GearStat } from '../../../../gear/types';

const KonarMonsters: KillableMonster[] = [
	{
		id: Monsters.AdamantDragon.id,
		name: Monsters.AdamantDragon.name,
		aliases: Monsters.AdamantDragon.aliases,
		timeToFinish: Time.Second * 160,
		table: Monsters.AdamantDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems([]),
		qpRequired: 205,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 15
		},
		levelRequirements: {}
	},
	{
		id: Monsters.BabyRedDragon.id,
		name: Monsters.BabyRedDragon.name,
		aliases: Monsters.BabyRedDragon.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.BabyRedDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {}
	},
	{
		id: Monsters.BrutalRedDragon.id,
		name: Monsters.BrutalRedDragon.name,
		aliases: Monsters.BrutalRedDragon.aliases,
		timeToFinish: Time.Second * 155,
		table: Monsters.BrutalRedDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 14
		},
		levelRequirements: {}
	},
	{
		id: Monsters.DarkBeast.id,
		name: Monsters.DarkBeast.name,
		aliases: Monsters.DarkBeast.aliases,
		timeToFinish: Time.Second * 100,
		table: Monsters.DarkBeast,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 14
		},
		levelRequirements: {
			slayer: 90
		},
		superiorTable: Monsters.NightBeast
	},
	{
		id: Monsters.Drake.id,
		name: Monsters.Drake.name,
		aliases: Monsters.Drake.aliases,
		timeToFinish: Time.Second * 80,
		table: Monsters.Drake,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: deepResolveItems([
			['Boots of stone', 'Boots of brimstone', 'Granite boots']
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {
			slayer: 84
		},
		superiorTable: Monsters.GuardianDrake
	},
	{
		id: Monsters.Hydra.id,
		name: Monsters.Hydra.name,
		aliases: Monsters.Hydra.aliases,
		timeToFinish: Time.Second * 160,
		table: Monsters.Hydra,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: deepResolveItems([
			['Boots of stone', 'Boots of brimstone', 'Granite boots']
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 15
		},
		levelRequirements: {
			slayer: 95
		},
		superiorTable: Monsters.ColossalHydra
	},
	{
		id: Monsters.MithrilDragon.id,
		name: Monsters.MithrilDragon.name,
		aliases: Monsters.MithrilDragon.aliases,
		timeToFinish: Time.Second * 55,
		table: Monsters.MithrilDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {}
	},
	{
		id: Monsters.RedDragon.id,
		name: Monsters.RedDragon.name,
		aliases: Monsters.RedDragon.aliases,
		timeToFinish: Time.Second * 65,
		table: Monsters.RedDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 13
		},
		levelRequirements: {}
	},
	{
		id: Monsters.RuneDragon.id,
		name: Monsters.RuneDragon.name,
		aliases: Monsters.RuneDragon.aliases,
		timeToFinish: Time.Second * 140,
		table: Monsters.RuneDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 13
		},
		levelRequirements: {}
	},
	{
		id: Monsters.SmokeDevil.id,
		name: Monsters.SmokeDevil.name,
		aliases: Monsters.SmokeDevil.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.SmokeDevil,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: deepResolveItems([['Facemask', 'Slayer helmet', 'Slayer helmet (i)']]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 13
		},
		levelRequirements: {
			slayer: 93
		},
		slayerOnly: true,
		superiorTable: Monsters.NuclearSmokeDevil
	},
	{
		id: Monsters.Waterfiend.id,
		name: Monsters.Waterfiend.name,
		aliases: Monsters.Waterfiend.aliases,
		timeToFinish: Time.Second * 34,
		table: Monsters.Waterfiend,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {}
	}
];

export default KonarMonsters;
