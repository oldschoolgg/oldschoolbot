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
	isContinue,
	inhibited
}: {
	userID: string | bigint;
	channelID: string | bigint;
	guildID?: string | bigint | null;
	flags: null | Record<string, string>;
	commandName: string;
	args: CommandArgs;
	isContinue: null | boolean;
	inhibited: boolean;
}): Prisma.CommandUsageCreateInput {
	return {
		date: new Date(),
		user_id: userID.toString(),
		command_name: commandName,
		status: command_usage_status.Unknown,
		args: getCommandArgs(commandName, args),
		channel_id: channelID.toString(),
		guild_id: guildID?.toString(),
		flags: flags ? (Object.keys(flags).length > 0 ? flags : undefined) : undefined,
		is_continue: isContinue ?? undefined,
		inhibited
	};
}
