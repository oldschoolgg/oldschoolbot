import { bulkUpdateCommands } from 'mahoji/dist/lib/util';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { CLIENT_ID, DEV_SERVER_ID, production } from '../../config';
import { cacheBadges } from '../../lib/badges';
import { syncBlacklists } from '../../lib/blacklists';
import { DISABLED_COMMANDS } from '../../lib/constants';
import { syncDoubleLoot } from '../../lib/doubleLoot';
import { prisma } from '../../lib/settings/prisma';
import { cacheCleanup } from '../../lib/util';
import { CUSTOM_PRICE_CACHE } from '../commands/sell';
import { mahojiClientSettingsFetch, syncLinkedAccounts } from '../mahojiSettings';

export async function syncCustomPrices() {
	const clientData = await mahojiClientSettingsFetch();
	for (const [key, value] of Object.entries(clientData.custom_prices as ItemBank)) {
		CUSTOM_PRICE_CACHE.set(Number(key), Number(value));
	}
}

export async function onStartup() {
	// Sync disabled commands
	const disabledCommands = await prisma.clientStorage.upsert({
		where: {
			id: CLIENT_ID
		},
		select: { disabled_commands: true },
		create: {
			id: CLIENT_ID
		},
		update: {}
	});

	for (const command of disabledCommands!.disabled_commands) {
		DISABLED_COMMANDS.add(command);
	}

	// Sync blacklists
	await syncBlacklists();

	if (!production) {
		console.log('Syncing commands locally...');
		await bulkUpdateCommands({
			client: globalClient.mahojiClient,
			commands: globalClient.mahojiClient.commands.values,
			guildID: DEV_SERVER_ID
		});
	}

	await syncDoubleLoot();
	await syncCustomPrices();
	await cacheBadges();

	await syncLinkedAccounts();
	await cacheCleanup();
}
