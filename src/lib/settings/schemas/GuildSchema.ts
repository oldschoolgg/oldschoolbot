import { Client } from 'klasa';

Client.defaultGuildSchema
	.add('jmodComments', 'textchannel', { default: null })
	.add('hcimdeaths', 'textchannel', { default: null })
	.add('totalCommandsUsed', 'integer', { default: 0 })
	.add('petchannel', 'textchannel', { default: null })
	.add('streamertweets', 'textchannel', { default: null })
	.add('tweetchannel', 'textchannel', { default: null })
	.add('levelUpMessages', 'textchannel', { default: null })
	.add('staffOnlyChannels', 'textchannel', { array: true, default: [] })
	.add('random_events_enabled', 'boolean', { default: false });
