import { Client } from 'klasa';

import { defaultMegaDuckLocation } from '../../minions/types';

Client.defaultGuildSchema
	.add('jmodComments', 'textchannel', { default: null })
	.add('petchannel', 'textchannel', { default: null })
	.add('tweetchannel', 'textchannel', { default: null })
	.add('levelUpMessages', 'textchannel', { default: null })
	.add('staffOnlyChannels', 'textchannel', { array: true, default: [] })
	.add('mega_duck_location', 'any', { default: { ...defaultMegaDuckLocation } });
