import {
	ApplicationCommandOptionType,
	type ButtonBuilder,
	type ButtonInteraction,
	type CacheType,
	type Client,
	type Collection,
	type CollectorFilter,
	ComponentType,
	type Guild,
	type InteractionReplyOptions,
	type Message,
	PermissionsBitField,
	type SelectMenuInteraction
} from 'discord.js';

import { chunk, randArrItem, shuffleArr } from '../array.js';
import { randInt } from '../chanceTemporary.js';
import { stripEmojis } from '../misc.js';
import type { MahojiClient } from './MahojiClient/Mahoji.js';
import type { CommandOption } from './MahojiClient/mahojiTypes.js';

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
	return stripEmojis(username).replace(/[@|*]/g, '').substring(0, 32);
}

export function awaitMessageComponentInteraction({
	message,
	filter,
	time
}: {
	time: number;
	message: Message;
	filter: CollectorFilter<
		[
			ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>,
			Collection<string, ButtonInteraction<CacheType> | SelectMenuInteraction>
		]
	>;
}): Promise<SelectMenuInteraction<CacheType> | ButtonInteraction<CacheType>> {
	return new Promise((resolve, reject) => {
		const collector = message.createMessageComponentCollector<ComponentType.Button>({ max: 1, filter, time });
		collector.once('end', (interactions, reason) => {
			const interaction = interactions.first();
			if (interaction) resolve(interaction);
			else reject(new Error(reason));
		});
	});
}

type CommandInput = Record<string, any>;

export async function generateCommandInputs(options: readonly CommandOption[]): Promise<CommandInput[]> {
	const results: CommandInput[] = [];
	const allPossibleOptions: Record<string, any[]> = {};

	if (options.length === 0) {
		return [{}];
	}

	for (const option of options) {
		switch (option.type) {
			case ApplicationCommandOptionType.SubcommandGroup:
			case ApplicationCommandOptionType.Subcommand:
				if (option.options) {
					const subOptionsResults = await generateCommandInputs(option.options);
					results.push(...subOptionsResults.map(input => ({ [option.name]: input })));
				}
				break;
			case ApplicationCommandOptionType.String:
				if ('autocomplete' in option && option.autocomplete) {
					const autoCompleteResults = await option.autocomplete(
						'',
						{ id: randomSnowflake() } as any,
						{} as any
					);
					allPossibleOptions[option.name] = shuffleArr(autoCompleteResults.map(c => c.value)).slice(0, 10);
				} else if (option.choices) {
					allPossibleOptions[option.name] = shuffleArr(option.choices.map(c => c.value)).slice(0, 10);
				} else if (['guild_id', 'message_id'].includes(option.name)) {
					allPossibleOptions[option.name] = ['157797566833098752'];
				} else {
					allPossibleOptions[option.name] = ['plain string'];
				}
				break;
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.Number:
				if (option.choices) {
					allPossibleOptions[option.name] = shuffleArr(option.choices.map(c => c.value)).slice(0, 10);
				} else {
					let value = randInt(1, 10);
					if (option.min_value && option.max_value) {
						value = randInt(option.min_value, option.max_value);
					}
					allPossibleOptions[option.name] = [
						option.min_value ?? 0,
						randInt(option.min_value ?? 0, value),
						value
					];
				}
				break;
			case ApplicationCommandOptionType.Boolean: {
				allPossibleOptions[option.name] = [true, false];
				break;
			}
			case ApplicationCommandOptionType.User: {
				allPossibleOptions[option.name] = [
					{
						user: {
							id: '425134194436341760',
							username: 'username',
							bot: false
						},
						member: undefined
					}
				];
				break;
			}
			case ApplicationCommandOptionType.Channel:
			case ApplicationCommandOptionType.Role:
			case ApplicationCommandOptionType.Mentionable:
				// results.push({ ...currentPath, [option.name]: `Any ${option.type}` });
				break;
		}
	}

	const sorted = Object.values(allPossibleOptions).sort((a, b) => b.length - a.length);
	const longestOptions = sorted[0]?.length;
	for (let i = 0; i < longestOptions; i++) {
		const obj: Record<string, any> = {};
		for (const [key, val] of Object.entries(allPossibleOptions)) {
			obj[key] = val[i] ?? randArrItem(val);
		}
		results.push(obj);
	}
	return results;
}
