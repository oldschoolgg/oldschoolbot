import { type CommandOptions, isObject, type MahojiUserOption } from '@oldschoolgg/toolkit';
import type { command_name_enum, Prisma } from '@prisma/client';

function isMahojiUserOption(data: any): data is MahojiUserOption {
	return 'user' in data && 'id' in data.user;
}

interface CompressedArg {
	[key: string]: string | number | boolean | null | undefined | CompressedArg;
}

function compressMahojiArgs(options: CommandOptions) {
	const newOptions: CompressedArg = {};
	for (const [key, val] of Object.entries(options) as [
		keyof CommandOptions,
		CommandOptions[keyof CommandOptions]
	][]) {
		if (val === null) continue;
		if (
			typeof val === 'string' ||
			typeof val === 'number' ||
			typeof val === 'boolean' ||
			typeof val === 'undefined'
		) {
			newOptions[key] = val;
			continue;
		}

		if ('id' in val) {
			newOptions[key] = (val as { id: string }).id;
			continue;
		}

		if (isMahojiUserOption(val)) {
			newOptions[key] = (val as MahojiUserOption).user.id;
			continue;
		}

		if (isObject(val)) {
			newOptions[key] = compressMahojiArgs(val);
			continue;
		}

		newOptions[key] = null;
	}
	return newOptions;
}

function getCommandArgs(
	commandName: string,
	args: CommandOptions
): Prisma.InputJsonObject | Prisma.InputJsonArray | undefined {
	if (Object.keys(args).length === 0) return undefined;
	if (['bank', 'bs'].includes(commandName)) return undefined;
	return compressMahojiArgs(args) as Prisma.InputJsonObject;
}

const commandNameOverrides: Record<string, command_name_enum> = {
	zero_time_activity: 'ZeroTimeActivity' as command_name_enum
};

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
	const normalizedCommandName = commandNameOverrides[commandName] ?? (commandName as command_name_enum);

	return {
		user_id: BigInt(userID),
		command_name: normalizedCommandName,
		args: getCommandArgs(commandName, args),
		channel_id: BigInt(channelID),
		guild_id: guildID ? BigInt(guildID) : null,
		is_continue: isContinue ?? undefined,
		inhibited,
		continue_delta_millis: continueDeltaMillis
	};
}
