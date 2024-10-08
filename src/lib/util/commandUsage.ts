import type { CommandOptions } from '@oldschoolgg/toolkit/util';
import type { Prisma, command_name_enum } from '@prisma/client';

import { getCommandArgs } from '../../mahoji/lib/util';

export function makeCommandUsage({
	userID,
	channelID,
	guildID,
	commandName,
	args,
	isContinue,
	inhibited,
	continueDeltaMillis
}: {
	userID: string | bigint;
	channelID: string | bigint;
	guildID?: string | bigint | null;
	commandName: string;
	args: CommandOptions;
	isContinue: null | boolean;
	inhibited: boolean;
	continueDeltaMillis: number | null;
}): Prisma.CommandUsageCreateInput {
	return {
		user_id: BigInt(userID),
		command_name: commandName as command_name_enum,
		args: getCommandArgs(commandName, args),
		channel_id: BigInt(channelID),
		guild_id: guildID ? BigInt(guildID) : null,
		is_continue: isContinue ?? undefined,
		inhibited,
		continue_delta_millis: continueDeltaMillis
	};
}
