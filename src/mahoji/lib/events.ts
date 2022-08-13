import { CLIENT_ID } from '../../config';
import { syncBlacklists } from '../../lib/blacklists';
import { DISABLED_COMMANDS } from '../../lib/constants';
import { syncDoubleLoot } from '../../lib/doubleLoot';
import { prisma } from '../../lib/settings/prisma';

export async function onStartup() {
	// Sync disabled commands
	const disabledCommands = await prisma.clientStorage.findFirst({
		where: {
			id: CLIENT_ID
		},
		select: {
			disabled_commands: true
		}
	});

	for (const command of disabledCommands!.disabled_commands) {
		DISABLED_COMMANDS.add(command);
	}

	// Sync blacklists
	await syncBlacklists();

	await syncDoubleLoot();
}
