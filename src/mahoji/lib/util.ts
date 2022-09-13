import { Prisma } from '@prisma/client';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Guild,
	MessageComponentType,
	PermissionsBitField
} from 'discord.js';
import {
	APIActionRowComponent,
	APIButtonComponent,
	APIInteractionDataResolvedChannel,
	APIMessageActionRowComponent,
	APIRole,
	APIUser,
	ICommand,
	MahojiClient
} from 'mahoji';
import { CommandOptions } from 'mahoji/dist/lib/types';

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
			newOptions[key] = (val.user as APIUser).id;
			continue;
		}

		if ('id' in val) {
			newOptions[key] = (val as APIRole | APIInteractionDataResolvedChannel).id;
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

export function convertComponentDJSComponent(
	component: APIActionRowComponent<APIMessageActionRowComponent>
): ActionRowBuilder<ButtonBuilder> {
	const data = component.components.map(cp => {
		const btn = cp as APIButtonComponent;
		return new ButtonBuilder({
			...btn,
			emoji: btn.emoji?.id,
			style: btn.style as unknown as ButtonStyle,
			type: btn.type as unknown as MessageComponentType
		} as any);
	});
	return new ActionRowBuilder<ButtonBuilder>().addComponents(data);
}
export function allAbstractCommands(mahojiClient: MahojiClient): AbstractCommand[] {
	return mahojiClient.commands.values.map(convertMahojiCommandToAbstractCommand);
}

export async function hasBanMemberPerms(userID: string, guild: Guild) {
	const member = await guild.members.fetch(userID).catch(() => null);
	if (!member) return false;
	return member.permissions.has(PermissionsBitField.Flags.BanMembers);
}
