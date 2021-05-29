import { Monsters } from 'oldschooljs';

// import itemID from '../../../../util/itemID';
import { Time } from '../../../../constants';
import resolveItems from '../../../../util/resolveItems';
import { KillableMonster } from '../../../types';
// import { GearSetupTypes, GearStat } from '../../../../gear/types';

const KrystiliaMonsters: KillableMonster[] = [
	{
		id: Monsters.ArmadylianGuard.id,
		name: Monsters.ArmadylianGuard.name,
		aliases: Monsters.ArmadylianGuard.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.ArmadylianGuard,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: false,
		difficultyRating: 4,
		qpRequired: 0
	},
	{
		id: Monsters.Bandit.id,
		name: Monsters.Bandit.name,
		aliases: Monsters.Bandit.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.Bandit,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,

		cannonballs: 3,
		cannonBoost: 30
	},
	{
		id: Monsters.BlackKnight.id,
		name: Monsters.BlackKnight.name,
		aliases: Monsters.BlackKnight.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.BlackKnight,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 5,
		qpRequired: 0,

		cannonballs: 5,
		cannonBoost: 30
	},
	{
		id: Monsters.ChaosDruid.id,
		name: Monsters.ChaosDruid.name,
		aliases: Monsters.ChaosDruid.aliases,
		timeToFinish: Time.Second * 17,
		table: Monsters.ChaosDruid,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0,

		cannonballs: 3,
		cannonBoost: 35
	},
	{
		id: Monsters.DarkWarrior.id,
		name: Monsters.DarkWarrior.name,
		aliases: Monsters.DarkWarrior.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.DarkWarrior,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,

		cannonballs: 4,
		cannonBoost: 30
	},
	{
		id: Monsters.DeadlyRedSpider.id,
		name: Monsters.DeadlyRedSpider.name,
		aliases: Monsters.DeadlyRedSpider.aliases,
		timeToFinish: Time.Second * 24,
		table: Monsters.DeadlyRedSpider,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,

		cannonballs: 4,
		cannonBoost: 30
	},
	{
		id: Monsters.ElderChaosDruid.id,
		name: Monsters.ElderChaosDruid.name,
		aliases: Monsters.ElderChaosDruid.aliases,
		timeToFinish: Time.Second * 56,
		table: Monsters.ElderChaosDruid,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,

		cannonballs: 8,
		cannonBoost: 35
	},
	{
		id: Monsters.Ent.id,
		name: Monsters.Ent.name,
		aliases: Monsters.Ent.aliases,
		timeToFinish: Time.Second * 37,
		table: Monsters.Ent,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Dragon axe', 'Rune axe']),
		qpRequired: 0
	},
	{
		id: Monsters.GuardBandit.id,
		name: Monsters.GuardBandit.name,
		aliases: Monsters.GuardBandit.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.GuardBandit,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.LavaDragon.id,
		name: Monsters.LavaDragon.name,
		aliases: Monsters.LavaDragon.aliases,
		timeToFinish: Time.Second * 110,
		table: Monsters.LavaDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,

		cannonballs: 6,
		cannonBoost: 30
	},
	{
		id: Monsters.MagicAxe.id,
		name: Monsters.MagicAxe.name,
		aliases: Monsters.MagicAxe.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.MagicAxe,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Lockpick']),
		qpRequired: 0,
		levelRequirements: {
			// theiving: 23
		}
	},
	{
		id: Monsters.Mammoth.id,
		name: Monsters.Mammoth.name,
		aliases: Monsters.Mammoth.aliases,
		timeToFinish: Time.Second * 38,
		table: Monsters.Mammoth,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,

		cannonballs: 7,
		cannonBoost: 35
	},
	{
		id: Monsters.Pirate.id,
		name: Monsters.Pirate.name,
		aliases: Monsters.Pirate.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Pirate,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantCyclops.id,
		name: Monsters.RevenantCyclops.name,
		aliases: Monsters.RevenantCyclops.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.RevenantCyclops,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantDarkBeast.id,
		name: Monsters.RevenantDarkBeast.name,
		aliases: Monsters.RevenantDarkBeast.aliases,
		timeToFinish: Time.Second * 50,
		table: Monsters.RevenantDarkBeast,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantDemon.id,
		name: Monsters.RevenantDemon.name,
		aliases: Monsters.RevenantDemon.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.RevenantDemon,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantDragon.id,
		name: Monsters.RevenantDragon.name,
		aliases: Monsters.RevenantDragon.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.RevenantDragon,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantGoblin.id,
		name: Monsters.RevenantGoblin.name,
		aliases: Monsters.RevenantGoblin.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.RevenantGoblin,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantHellhound.id,
		name: Monsters.RevenantHellhound.name,
		aliases: Monsters.RevenantHellhound.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.RevenantHellhound,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantHobgoblin.id,
		name: Monsters.RevenantHobgoblin.name,
		aliases: Monsters.RevenantHobgoblin.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.RevenantHobgoblin,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantImp.id,
		name: Monsters.RevenantImp.name,
		aliases: Monsters.RevenantImp.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.RevenantImp,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantKnight.id,
		name: Monsters.RevenantKnight.name,
		aliases: Monsters.RevenantKnight.aliases,
		timeToFinish: Time.Second * 55,
		table: Monsters.RevenantKnight,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantOrk.id,
		name: Monsters.RevenantOrk.name,
		aliases: Monsters.RevenantOrk.aliases,
		timeToFinish: Time.Second * 45,
		table: Monsters.RevenantOrk,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantPyrefiend.id,
		name: Monsters.RevenantPyrefiend.name,
		aliases: Monsters.RevenantPyrefiend.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.RevenantPyrefiend,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.Rogue.id,
		name: Monsters.Rogue.name,
		aliases: Monsters.Rogue.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Rogue,
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 5,
		qpRequired: 0,

		cannonballs: 4,
		cannonBoost: 35
	}
];

export default KrystiliaMonsters;
