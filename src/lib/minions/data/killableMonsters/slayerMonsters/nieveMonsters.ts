import { Monsters } from 'oldschooljs';
import { KillableMonster } from '../../../types';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import itemID from '../../../../util/itemID';
import { Time } from '../../../../constants';
// import { GearSetupTypes, GearStat } from '../../../../gear/types';

const NieveMonsters: KillableMonster[] = [
	{
		id: Monsters.BabyBlackDragon.id,
		name: Monsters.BabyBlackDragon.name,
		aliases: Monsters.BabyBlackDragon.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.BabyBlackDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon hunter lance')]: 10
		},
		slayerHelmBoost: 8,
		cannonballs: 4,
		cannonBoost: 35
	},
	{
		id: Monsters.BlackDragon.id,
		name: Monsters.BlackDragon.name,
		aliases: Monsters.BlackDragon.aliases,
		timeToFinish: Time.Second * 75,
		table: Monsters.BlackDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon hunter lance')]: 15
		},
		slayerHelmBoost: 13,
		cannonballs: 15,
		cannonBoost: 35
	},
	{
		id: Monsters.BrutalBlackDragon.id,
		name: Monsters.BrutalBlackDragon.name,
		aliases: Monsters.BrutalBlackDragon.aliases,
		timeToFinish: Time.Second * 165,
		table: Monsters.BrutalBlackDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			['Anti-dragon shield', 'Dragonfire shield', 'Dragonfire ward'],
			['Rune crossbow', "Karil's crossbow", 'Armadyl crossbow'],
			['Armadyl chestplate', "Karil's leathertop"],
			['Armadyl chainskirt', "Karil's leatherskirt"]
		]),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon hunter crossbow')]: 10
		},
		levelRequirements: {
			prayer: 43
		},
		slayerHelmBoost: 14
	},
	{
		// Disabled until futher
		id: Monsters.GiantScarab.id,
		name: Monsters.GiantScarab.name,
		aliases: Monsters.GiantScarab.aliases,
		timeToFinish: Time.Minute * 3,
		table: Monsters.GiantScarab,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 6,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 14,
			[itemID('Keris')]: 10
		},
		levelRequirements: {}
	},
	{
		id: Monsters.LocustRider.id,
		name: Monsters.LocustRider.name,
		aliases: Monsters.LocustRider.aliases,
		timeToFinish: Time.Second * 74,
		table: Monsters.LocustRider,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,
		slayerHelmBoost: 14,
		cannonballs: 12,
		cannonBoost: 30
	},
	{
		id: Monsters.ScarabMage.id,
		name: Monsters.ScarabMage.name,
		aliases: Monsters.ScarabMage.aliases,
		timeToFinish: Time.Second * 45,
		table: Monsters.ScarabMage,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,
		slayerHelmBoost: 10,
		cannonballs: 7,
		cannonBoost: 30
	},
	{
		id: Monsters.Scarabs.id,
		name: Monsters.Scarabs.name,
		aliases: Monsters.Scarabs.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.Scarabs,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		slayerHelmBoost: 8,
		cannonballs: 4,
		cannonBoost: 30
	},
	{
		id: Monsters.ScarabSwarm.id,
		name: Monsters.ScarabSwarm.name,
		aliases: Monsters.ScarabSwarm.aliases,
		timeToFinish: Time.Second * 32,
		table: Monsters.ScarabSwarm,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0,
		slayerHelmBoost: 10,
		cannonballs: 6,
		cannonBoost: 35
	},
	{
		id: Monsters.SteelDragon.id,
		name: Monsters.SteelDragon.name,
		aliases: Monsters.SteelDragon.aliases,
		timeToFinish: Time.Second * 45,
		table: Monsters.SteelDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon hunter lance')]: 10
		},
		levelRequirements: {
			prayer: 43
		},
		slayerHelmBoost: 11,
		cannonballs: 8,
		cannonBoost: 30
	},
	{
		id: Monsters.Suqah.id,
		name: Monsters.Suqah.name,
		aliases: Monsters.Suqah.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Suqah,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,
		slayerHelmBoost: 10,
		cannonballs: 4,
		cannonBoost: 25
	}
];

export default NieveMonsters;
