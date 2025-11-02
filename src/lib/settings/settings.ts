import type { NewUser } from '@/prisma/main.js';
import { rawCommandHandlerInner } from '@/lib/discord/commandHandler.js';
import type { CommandOptions } from '@/lib/discord/commandOptions.js';
import type { MInteraction } from '@/lib/structures/MInteraction.js';

export async function getNewUser(id: string): Promise<NewUser> {
	const value = await prisma.newUser.findUnique({ where: { id } });
	if (!value) {
		return prisma.newUser.create({
			data: {
				id,
				minigame: {}
			}
		});
	}
	return value;
}

export interface RunCommandArgs {
	commandName: string;
	args: CommandOptions;
	user: MUser;
	isContinue?: boolean;
	interaction: MInteraction;
	continueDeltaMillis: number | null;
	ignoreUserIsBusy?: true;
}

export async function runCommand({
	commandName,
	args,
	interaction,
	ignoreUserIsBusy
}: RunCommandArgs): CommandResponse {
	const command = globalClient.allCommands.find(c => c.name === commandName)!;

	const response: Awaited<CommandResponse> = await rawCommandHandlerInner({
		interaction,
		command,
		options: args,
		ignoreUserIsBusy
	});
	return response;
}
