import {
	type ButtonBuilder,
	type Client,
	ComponentType,
	type Guild,
	type InteractionReplyOptions,
	PermissionsBitField
} from 'discord.js';
import { chunk } from 'e';

import type { MahojiClient } from '../lib/MahojiClient/Mahoji';
import { stripEmojis } from './misc';

const discordEpoch = 1_420_070_400_000;

export function randomSnowflake(): string {
	const timestamp = Date.now() - discordEpoch;
	const workerId = Math.floor(Math.random() * 32);
	const processId = Math.floor(Math.random() * 32);
	const increment = Math.floor(Math.random() * 4096);

	const timestampPart = BigInt(timestamp) << 22n;
	const workerIdPart = BigInt(workerId) << 17n;
	const processIdPart = BigInt(processId) << 12n;
	const incrementPart = BigInt(increment);

	const snowflakeBigInt = timestampPart | workerIdPart | processIdPart | incrementPart;

	return snowflakeBigInt.toString();
}

export function mentionCommand(
	client: Client & { mahojiClient: MahojiClient },
	name: string,
	subCommand?: string,
	subSubCommand?: string
) {
	const command = client.mahojiClient.commands.get(name);
	if (!command) {
		throw new Error(`Command ${name} not found`);
	}
	if (subCommand && !command.options.some(i => i.name === subCommand)) {
		throw new Error(`Command ${name} does not have subcommand ${subCommand}`);
	}

	const apiCommand = client.application
		? Array.from(client.application.commands.cache.values()).find(i => i.name === name)
		: null;
	if (!apiCommand) {
		throw new Error(`Command ${name} not found`);
	}

	if (subCommand) {
		return `</${name} ${subCommand}${subSubCommand ? ` ${subSubCommand}` : ''}:${apiCommand.id}>`;
	}

	return `</${name}:${apiCommand.id}>`;
}

export async function hasBanMemberPerms(userID: string, guild: Guild) {
	const member = await guild.members.fetch(userID).catch(() => null);
	if (!member) return false;
	return member.permissions.has(PermissionsBitField.Flags.BanMembers);
}

export function isValidDiscordSnowflake(snowflake: string): boolean {
	return /^\d{17,19}$/.test(snowflake);
}

export function makeComponents(components: ButtonBuilder[]): InteractionReplyOptions['components'] {
	return chunk(components, 5).map(i => ({ components: i, type: ComponentType.ActionRow }));
}

export function cleanUsername(username: string) {
	return stripEmojis(username).substring(0, 32).replace(/[@|*]/g, '');
}
