import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { bulkUpdateCommands } from '@oldschoolgg/toolkit';
import { production } from '../../config';
import { cacheBadges } from '../../lib/badges';
import { syncBlacklists } from '../../lib/blacklists';
import { Channel, DISABLED_COMMANDS, META_CONSTANTS, globalConfig } from '../../lib/constants';
import { initCrons } from '../../lib/crons';
import { syncDoubleLoot } from '../../lib/doubleLoot';
import { GrandExchange } from '../../lib/grandExchange';

import { initTickers } from '../../lib/tickers';
import { runTimedLoggedFn } from '../../lib/util';
import { cacheCleanup } from '../../lib/util/cachedUserIDs';
import { mahojiClientSettingsFetch } from '../../lib/util/clientSettings';
import { syncLinkedAccounts } from '../../lib/util/linkedAccountsUtil';
import { syncSlayerMaskLeaderboardCache } from '../../lib/util/slayerMaskLeaderboard';
import { sendToChannelID } from '../../lib/util/webhook';
import { CUSTOM_PRICE_CACHE } from '../commands/sell';

export async function syncCustomPrices() {
	const clientData = await mahojiClientSettingsFetch({ custom_prices: true });
	for (const [key, value] of Object.entries(clientData.custom_prices as ItemBank)) {
		CUSTOM_PRICE_CACHE.set(Number(key), Number(value));
	}
}

async function syncDisabledCommands() {
	const disabledCommands = await prisma.clientStorage.upsert({
		where: {
			id: globalConfig.clientID
		},
		select: { disabled_commands: true },
		create: {
			id: globalConfig.clientID
		},
		update: {}
	});

	if (disabledCommands.disabled_commands) {
		for (const command of disabledCommands.disabled_commands) {
			DISABLED_COMMANDS.add(command);
		}
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

	runTimedLoggedFn('Sync Disabled Commands', syncDisabledCommands);

	runTimedLoggedFn('Sync Blacklist', syncBlacklists);

	runTimedLoggedFn('Syncing prices', syncCustomPrices);

	runTimedLoggedFn('Caching badges', cacheBadges);
	cacheCleanup();

	runTimedLoggedFn('Sync Linked Accounts', syncLinkedAccounts);
	runTimedLoggedFn('Init Grand Exchange', GrandExchange.init.bind(GrandExchange));

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
