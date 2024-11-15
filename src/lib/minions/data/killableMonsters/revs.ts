import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import type { KillableMonster } from '../../types';

export const revenantMonsters: KillableMonster[] = [
	{
		id: Monsters.RevenantCyclops.id,
		name: Monsters.RevenantCyclops.name,
		aliases: Monsters.RevenantCyclops.aliases,
		timeToFinish: Time.Second * 82,
		table: Monsters.RevenantCyclops,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 9,
		pkBaseDeathChance: 8,
		itemCost: [
			{
				itemCost: new Bank().add('Blighted super restore (4)', 1),
				qtyPerMinute: 0.17,
				alternativeConsumables: [
					{ itemCost: new Bank().add('Super restore (4)', 1), qtyPerMinute: 0.17 },
					{ itemCost: new Bank().add('Prayer potion (4)', 1), qtyPerMinute: 0.17 }
				]
			},
			{
				itemCost: new Bank().add('Revenant cave teleport'),
				qtyPerKill: 0.05,
				boostPercent: 5,
				optional: true
			}
		],
		canBePked: true
	},
	{
		id: Monsters.RevenantDarkBeast.id,
		name: Monsters.RevenantDarkBeast.name,
		aliases: Monsters.RevenantDarkBeast.aliases,
		timeToFinish: Time.Second * 114,
		table: Monsters.RevenantDarkBeast,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 9,
		pkBaseDeathChance: 8,
		itemCost: [
			{
				itemCost: new Bank().add('Blighted super restore (4)', 1),
				qtyPerMinute: 0.17,
				alternativeConsumables: [
					{ itemCost: new Bank().add('Super restore (4)', 1), qtyPerMinute: 0.17 },
					{ itemCost: new Bank().add('Prayer potion (4)', 1), qtyPerMinute: 0.17 }
				]
			},
			{
				itemCost: new Bank().add('Revenant cave teleport'),
				qtyPerKill: 0.05,
				boostPercent: 5,
				optional: true
			}
		],
		canBePked: true
	},
	{
		id: Monsters.RevenantDemon.id,
		name: Monsters.RevenantDemon.name,
		aliases: Monsters.RevenantDemon.aliases,
		timeToFinish: Time.Second * 82,
		table: Monsters.RevenantDemon,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 9,
		pkBaseDeathChance: 8,
		itemCost: [
			{
				itemCost: new Bank().add('Blighted super restore (4)', 1),
				qtyPerMinute: 0.17,
				alternativeConsumables: [
					{ itemCost: new Bank().add('Super restore (4)', 1), qtyPerMinute: 0.17 },
					{ itemCost: new Bank().add('Prayer potion (4)', 1), qtyPerMinute: 0.17 }
				]
			},
			{
				itemCost: new Bank().add('Revenant cave teleport'),
				qtyPerKill: 0.05,
				boostPercent: 5,
				optional: true
			}
		],
		canBePked: true
	},
	{
		id: Monsters.RevenantDragon.id,
		name: Monsters.RevenantDragon.name,
		aliases: Monsters.RevenantDragon.aliases,
		timeToFinish: Time.Second * 147,
		table: Monsters.RevenantDragon,
		wildy: true,
		difficultyRating: 10,
		qpRequired: 0,
		pkActivityRating: 9,
		pkBaseDeathChance: 8,
		itemCost: [
			{
				itemCost: new Bank().add('Blighted super restore (4)', 1),
				qtyPerMinute: 0.17,
				alternativeConsumables: [
					{ itemCost: new Bank().add('Super restore (4)', 1), qtyPerMinute: 0.17 },
					{ itemCost: new Bank().add('Prayer potion (4)', 1), qtyPerMinute: 0.17 }
				]
			},
			{
				itemCost: new Bank().add('Revenant cave teleport'),
				qtyPerKill: 0.05,
				boostPercent: 5,
				optional: true
			}
		],
		canBePked: true
	},
	{
		id: Monsters.RevenantGoblin.id,
		name: Monsters.RevenantGoblin.name,
		aliases: Monsters.RevenantGoblin.aliases,
		timeToFinish: Time.Second * 41,
		table: Monsters.RevenantGoblin,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 8,
		pkBaseDeathChance: 8,
		canBePked: true,
		itemCost: [
			{
				itemCost: new Bank().add('Revenant cave teleport'),
				qtyPerKill: 0.05,
				boostPercent: 5,
				optional: true
			}
		]
	},
	{
		id: Monsters.RevenantHellhound.id,
		name: Monsters.RevenantHellhound.name,
		aliases: Monsters.RevenantHellhound.aliases,
		timeToFinish: Time.Second * 90,
		table: Monsters.RevenantHellhound,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 9,
		pkBaseDeathChance: 8,
		itemCost: [
			{
				itemCost: new Bank().add('Blighted super restore (4)', 1),
				qtyPerMinute: 0.17,
				alternativeConsumables: [
					{ itemCost: new Bank().add('Super restore (4)', 1), qtyPerMinute: 0.17 },
					{ itemCost: new Bank().add('Prayer potion (4)', 1), qtyPerMinute: 0.17 }
				]
			},
			{
				itemCost: new Bank().add('Revenant cave teleport'),
				qtyPerKill: 0.05,
				boostPercent: 5,
				optional: true
			}
		],
		canBePked: true
	},
	{
		id: Monsters.RevenantHobgoblin.id,
		name: Monsters.RevenantHobgoblin.name,
		aliases: Monsters.RevenantHobgoblin.aliases,
		timeToFinish: Time.Second * 74,
		table: Monsters.RevenantHobgoblin,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 9,
		pkBaseDeathChance: 8,
		itemCost: [
			{
				itemCost: new Bank().add('Blighted super restore (4)', 1),
				qtyPerMinute: 0.17,
				alternativeConsumables: [
					{ itemCost: new Bank().add('Super restore (4)', 1), qtyPerMinute: 0.17 },
					{ itemCost: new Bank().add('Prayer potion (4)', 1), qtyPerMinute: 0.17 }
				]
			},
			{
				itemCost: new Bank().add('Revenant cave teleport'),
				qtyPerKill: 0.05,
				boostPercent: 5,
				optional: true
			}
		],
		canBePked: true
	},
	{
		id: Monsters.RevenantImp.id,
		name: Monsters.RevenantImp.name,
		aliases: Monsters.RevenantImp.aliases,
		timeToFinish: Time.Second * 33,
		table: Monsters.RevenantImp,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 8,
		pkBaseDeathChance: 8,
		canBePked: true,
		itemCost: [
			{
				itemCost: new Bank().add('Revenant cave teleport'),
				qtyPerKill: 0.05,
				boostPercent: 5,
				optional: true
			}
		]
	},
	{
		id: Monsters.RevenantKnight.id,
		name: Monsters.RevenantKnight.name,
		aliases: Monsters.RevenantKnight.aliases,
		timeToFinish: Time.Second * 123,
		table: Monsters.RevenantKnight,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 9,
		pkBaseDeathChance: 8,
		itemCost: [
			{
				itemCost: new Bank().add('Blighted super restore (4)', 1),
				qtyPerMinute: 0.17,
				alternativeConsumables: [
					{ itemCost: new Bank().add('Super restore (4)', 1), qtyPerMinute: 0.17 },
					{ itemCost: new Bank().add('Prayer potion (4)', 1), qtyPerMinute: 0.17 }
				]
			},
			{
				itemCost: new Bank().add('Revenant cave teleport'),
				qtyPerKill: 0.05,
				boostPercent: 5,
				optional: true
			}
		],
		canBePked: true
	},
	{
		id: Monsters.RevenantOrk.id,
		name: Monsters.RevenantOrk.name,
		aliases: Monsters.RevenantOrk.aliases,
		timeToFinish: Time.Second * 106,
		table: Monsters.RevenantOrk,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 9,
		pkBaseDeathChance: 8,
		itemCost: [
			{
				itemCost: new Bank().add('Blighted super restore (4)', 1),
				qtyPerMinute: 0.17,
				alternativeConsumables: [
					{ itemCost: new Bank().add('Super restore (4)', 1), qtyPerMinute: 0.17 },
					{ itemCost: new Bank().add('Prayer potion (4)', 1), qtyPerMinute: 0.17 }
				]
			},
			{
				itemCost: new Bank().add('Revenant cave teleport'),
				qtyPerKill: 0.05,
				boostPercent: 5,
				optional: true
			}
		],
		canBePked: true
	},
	{
		id: Monsters.RevenantPyrefiend.id,
		name: Monsters.RevenantPyrefiend.name,
		aliases: Monsters.RevenantPyrefiend.aliases,
		timeToFinish: Time.Second * 65,
		table: Monsters.RevenantPyrefiend,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 9,
		pkBaseDeathChance: 8,
		itemCost: [
			{
				itemCost: new Bank().add('Blighted super restore (4)', 1),
				qtyPerMinute: 0.17,
				alternativeConsumables: [
					{ itemCost: new Bank().add('Super restore (4)', 1), qtyPerMinute: 0.17 },
					{ itemCost: new Bank().add('Prayer potion (4)', 1), qtyPerMinute: 0.17 }
				]
			},
			{
				itemCost: new Bank().add('Revenant cave teleport'),
				qtyPerKill: 0.05,
				boostPercent: 5,
				optional: true
			}
		],
		canBePked: true
	}
];
