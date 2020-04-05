import { Client, SchemaFolder } from 'klasa';

import { SkillsEnum } from '../types';
import Gear from '../gear';

Client.defaultUserSchema
	.add('totalCommandsUsed', 'integer', { default: 0 })
	.add('GP', 'integer', { default: 0 })
	.add('QP', 'integer', { default: 0 })
	.add('autoupdate', 'boolean', { default: false })
	.add('RSN', 'string', { default: null })
	.add('pets', 'any', { default: {} })
	.add('badges', 'integer', { array: true, default: [] })
	.add('bitfield', 'integer', { array: true, default: [] })
	.add('lastDailyTimestamp', 'integer', { default: 1 })
	.add('bank', 'any', { default: {} })
	.add('collectionLogBank', 'any', { default: {} })
	.add('monsterScores', 'any', { default: {} })
	.add('clueScores', 'any', { default: {} })
	.add('bankBackground', 'integer', { default: 1 })
	.add('minion', folder =>
		folder
			.add('name', 'string')
			.add('hasBought', 'boolean', { default: false })
			.add('dailyDuration', 'integer', { default: 0 })
			.add('ironman', 'boolean', { default: false })
	)
	.add('stats', (folder: SchemaFolder) =>
		folder
			.add('deaths', 'integer', { default: 0 })
			.add('diceWins', 'integer', { default: 0 })
			.add('diceLosses', 'integer', { default: 0 })
			.add('duelLosses', 'integer', { default: 0 })
			.add('duelWins', 'integer', { default: 0 })
	)
	.add('skills', (folder: SchemaFolder) =>
		folder
			.add(SkillsEnum.Mining, 'integer', { default: 0 })
			.add(SkillsEnum.Smithing, 'integer', { default: 0 })
			.add(SkillsEnum.Woodcutting, 'integer', { default: 0 })
			.add(SkillsEnum.Firemaking, 'integer', { default: 0 })
	)
	.add('gear', (folder: SchemaFolder) =>
		folder
			.add('melee', 'any', { default: Gear.defaultGear })
			.add('mage', 'any', { default: Gear.defaultGear })
			.add('range', 'any', { default: Gear.defaultGear })
	);
