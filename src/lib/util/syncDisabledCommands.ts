import { DISABLED_COMMANDS, globalConfig } from '../constants';

export async function syncDisabledCommands() {
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
