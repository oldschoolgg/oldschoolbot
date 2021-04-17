import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import resolveItems from '../../../util/resolveItems';
import { KillableMonster } from '../../types';

export const krystiliaMonsters: KillableMonster[] = [
	{
		id: Monsters.ArmadylianGuard.id,
		name: Monsters.ArmadylianGuard.name,
		aliases: Monsters.ArmadylianGuard.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.ArmadylianGuard,
		wildy: true,
		canBeKilled: false,
		difficultyRating: 4,
		qpRequired: 0
	},
	{
		id: Monsters.DesertBandit.id,
		name: Monsters.DesertBandit.name,
		aliases: Monsters.DesertBandit.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.DesertBandit,
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0
	},
	{
		id: Monsters.BlackKnight.id,
		name: Monsters.BlackKnight.name,
		aliases: Monsters.BlackKnight.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.BlackKnight,
		wildy: true,
		canBeKilled: true,
		difficultyRating: 5,
		qpRequired: 0
	},
	{
		id: Monsters.ChaosDruid.id,
		name: Monsters.ChaosDruid.name,
		aliases: Monsters.ChaosDruid.aliases,
		timeToFinish: Time.Second * 17,
		table: Monsters.ChaosDruid,

		wildy: true,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.DarkWarrior.id,
		name: Monsters.DarkWarrior.name,
		aliases: Monsters.DarkWarrior.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.DarkWarrior,

		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.DeadlyRedSpider.id,
		name: Monsters.DeadlyRedSpider.name,
		aliases: Monsters.DeadlyRedSpider.aliases,
		timeToFinish: Time.Second * 24,
		table: Monsters.DeadlyRedSpider,

		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.ElderChaosDruid.id,
		name: Monsters.ElderChaosDruid.name,
		aliases: Monsters.ElderChaosDruid.aliases,
		timeToFinish: Time.Second * 56,
		table: Monsters.ElderChaosDruid,

		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.Ent.id,
		name: Monsters.Ent.name,
		aliases: Monsters.Ent.aliases,
		timeToFinish: Time.Second * 37,
		table: Monsters.Ent,

		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Dragon axe', 'Rune axe']),
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.GuardBandit.id,
		name: Monsters.GuardBandit.name,
		aliases: Monsters.GuardBandit.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.GuardBandit,

		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.LavaDragon.id,
		name: Monsters.LavaDragon.name,
		aliases: Monsters.LavaDragon.aliases,
		timeToFinish: Time.Second * 110,
		table: Monsters.LavaDragon,

		wildy: true,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0
	},
	{
		id: Monsters.MagicAxe.id,
		name: Monsters.MagicAxe.name,
		aliases: Monsters.MagicAxe.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.MagicAxe,

		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		// itemsRequired: resolveItems(['Lockpick']),
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

		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.Pirate.id,
		name: Monsters.Pirate.name,
		aliases: Monsters.Pirate.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Pirate,

		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		// itemsRequired: resolveItems(['Lockpick']),
		levelRequirements: {
			//thieving: 39
		},
		qpRequired: 0
	},
	{
		id: Monsters.RevenantCyclops.id,
		name: Monsters.RevenantCyclops.name,
		aliases: Monsters.RevenantCyclops.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.RevenantCyclops,

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

		wildy: true,
		canBeKilled: true,
		difficultyRating: 5,
		qpRequired: 0
	}
];
