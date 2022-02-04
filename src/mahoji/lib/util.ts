import { Prisma } from '@prisma/client';
import {
	MessageActionRow,
	MessageActionRowOptions,
	MessageButtonStyleResolvable,
	MessageComponentType,
	MessageEmbed,
	MessageEmbedOptions
} from 'discord.js';
import { KlasaClient } from 'klasa';
import {
	APIActionRowComponent,
	APIEmbed,
	APIInteractionDataResolvedChannel,
	APIRole,
	APIUser,
	ComponentType,
	ICommand
} from 'mahoji';
import { CommandOptions } from 'mahoji/dist/lib/types';

import { mahojiClient } from '../..';
import { BotCommand } from '../../lib/structures/BotCommand';
import { AbstractCommand, AbstractCommandAttributes, CommandArgs } from './inhibitors';

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
			runIn: command.runIn,
			description: command.description
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
function compressMahojiArgs(options: CommandArgs) {
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

export function convertAPIEmbedToDJSEmbed(embed: APIEmbed) {
	const data: MessageEmbedOptions = { ...embed, timestamp: embed.timestamp ? Number(embed.timestamp) : undefined };
	return new MessageEmbed(data);
}

export function convertComponentDJSComponent(component: APIActionRowComponent): MessageActionRow {
	const data: MessageActionRowOptions = {
		components: component.components.map(cp => {
			if (cp.type === ComponentType.Button) {
				return {
					...cp,
					emoji: cp.emoji?.id,
					style: cp.style as unknown as MessageButtonStyleResolvable,
					type: cp.type as unknown as MessageComponentType
				};
			}
			return {
				...cp,
				options: cp.options.map(opt => ({
					...opt,
					emoji: opt.emoji?.id
				})),
				type: cp.type as unknown as MessageComponentType
			};
		})
	};
	return new MessageActionRow(data);
}
export function allAbstractCommands(client: KlasaClient): AbstractCommand[] {
	return [
		...(client.commands.array() as BotCommand[]).map(convertKlasaCommandToAbstractCommand),
		...mahojiClient.commands.values.map(convertMahojiCommandToAbstractCommand)
	];
}
