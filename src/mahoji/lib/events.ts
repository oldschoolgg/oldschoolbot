import { bulkUpdateCommands } from 'mahoji/dist/lib/util';

import { CLIENT_ID, DEV_SERVER_ID, production } from '../../config';
import { syncBlacklists } from '../../lib/blacklists';
import { DISABLED_COMMANDS } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { assert } from '../../lib/util';

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

	assert(!globalClient.monitors.get('commandHandler'));
}
