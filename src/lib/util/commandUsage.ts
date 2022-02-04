import { command_usage_status, Prisma } from '@prisma/client';

import { CommandArgs } from '../../mahoji/lib/inhibitors';
import { getCommandArgs } from '../../mahoji/lib/util';

export function makeCommandUsage({
	userID,
	channelID,
	guildID,
	flags,
	commandName,
	args,
	isContinue
}: {
	userID: string;
	channelID: string;
	guildID: string | null;
	flags: null | Record<string, string>;
	commandName: string;
	args: CommandArgs;
	isContinue: null | boolean;
}): Prisma.CommandUsageCreateInput {
	return {
		date: new Date(),
		user_id: userID,
		command_name: commandName,
		status: command_usage_status.Unknown,
		args: getCommandArgs(commandName, args),
		channel_id: channelID,
		guild_id: guildID,
		flags: flags ? (Object.keys(flags).length > 0 ? flags : undefined) : undefined,
		is_continue: isContinue ?? undefined
	};
}
