import { Client } from 'klasa';

import { defaultMegaDuckLocation } from '../../minions/types';

Client.defaultGuildSchema
	.add('jmodComments', 'textchannel', { default: null })
	.add('hcimdeaths', 'textchannel', { default: null })
	.add('petchannel', 'textchannel', { default: null })
	.add('streamertweets', 'textchannel', { default: null })
	.add('tweetchannel', 'textchannel', { default: null })
	.add('levelUpMessages', 'textchannel', { default: null })
	.add('staffOnlyChannels', 'textchannel', { array: true, default: [] })
	.add('tags', 'any', { array: true })
	.add('mega_duck_location', 'any', { default: defaultMegaDuckLocation });
