const { Client } = require('klasa');

Client.defaultUserSchema
	.add('totalCommandsUsed', 'integer', { default: 0 })
	.add('GP', 'integer', { default: 0 })
	.add('autoupdate', 'boolean', { default: false })
	.add('RSN', 'string', { min: 1, max: 12, default: null })
	.add('pets', 'any', { default: {} })
	.add('badges', 'integer', { array: true, default: [] })
	.add('lastDailyTimestamp', 'integer', { default: 1 })
	.add('bank', 'any', { default: {} })
	.add('collectionLog', 'integer', { array: true, default: [] })
	.add('collectionLogBank', 'any', { default: {} })
	.add('monsterScores', 'any', { default: {} })
	.add('clueScores', 'any', { default: {} })
	.add('minion', folder =>
		folder.add('name', 'string').add('hasBought', 'boolean', { default: false })
	)
	.add('stats', folder =>
		folder
			.add('deaths', 'integer', { default: 0 })
			.add('diceWins', 'integer', { default: 0 })
			.add('diceLosses', 'integer', { default: 0 })
			.add('duelLosses', 'integer', { default: 0 })
			.add('duelWins', 'integer', { default: 0 })
	);
