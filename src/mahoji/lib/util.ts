import { Prisma } from '@prisma/client';
import { Guild, PermissionsBitField } from 'discord.js';
import { ICommand, MahojiClient } from 'mahoji';
import { CommandOptions, MahojiUserOption } from 'mahoji/dist/lib/types';

import { AbstractCommand, AbstractCommandAttributes, CommandArgs } from './inhibitors';

export interface OSBMahojiCommand extends ICommand {
	attributes?: Omit<AbstractCommandAttributes, 'description'>;
}

export function convertMahojiCommandToAbstractCommand(command: OSBMahojiCommand): AbstractCommand {
	return {
		name: command.name,
		attributes: { ...command.attributes, description: command.description }
	};
}

/**
 * Options/Args in mahoji can be full/big objects for users/roles/etc, this replaces them with just an ID.
 */
function compressMahojiArgs(options: CommandArgs) {
	let newOptions: Record<string, string | number | boolean | null | undefined> = {};
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

		if ('user' in val && 'member' in val) {
			newOptions[key] = (val as MahojiUserOption).user.id;
			continue;
		}

		if ('id' in val) {
			newOptions[key] = (val as { id: string }).id;
			continue;
		}

		newOptions[key] = null;
	}
	return newOptions;
}

export function getCommandArgs(
	commandName: string,
	args: CommandArgs
): Prisma.InputJsonObject | Prisma.InputJsonArray | undefined {
	if (Array.isArray(args) && args.length === 0) return undefined;
	if (!Array.isArray(args) && Object.keys(args).length === 0) return undefined;
	if (commandName === 'bank') return undefined;
	if (commandName === 'rp' && Array.isArray(args) && ['c', 'eval'].includes(args[0] as string)) return undefined;
	return (Array.isArray(args) ? args : compressMahojiArgs(args)) as Prisma.InputJsonObject | Prisma.InputJsonArray;
}

export function allAbstractCommands(mahojiClient: MahojiClient): AbstractCommand[] {
	return mahojiClient.commands.values.map(convertMahojiCommandToAbstractCommand);
}

export async function hasBanMemberPerms(userID: string, guild: Guild) {
	const member = await guild.members.fetch(userID).catch(() => null);
	if (!member) return false;
	return member.permissions.has(PermissionsBitField.Flags.BanMembers);
}
