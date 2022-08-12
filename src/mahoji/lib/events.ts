import { CLIENT_ID } from '../../config';
import { syncBlacklists } from '../../lib/blacklists';
import { DISABLED_COMMANDS } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';

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
}
