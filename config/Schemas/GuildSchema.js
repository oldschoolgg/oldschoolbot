const { Client } = require('klasa');

Client.defaultGuildSchema
	.add('jmodComments', 'textchannel', { default: null })
	.add('hcimdeaths', 'textchannel', { default: null })
	.add('joyReactions', 'textchannel', { default: null })
	.add('totalCommandsUsed', 'integer', { default: 0 })
	.add('petchannel', 'textchannel', { default: null })
	.add('streamers', 'string', { array: true, default: [] })
	.add('streamertweets', 'textchannel', { default: null })
	.add('tweetchannel', 'textchannel', { default: null })
	.add('twitchnotifs', 'textchannel', { default: null })
	.add('ashTweetsChannel', 'textchannel', { default: null })
	.add('levelUpMessages', 'boolean', { default: false });
