import { CLIENT_ID } from '../../config';
import { DISABLED_COMMANDS } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';

export async function onStartup() {
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
}
