import { Prisma } from '@prisma/client';
import { APIInteractionDataResolvedChannel, APIRole, APIUser, ICommand } from 'mahoji';
import { CommandOptions } from 'mahoji/dist/lib/types';

import { BotCommand } from '../../lib/structures/BotCommand';
import { AbstractCommand, AbstractCommandAttributes } from './inhibitors';

export function convertKlasaCommandToAbstractCommand(command: BotCommand): AbstractCommand {
	return {
		name: command.name,
		attributes: {
			altProtection: command.altProtection,
			oneAtTime: command.oneAtTime,
			guildOnly: command.guildOnly,
			perkTier: command.perkTier,
			ironCantUse: command.ironCantUse,
			examples: command.examples,
			categoryFlags: command.categoryFlags,
			bitfieldsRequired: command.bitfieldsRequired,
			enabled: command.enabled,
			testingCommand: command.testingCommand,
			cooldown: command.cooldown,
			requiredPermissionsForBot: command.requiredPermissionsForBot,
			requiredPermissionsForUser: command.requiredPermissionsForUser,
			runIn: command.runIn
		}
	};
}

export interface OSBMahojiCommand extends ICommand {
	attributes?: AbstractCommandAttributes;
}

export function convertMahojiCommandToAbstractCommand(command: OSBMahojiCommand): AbstractCommand {
	return {
		name: command.name,
		attributes: command.attributes
	};
}

/**
 * Options/Args in mahoji can be full/big objects for users/roles/etc, this replaces them with just an ID.
 */
function compressMahojiArgs(options: CommandOptions) {
	let newOptions: Record<string, string | number | boolean> = {};
	for (const [key, val] of Object.entries(options) as [
		keyof CommandOptions,
		CommandOptions[keyof CommandOptions]
	][]) {
		if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
			newOptions[key] = val;
			continue;
		}

		if ('user' in val && 'member' in val) {
			newOptions[key] = (val.user as APIUser).id;
			continue;
		}

		if ('id' in val) {
			newOptions[key] = (val as APIRole | APIInteractionDataResolvedChannel).id;
			continue;
		}

		newOptions.key = 'unknown?';
	}
}

export function getCommandArgs(
	commandName: string,
	args: any[] | CommandOptions
): Prisma.InputJsonObject | Prisma.InputJsonArray | undefined {
	if (args.length === 0) return undefined;
	if (!Array.isArray(args) && Object.keys(args).length === 0) return undefined;
	if (commandName === 'bank') return undefined;
	if (commandName === 'rp' && Array.isArray(args) && ['c', 'eval'].includes(args[0])) return undefined;
	return (Array.isArray(args) ? args : compressMahojiArgs(args)) as Prisma.InputJsonObject | Prisma.InputJsonArray;
}
