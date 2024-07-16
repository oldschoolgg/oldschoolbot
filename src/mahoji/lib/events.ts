import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { bulkUpdateCommands } from '@oldschoolgg/toolkit';
import { production } from '../../config';
import { Channel, META_CONSTANTS, globalConfig } from '../../lib/constants';
import { initCrons } from '../../lib/crons';
import { syncDoubleLoot } from '../../lib/doubleLoot';

import { initTickers } from '../../lib/tickers';
import { cacheCleanup } from '../../lib/util/cachedUserIDs';
import { mahojiClientSettingsFetch } from '../../lib/util/clientSettings';
import { syncSlayerMaskLeaderboardCache } from '../../lib/util/slayerMaskLeaderboard';
import { sendToChannelID } from '../../lib/util/webhook';
import { CUSTOM_PRICE_CACHE } from '../commands/sell';

export async function syncCustomPrices() {
	const clientData = await mahojiClientSettingsFetch({ custom_prices: true });
	for (const [key, value] of Object.entries(clientData.custom_prices as ItemBank)) {
		CUSTOM_PRICE_CACHE.set(Number(key), Number(value));
	}
}

export async function onStartup() {
	globalClient.application.commands.fetch({ guildId: production ? undefined : globalConfig.testingServerID });
	if (!production) {
		console.log('Syncing commands locally...');
		await bulkUpdateCommands({
			client: globalClient.mahojiClient,
			commands: Array.from(globalClient.mahojiClient.commands.values()),
			guildID: globalConfig.testingServerID
		});
	}

	await syncDoubleLoot();

	cacheCleanup();

	initCrons();
	initTickers();

	syncSlayerMaskLeaderboardCache();

	if (production) {
		sendToChannelID(Channel.GeneralChannel, {
			content: `I have just turned on!

${META_CONSTANTS.RENDERED_STR}`
		}).catch(console.error);
	}
}
