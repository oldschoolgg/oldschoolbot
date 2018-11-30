const { Client } = require('klasa');

Client.defaultClientSchema
	.add('commandStats', 'any', { default: {} })
	.add('totalCommandsUsed', 'integer', { default: 0 })
	.add('prices', 'any', { default: {} });
