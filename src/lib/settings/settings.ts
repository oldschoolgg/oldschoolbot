import { ButtonInteraction } from 'discord.js';

import type { NewUser } from '@/prisma/main.js';
import type { CommandOptions } from '@/lib/discord/commandOptions.js';
import { MInteraction } from '@/lib/structures/MInteraction.js';

type RawCommandHandlerInner = typeof import('@/lib/discord/commandHandler.js')['rawCommandHandlerInner'];

let cachedRawCommandHandlerInner: RawCommandHandlerInner | null = null;

async function getRawCommandHandlerInner(): Promise<RawCommandHandlerInner> {
	if (!cachedRawCommandHandlerInner) {
		({ rawCommandHandlerInner: cachedRawCommandHandlerInner } = await import('@/lib/discord/commandHandler.js'));
	}
	return cachedRawCommandHandlerInner;
}

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
	interaction: _interaction,
	ignoreUserIsBusy,
	isContinue
}: RunCommandArgs): CommandResponse {
	const interaction: MInteraction =
		_interaction instanceof ButtonInteraction ? new MInteraction({ interaction: _interaction }) : _interaction;
	const command = globalClient.allCommands.find(c => c.name === commandName)!;

	const shouldIgnoreBusy = ignoreUserIsBusy ?? (isContinue ? true : undefined);

	const rawCommandHandlerInner = await getRawCommandHandlerInner();
	const response: Awaited<CommandResponse> = await rawCommandHandlerInner({
		interaction,
		command,
		options: args,
		ignoreUserIsBusy: shouldIgnoreBusy
	});
	return response;
}
