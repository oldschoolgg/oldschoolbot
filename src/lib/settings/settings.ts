import { cryptoRng } from 'node-rng/crypto';

import { rawCommandHandlerInner } from '@/discord/commandHandler.js';

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
	isContinue,
	continueDeltaMillis = null
}: RunCommandArgs): CommandResponse {
	const command = globalClient.allCommands.find(c => c.name === commandName)!;

	const response: Awaited<CommandResponse> = await rawCommandHandlerInner({
		interaction,
		command,
		options: args,
		ignoreUserIsBusy,
		rng: cryptoRng,
		isContinue,
		continueDeltaMs: continueDeltaMillis
	});
	return response;
}
