import { Time } from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';

import { Channel, globalConfig, META_CONSTANTS } from '@/lib/constants.js';
import { bulkUpdateCommands } from '@/lib/discord/utils.js';
import { initTickers } from '@/lib/tickers.js';
import { sendToChannelID } from '@/lib/util/webhook.js';
import { logWrapFn } from '@/lib/util.js';

export const onStartup = logWrapFn('onStartup', async () => {
	if (globalConfig.isProduction) {
		sendToChannelID(Channel.GeneralChannel, {
			content: `I have just turned on!\n\n${META_CONSTANTS.RENDERED_STR}`
		}).catch(console.error);
	} else {
		// In development, always sync commands on startup.
		await bulkUpdateCommands();
	}

	globalClient.application.commands.fetch({
		guildId: globalConfig.isProduction ? undefined : globalConfig.supportServerID
	});

	// Wait 10 seconds before starting tickers to reduce lag on startup
	TimerManager.setTimeout(
		() => {
			initTickers();
		},
		globalConfig.isProduction ? Time.Second * 10 : 0
	);
});
