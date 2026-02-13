import { cryptoRng } from 'node-rng/crypto';

import type { NewUser } from '@/prisma/main.js';

type RawCommandHandlerInner = typeof import('@/discord/commandHandler.js')['rawCommandHandlerInner'];

let cachedRawCommandHandlerInner: RawCommandHandlerInner | null = null;

async function getRawCommandHandlerInner(): Promise<RawCommandHandlerInner> {
	if (!cachedRawCommandHandlerInner) {
		({ rawCommandHandlerInner: cachedRawCommandHandlerInner } = await import('@/discord/commandHandler.js'));
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
	interaction: OSInteraction;
	continueDeltaMillis: number | null;
	ignoreUserIsBusy?: true;
}

export async function runCommand({
	commandName,
	args,
	interaction,
	ignoreUserIsBusy,
	isContinue
}: RunCommandArgs): CommandResponse {
	const command = globalClient.allCommands.find(c => c.name === commandName)!;

	const rawCommandHandlerInner = await getRawCommandHandlerInner();
	const shouldIgnoreBusy = ignoreUserIsBusy ?? (isContinue ? true : undefined);
	const response: Awaited<CommandResponse> = await rawCommandHandlerInner({
		interaction,
		command,
		options: args,
		ignoreUserIsBusy: shouldIgnoreBusy,
		rng: cryptoRng
	});
	return response;
}
