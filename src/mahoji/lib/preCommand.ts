import type { CommandOptions } from '@oldschoolgg/toolkit/util';
import type { InteractionReplyOptions, TextChannel, User } from 'discord.js';

import { modifyBusyCounter, userIsBusy } from '../../lib/busyCounterCache';
import { busyImmuneCommands, gearValidationChecks } from '../../lib/constants';
import { logWrapFn, roll } from '../../lib/util';
import type { AbstractCommand } from './inhibitors';
import { runInhibitors } from './inhibitors';

interface PreCommandOptions {
	apiUser: User | null;
	abstractCommand: AbstractCommand;
	userID: string;
	guildID?: string | bigint | null;
	channelID: string | bigint;
	bypassInhibitors: boolean;
	options: CommandOptions;
}

type PrecommandReturn = Promise<
	| undefined
	| {
			reason: InteractionReplyOptions;
			dontRunPostCommand?: boolean;
	  }
>;
export const preCommand: (opts: PreCommandOptions) => PrecommandReturn = logWrapFn('PreCommand', rawPreCommand);
async function rawPreCommand({
	abstractCommand,
	userID,
	guildID,
	channelID,
	bypassInhibitors
}: PreCommandOptions): PrecommandReturn {
	if (globalClient.isShuttingDown) {
		return {
			reason: { content: 'The bot is currently restarting, please try again later.' },
			dontRunPostCommand: true
		};
	}

	if (userIsBusy(userID) && !bypassInhibitors && !busyImmuneCommands.includes(abstractCommand.name)) {
		return { reason: { content: 'You cannot use a command right now.' }, dontRunPostCommand: true };
	}

	if (!gearValidationChecks.has(userID) && roll(3)) {
		const user = await mUserFetch(userID);
		const { itemsUnequippedAndRefunded } = await user.validateEquippedGear();
		if (itemsUnequippedAndRefunded.length > 0) {
			return {
				reason: {
					content: `You had some items equipped that you didn't have the requirements to use, so they were unequipped and refunded to your bank: ${itemsUnequippedAndRefunded}`
				}
			};
		}
	}

	if (!busyImmuneCommands.includes(abstractCommand.name)) modifyBusyCounter(userID, 1);

	const guild = guildID ? globalClient.guilds.cache.get(guildID.toString()) : null;
	const member = guild?.members.cache.get(userID);
	const channel = globalClient.channels.cache.get(channelID.toString()) as TextChannel;

	const inhibitResult = runInhibitors({
		userID,
		guild: guild ?? null,
		member: member ?? null,
		command: abstractCommand,
		channel: channel ?? null,
		bypassInhibitors
	});

	if (inhibitResult !== undefined) {
		debugLog('Command inhibited', {
			type: 'COMMAND_INHIBITED',
			command_name: abstractCommand.name,
			user_id: userID,
			guild_id: guildID,
			channel_id: channelID
		});
		return inhibitResult;
	}
}
