import type { CommandOptions } from '@oldschoolgg/toolkit';
import type { Prisma } from '@prisma/client';

import { getCommandArgs } from '../../mahoji/lib/util';

export function makeCommandUsage({
	userID,
	channelID,
	guildID,
	flags,
	commandName,
	args,
	isContinue,
	inhibited,
	continueDeltaMillis
}: {
	userID: string | bigint;
	channelID: string | bigint;
	guildID?: string | bigint | null;
	flags: null | Record<string, string>;
	commandName: string;
	args: CommandOptions;
	isContinue: null | boolean;
	inhibited: boolean;
	continueDeltaMillis: number | null;
}): Prisma.CommandUsageCreateInput {
	return {
		user_id: BigInt(userID),
		command_name: commandName,
		args: getCommandArgs(commandName, args),
		channel_id: BigInt(channelID),
		guild_id: guildID ? BigInt(guildID) : null,
		flags: flags ? (Object.keys(flags).length > 0 ? flags : undefined) : undefined,
		is_continue: isContinue ?? undefined,
		inhibited,
		continue_delta_millis: continueDeltaMillis
	};
}
