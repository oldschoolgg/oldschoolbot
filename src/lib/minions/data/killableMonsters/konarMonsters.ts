import { Monsters } from 'oldschooljs';

import { Time } from '../../../../constants';
import { FaceMaskSlayerHelmets } from '../../../../skilling/skills/slayer/slayerHelmets';
import itemID from '../../../../util/itemID';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import { KillableMonster } from '../../../types';
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
		itemsRequired: resolveItems(['Anti-dragon shield', 'Antidote++(4)']),
		qpRequired: 205,
		itemInBankBoosts: {
			[itemID('Dragon hunter lance')]: 10
		}
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
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon hunter lance')]: 10
		}
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
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon hunter lance')]: 10
		}
	},
	{
		id: Monsters.DarkBeast.id,
		name: Monsters.DarkBeast.name,
		aliases: Monsters.DarkBeast.aliases,
		timeToFinish: Time.Second * 55,
		table: Monsters.DarkBeast,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		qpRequired: 0,
		levelRequirements: {
			slayer: 90
		},

		superiorName: Monsters.NightBeast.name,
		superiorId: Monsters.NightBeast.id,
		superiorTable: Monsters.NightBeast,
		cannonballs: 4,
		cannonBoost: 35
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
			['Boots of stone', 'Boots of brimstone', 'Granite boots'],
			'Anti-dragon shield'
		]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon hunter lance')]: 10
		},
		levelRequirements: {
			slayer: 84
		},

		superiorName: Monsters.GuardianDrake.name,
		superiorId: Monsters.GuardianDrake.id,
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
			['Boots of stone', 'Boots of brimstone', 'Granite boots'],
			'Antidote++(4)'
		]),
		notifyDrops: resolveItems(['Hydra tail']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon hunter lance')]: 10
		},
		levelRequirements: {
			slayer: 95
		},

		superiorName: Monsters.ColossalHydra.name,
		superiorId: Monsters.ColossalHydra.id,
		superiorTable: Monsters.ColossalHydra,
		cannonballs: 12,
		cannonBoost: 30
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
		notifyDrops: resolveItems(['Dragon full helm']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon hunter lance')]: 10
		}
	},
	{
		id: Monsters.RedDragon.id,
		name: Monsters.RedDragon.name,
		aliases: Monsters.RedDragon.aliases,
		timeToFinish: Time.Second * 54,
		table: Monsters.RedDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0,

		cannonballs: 7,
		cannonBoost: 30
	},
	{
		id: Monsters.RuneDragon.id,
		name: Monsters.RuneDragon.name,
		aliases: Monsters.RuneDragon.aliases,
		timeToFinish: Time.Second * 130,
		table: Monsters.RuneDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield', 'Insulated boots']),
		notifyDrops: resolveItems(['Dragon metal lump', 'Draconic visage']),
		qpRequired: 205,
		itemInBankBoosts: {
			[itemID('Dragon hunter lance')]: 10
		}
	},
	{
		id: Monsters.SmokeDevil.id,
		name: Monsters.SmokeDevil.name,
		aliases: Monsters.SmokeDevil.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.SmokeDevil,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: deepResolveItems([FaceMaskSlayerHelmets]),
		notifyDrops: resolveItems(['Dragon chainbody']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 93
		},

		slayerOnly: true,
		superiorName: Monsters.NuclearSmokeDevil.name,
		superiorId: Monsters.NuclearSmokeDevil.id,
		superiorTable: Monsters.NuclearSmokeDevil,
		cannonballs: 5,
		cannonBoost: 35,
		barrageAmount: 2,
		barrageBoost: 35
	},
	{
		id: Monsters.Waterfiend.id,
		name: Monsters.Waterfiend.name,
		aliases: Monsters.Waterfiend.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.Waterfiend,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		notifyDrops: resolveItems(['Mist battlestaff']),
		qpRequired: 0,

		cannonballs: 6,
		cannonBoost: 30
	}
];

export default KonarMonsters;
