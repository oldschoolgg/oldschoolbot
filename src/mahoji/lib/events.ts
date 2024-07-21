import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { bulkUpdateCommands } from '@oldschoolgg/toolkit';
import { syncBlacklists } from '../../lib/blacklists';
import { DISABLED_COMMANDS, globalConfig } from '../../lib/constants';
import { syncDoubleLoot } from '../../lib/doubleLoot';

import { initTickers } from '../../lib/tickers';
import { runTimedLoggedFn } from '../../lib/util';
import { mahojiClientSettingsFetch } from '../../lib/util/clientSettings';
import { syncSlayerMaskLeaderboardCache } from '../../lib/util/slayerMaskLeaderboard';
import { CUSTOM_PRICE_CACHE } from '../commands/sell';

export async function syncCustomPrices() {
	const clientData = await mahojiClientSettingsFetch({ custom_prices: true });
	for (const [key, value] of Object.entries(clientData.custom_prices as ItemBank)) {
		CUSTOM_PRICE_CACHE.set(Number(key), Number(value));
	}
}

export async function onStartup() {
	globalClient.application.commands.fetch({
		guildId: globalConfig.isProduction ? undefined : globalConfig.mainServerID
	});

	// Sync disabled commands
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

	// Sync blacklists
	await syncBlacklists();

	if (!globalConfig.isProduction) {
		console.log('Syncing commands locally...');
		await bulkUpdateCommands({
			client: globalClient.mahojiClient,
			commands: Array.from(globalClient.mahojiClient.commands.values()),
			guildID: globalConfig.mainServerID
		});
	}

	await syncDoubleLoot();
	runTimedLoggedFn('Syncing prices', syncCustomPrices);
	initTickers();

	syncSlayerMaskLeaderboardCache();
}
