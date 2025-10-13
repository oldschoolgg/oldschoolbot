import type { NewUser } from '@prisma/client';
import { ButtonInteraction } from 'discord.js';

import { rawCommandHandlerInner } from '@/lib/discord/commandHandler.js';
import type { CommandOptions } from '@/lib/discord/commandOptions.js';
import { MInteraction } from '@/lib/structures/MInteraction.js';

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
}

export async function runCommand({ commandName, args, interaction: _interaction }: RunCommandArgs): Promise<null> {
	const interaction: MInteraction =
		_interaction instanceof ButtonInteraction ? new MInteraction({ interaction: _interaction }) : _interaction;
	const command = globalClient.allCommands.find(c => c.name === commandName)!;

	await rawCommandHandlerInner({ interaction, command, options: args });
	return null;
}
