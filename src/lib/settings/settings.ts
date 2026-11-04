import { cryptoRng } from 'node-rng/crypto';

import type { Minigame } from '@/prisma/main.js';
import { rawCommandHandlerInner } from '@/discord/commandHandler.js';

export async function getMinigame(id: string): Promise<Minigame> {
	return prisma.minigame.upsert({
		where: { user_id: id },
		update: {},
		create: { user_id: id }
	});
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
	ignoreUserIsBusy
}: RunCommandArgs): CommandResponse {
	const command = globalClient.allCommands.find(c => c.name === commandName)!;

	const response: Awaited<CommandResponse> = await rawCommandHandlerInner({
		interaction,
		command,
		options: args,
		ignoreUserIsBusy,
		rng: cryptoRng
	});
	return response;
}
