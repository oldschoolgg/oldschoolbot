import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { bulkUpdateCommands } from '@oldschoolgg/toolkit/util';
import { ActivityType, bold, time } from 'discord.js';
import { startBlacklistSyncing } from '../../lib/blacklists';
import { Channel, META_CONSTANTS, globalConfig } from '../../lib/constants';
import { initCrons } from '../../lib/crons';
import { initTickers } from '../../lib/tickers';
import { logWrapFn } from '../../lib/util';
import { mahojiClientSettingsFetch } from '../../lib/util/clientSettings';
import { sendToChannelID } from '../../lib/util/webhook';
import { CUSTOM_PRICE_CACHE } from '../commands/sell';

export async function updateTestBotStatus(online = true) {
	try {
		if (globalConfig.isProduction) return;
		const idMap: Record<string, string> = {
			'829398443821891634': '1265571664142270464',
			'577488230539067403': '1265582554644217977',
			'353484579840983042': '1265582554644217977',
			'897549995446779964': '1265582743970910259',
			'1158785741028081696': '1265583194108067925'
		};
		const catChannelID = idMap[globalConfig.clientID];
		if (!catChannelID) return;
		const cat = await globalClient.channels.fetch(catChannelID);
		if (!cat || !cat.isTextBased() || cat.isDMBased()) {
			console.log('Could not find status channel');
			return;
		}

		const emoji = online ? '🟢' : '🔴';
		let text = '';
		if (online) {
			text = `${emoji} ${globalClient.user.username} is ONLINE ${emoji}

Turned on ${time(new Date(), 'R')}`;
			text = bold(text);
		} else {
			text = `${emoji} ${globalClient.user.username} is offline ${emoji}

Turned off ${time(new Date(), 'R')}`;
		}
		const message = await cat.messages
			.fetch({ limit: 5 })
			.then(messages => messages.filter(m => m.author.id === globalClient.user!.id))
			.then(msg => msg.first());
		if (!message) {
			await cat.send(text);
		} else {
			await message.edit(text);
		}
		if (online) {
			await globalClient.user.setPresence({
				status: 'online',
				activities: [
					{
						name: `${emoji} ONLINE`,
						type: ActivityType.Custom
					}
				]
			});
		}
	} catch (err) {
		console.error(err);
	}
}
export async function syncCustomPrices() {
	const clientData = await mahojiClientSettingsFetch({ custom_prices: true });
	for (const [key, value] of Object.entries(clientData.custom_prices as ItemBank)) {
		CUSTOM_PRICE_CACHE.set(Number(key), Number(value));
	}
}

export const onStartup = logWrapFn('onStartup', async () => {
	const syncTestBotCommands = globalConfig.isProduction
		? null
		: bulkUpdateCommands({
				client: globalClient.mahojiClient,
				commands: Array.from(globalClient.mahojiClient.commands.values()),
				guildID: globalConfig.testingServerID
			});

	initCrons();
	initTickers();

	const sendStartupMessage = globalConfig.isProduction
		? sendToChannelID(Channel.GeneralChannel, {
				content: `I have just turned on!\n\n${META_CONSTANTS.RENDERED_STR}`
			}).catch(console.error)
		: null;

	await Promise.all([
		globalClient.application.commands.fetch({
			guildId: globalConfig.isProduction ? undefined : globalConfig.testingServerID
		}),
		updateTestBotStatus(),
		sendStartupMessage,
		syncTestBotCommands,
		startBlacklistSyncing()
	]);
});
