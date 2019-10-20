const { Client } = require('klasa');

Client.defaultClientSchema
	.add('commandStats', 'any', { default: {} })
	.add('totalCommandsUsed', 'integer', { default: 0 })
	.add('prices', 'any', { default: {} })
	.add('pollQuestions', 'any', { default: {} })
	.add('petRecords', 'any', { default: { lowest: {}, highest: {} } })
	.add('usernameCache', 'any', { default: {} })
	.add('lastPlayerStats', 'any', { default: {} });
