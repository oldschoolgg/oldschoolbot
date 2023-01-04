import { Prisma } from '@prisma/client';
import { Guild, PermissionsBitField } from 'discord.js';
import { isObject } from 'e';
import { ICommand, MahojiClient } from 'mahoji';
import { CommandOptions, MahojiUserOption } from 'mahoji/dist/lib/types';

import { AbstractCommand, AbstractCommandAttributes } from './inhibitors';

export interface OSBMahojiCommand extends ICommand {
	attributes?: Omit<AbstractCommandAttributes, 'description'>;
}

export function convertMahojiCommandToAbstractCommand(command: OSBMahojiCommand): AbstractCommand {
	return {
		name: command.name,
		attributes: { ...command.attributes, description: command.description }
	};
}

interface CompressedArg {
	[key: string]: string | number | boolean | null | undefined | CompressedArg;
}
function compressMahojiArgs(options: CommandOptions) {
	let newOptions: CompressedArg = {};
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

		if ('user' in val || 'member' in val) {
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

export function getCommandArgs(
	commandName: string,
	args: CommandOptions
): Prisma.InputJsonObject | Prisma.InputJsonArray | undefined {
	if (Object.keys(args).length === 0) return undefined;
	if (['bank', 'bs'].includes(commandName)) return undefined;
	return compressMahojiArgs(args) as Prisma.InputJsonObject;
}

export function allAbstractCommands(mahojiClient: MahojiClient): AbstractCommand[] {
	return mahojiClient.commands.values.map(convertMahojiCommandToAbstractCommand);
}

export async function hasBanMemberPerms(userID: string, guild: Guild) {
	const member = await guild.members.fetch(userID).catch(() => null);
	if (!member) return false;
	return member.permissions.has(PermissionsBitField.Flags.BanMembers);
}
