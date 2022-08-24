import { bulkUpdateCommands } from 'mahoji/dist/lib/util';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { CLIENT_ID, DEV_SERVER_ID, production } from '../../config';
import { syncBlacklists } from '../../lib/blacklists';
import { DISABLED_COMMANDS } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { itemNameFromID } from '../../lib/util';
import { CUSTOM_PRICE_CACHE } from '../commands/sell';
import { mahojiClientSettingsFetch } from '../mahojiSettings';

export async function syncCustomPrices() {
	const clientData = await mahojiClientSettingsFetch();
	for (const [key, value] of Object.entries(clientData.custom_prices as ItemBank)) {
		CUSTOM_PRICE_CACHE.set(Number(key), Number(value));
	}
	console.log(
		`Custom Price Cache: ${Array.from(CUSTOM_PRICE_CACHE.entries()).map(i => `${itemNameFromID(i[0])} ${i[1]}`)}`
	);
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

	await syncCustomPrices();
}
