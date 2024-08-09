import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import { deepResolveItems, resolveItems } from 'oldschooljs/dist/util/util';
import type { KillableMonster } from '../../types';

export const krystiliaMonsters: KillableMonster[] = [
	{
		id: Monsters.BlackKnight.id,
		name: Monsters.BlackKnight.name,
		aliases: Monsters.BlackKnight.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.BlackKnight,
		wildy: true,

		difficultyRating: 5,
		qpRequired: 0,
		canCannon: true,
		pkActivityRating: 1,
		pkBaseDeathChance: 1,
		revsWeaponBoost: true,
		wildyMulti: true
	},
	{
		id: Monsters.ChaosDruid.id,
		name: Monsters.ChaosDruid.name,
		aliases: Monsters.ChaosDruid.aliases,
		timeToFinish: Time.Second * 17,
		table: Monsters.ChaosDruid,

		wildy: true,

		difficultyRating: 2,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		pkActivityRating: 1,
		pkBaseDeathChance: 1,
		revsWeaponBoost: true
	},
	{
		id: Monsters.DarkWarrior.id,
		name: Monsters.DarkWarrior.name,
		aliases: Monsters.DarkWarrior.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.DarkWarrior,

		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		pkActivityRating: 1,
		pkBaseDeathChance: 1,
		revsWeaponBoost: true,
		wildyMulti: true
	},
	{
		id: Monsters.DeadlyRedSpider.id,
		name: Monsters.DeadlyRedSpider.name,
		aliases: Monsters.DeadlyRedSpider.aliases,
		timeToFinish: Time.Second * 24,
		table: Monsters.DeadlyRedSpider,

		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		revsWeaponBoost: true
	},
	{
		id: Monsters.ElderChaosDruid.id,
		name: Monsters.ElderChaosDruid.name,
		aliases: Monsters.ElderChaosDruid.aliases,
		timeToFinish: Time.Second * 56,
		table: Monsters.ElderChaosDruid,

		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false,
		pkActivityRating: 2,
		pkBaseDeathChance: 7,
		revsWeaponBoost: true,
		wildyMulti: true
	},
	{
		id: Monsters.Ent.id,
		name: Monsters.Ent.name,
		aliases: Monsters.Ent.aliases,
		timeToFinish: Time.Second * 37,
		table: Monsters.Ent,

		wildy: true,

		difficultyRating: 3,
		itemsRequired: deepResolveItems([['Dragon axe', 'Rune axe']]),
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		pkActivityRating: 2,
		pkBaseDeathChance: 4,
		revsWeaponBoost: true
	},
	{
		id: Monsters.GuardBandit.id,
		name: Monsters.GuardBandit.name,
		aliases: Monsters.GuardBandit.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.GuardBandit,

		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false,
		pkActivityRating: 1,
		pkBaseDeathChance: 1,
		revsWeaponBoost: true,
		canBePked: true,
		wildyMulti: true
	},
	{
		id: Monsters.LavaDragon.id,
		name: Monsters.LavaDragon.name,
		aliases: Monsters.LavaDragon.aliases,
		timeToFinish: Time.Second * 110,
		table: Monsters.LavaDragon,

		wildy: true,

		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		pkActivityRating: 3,
		pkBaseDeathChance: 4,
		revsWeaponBoost: true,
		canBePked: true,
		wildyMulti: true
	},
	{
		id: Monsters.MagicAxe.id,
		name: Monsters.MagicAxe.name,
		aliases: Monsters.MagicAxe.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.MagicAxe,

		wildy: true,

		difficultyRating: 3,
		itemsRequired: resolveItems(['Lockpick']),
		qpRequired: 0,
		levelRequirements: {
			thieving: 23
		},
		pkActivityRating: 1,
		pkBaseDeathChance: 1,
		revsWeaponBoost: true,
		canCannon: true
	},
	{
		id: Monsters.Mammoth.id,
		name: Monsters.Mammoth.name,
		aliases: Monsters.Mammoth.aliases,
		timeToFinish: Time.Second * 38,
		table: Monsters.Mammoth,

		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false,
		pkActivityRating: 1,
		pkBaseDeathChance: 1,
		revsWeaponBoost: true,
		canBePked: true,
		wildyMulti: true
	},
	{
		id: Monsters.Pirate.id,
		name: Monsters.Pirate.name,
		aliases: Monsters.Pirate.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Pirate,

		wildy: true,

		difficultyRating: 3,
		itemsRequired: resolveItems(['Lockpick']),
		levelRequirements: {
			thieving: 39
		},
		qpRequired: 0,
		pkActivityRating: 1,
		pkBaseDeathChance: 1,
		revsWeaponBoost: true
	}
];
