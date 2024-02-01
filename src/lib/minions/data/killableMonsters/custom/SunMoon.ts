import { Time } from 'e';
import { LootTable, Monsters } from 'oldschooljs';

import { GearStat } from '../../../../gear';
import { CustomMonster } from './customMonsters';

export const Solervus: CustomMonster = {
	id: 129_123,
	baseMonster: Monsters.AbyssalSire,
	name: 'Solervus',
	aliases: ['solervus'],
	timeToFinish: Time.Minute * 15,
	hp: 330,
	table: new LootTable()
		.every('Solite', [1, 6])
		.tertiary(
			64,
			new LootTable()
				.add('Solervus helm')
				.add('Solervus platebody')
				.add('Solervus platelegs')
				.add('Solervus boots')
				.add('Solervus gloves')
				.add('Solervus cape')
		),
	difficultyRating: 5,
	qpRequired: 160,
	healAmountNeeded: 20 * 25,
	attackStyleToUse: GearStat.AttackRanged,
	attackStylesUsed: [GearStat.AttackRanged],
	levelRequirements: {
		hitpoints: 120
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 5
		}
	},
	deathProps: {
		hardness: 0.5,
		steepness: 0.5,
		lowestDeathChance: 0.01,
		highestDeathChance: 70
	},
	// projectileUsage: {
	// 	required: true,
	// 	calculateQuantity: (opts: { quantity: number }) => Math.ceil(randomVariation(opts.quantity * 50, 5)),
	// 	requiredAmmo: resolveItems(['Silver bolts'])
	// },
	allItems: []
};

export const Solis: CustomMonster = {
	id: 129_124,
	baseMonster: Monsters.AbyssalSire,
	name: 'Solis',
	aliases: ['solis'],
	timeToFinish: Time.Minute * 45,
	hp: 3330,
	table: new LootTable()
		.every('Solite', [10, 60])
		.tertiary(600, 'Eagle egg')
		.tertiary(1200, 'Axe of the high sungod (u)'),
	difficultyRating: 5,
	qpRequired: 260,
	healAmountNeeded: 200 * 25,
	attackStyleToUse: GearStat.AttackRanged,
	attackStylesUsed: [GearStat.AttackRanged],
	levelRequirements: {
		hitpoints: 120
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 5
		}
	},
	deathProps: {
		hardness: 0.5,
		steepness: 0.5,
		lowestDeathChance: 0.01,
		highestDeathChance: 70
	},
	// projectileUsage: {
	// 	required: true,
	// 	calculateQuantity: (opts: { quantity: number }) => Math.ceil(randomVariation(opts.quantity * 50, 5)),
	// 	requiredAmmo: resolveItems(['Silver bolts'])
	// },
	allItems: []
};

export const Celestials: CustomMonster = {
	id: 129_125,
	baseMonster: Monsters.AbyssalSire,
	name: 'Celestials',
	aliases: ['celestials'],
	timeToFinish: Time.Minute * 15,
	hp: 330,
	table: new LootTable()
		.every('Lunite', [1, 6])
		.tertiary(
			64,
			new LootTable()
				.add('Celestial helm')
				.add('Celestial platebody')
				.add('Celestial platelegs')
				.add('Celestial boots')
				.add('Celestial gloves')
				.add('Celestial cape')
		),
	difficultyRating: 5,
	qpRequired: 160,
	healAmountNeeded: 20 * 25,
	attackStyleToUse: GearStat.AttackRanged,
	attackStylesUsed: [GearStat.AttackRanged],
	levelRequirements: {
		hitpoints: 120
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 5
		}
	},
	deathProps: {
		hardness: 0.5,
		steepness: 0.5,
		lowestDeathChance: 0.01,
		highestDeathChance: 70
	},
	allItems: []
};

export const Celestara: CustomMonster = {
	id: 129_126,
	baseMonster: Monsters.AbyssalSire,
	name: 'Celestara',
	aliases: ['celestara'],
	timeToFinish: Time.Minute * 45,
	hp: 3330,
	table: new LootTable().every('Lunite', [10, 60]).tertiary(300, 'Noom'),
	difficultyRating: 5,
	qpRequired: 260,
	healAmountNeeded: 200 * 25,
	attackStyleToUse: GearStat.AttackRanged,
	attackStylesUsed: [GearStat.AttackRanged],
	levelRequirements: {
		hitpoints: 120
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 5
		}
	},
	deathProps: {
		hardness: 0.5,
		steepness: 0.5,
		lowestDeathChance: 0.01,
		highestDeathChance: 70
	},
	allItems: []
};

export const SunMoonMonsters = {
	Celestials,
	Solis,
	Solervus,
	Celestara
};
