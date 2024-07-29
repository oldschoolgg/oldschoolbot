import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { DISABLED_COMMANDS, globalConfig } from '../../lib/constants';
import { syncDoubleLoot } from '../../lib/doubleLoot';

import { initTickers } from '../../lib/tickers';
import { mahojiClientSettingsFetch } from '../../lib/util/clientSettings';
import { syncSlayerMaskLeaderboardCache } from '../../lib/util/slayerMaskLeaderboard';
import { CUSTOM_PRICE_CACHE } from '../commands/sell';

export async function syncCustomPrices() {
	const clientData = await mahojiClientSettingsFetch();
	for (const [key, value] of Object.entries(clientData.custom_prices as ItemBank)) {
		CUSTOM_PRICE_CACHE.set(Number(key), Number(value));
	}
}

export async function onStartup() {
	globalClient.application.commands.fetch({
		guildId: globalConfig.mainServerID
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

	await syncDoubleLoot();
	initTickers();
	syncSlayerMaskLeaderboardCache();
}
