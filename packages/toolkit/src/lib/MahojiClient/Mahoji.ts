import {
	type APIApplicationCommandOptionChoice,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	type ChatInputCommandInteraction,
	type Client,
	type CommandInteractionOption,
	type GuildMember,
	type Interaction,
	type InteractionReplyOptions,
	PermissionFlagsBits,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	Routes,
	type Snowflake,
	type User
} from 'discord.js';
import type { CommandOption, CommandOptions, CommandRunOptions } from './mahojiTypes';

export function convertCommandOptionToAPIOption(option: CommandOption): any {
	switch (option.type) {
		case ApplicationCommandOptionType.Number:
		case ApplicationCommandOptionType.Integer:
		case ApplicationCommandOptionType.String: {
			return {
				...option,
				autocomplete: 'autocomplete' in option
			};
		}

		default: {
			return {
				...option,
				// TODO(gc): How the fuck do I fix this
				// @ts-ignore
				options:
					'options' in option && option.options ? option.options.map(convertCommandOptionToAPIOption) : []
			};
		}
	}
}

export function convertCommandToAPICommand(
	cmd: ICommand
): RESTPostAPIApplicationGuildCommandsJSONBody & { description: string } {
	return {
		type: ApplicationCommandType.ChatInput,
		name: cmd.name,
		description: cmd.description,
		options: cmd.options.map(convertCommandOptionToAPIOption)
	};
}

export async function bulkUpdateCommands({
	client,
	commands,
	guildID
}: {
	client: MahojiClient;
	commands: ICommand[];
	guildID: Snowflake | null;
}) {
	const apiCommands = commands.map(convertCommandToAPICommand);

	const route =
		guildID === null
			? Routes.applicationCommands(client.applicationID)
			: Routes.applicationGuildCommands(client.applicationID, guildID);

	return client.djsClient.rest.put(route, {
		body: apiCommands
	});
}

export async function updateCommand({
	client,
	command,
	guildID
}: {
	client: MahojiClient;
	command: ICommand;
	guildID: Snowflake | null;
}) {
	const apiCommand = convertCommandToAPICommand(command);
	const route =
		guildID === null
			? Routes.applicationCommands(client.applicationID)
			: Routes.applicationGuildCommands(client.applicationID, guildID ?? command.guildID);
	return client.djsClient.rest.post(route, {
		body: apiCommand
	});
}

export function convertAPIOptionsToCommandOptions(
	options: ChatInputCommandInteraction['options']['data'],
	resolvedObjects: ChatInputCommandInteraction['options']['resolved'] | null
): CommandOptions {
	if (!options) return {};

	const parsedOptions: CommandOptions = {};

	for (const opt of options) {
		if (
			opt.type === ApplicationCommandOptionType.SubcommandGroup ||
			opt.type === ApplicationCommandOptionType.Subcommand
		) {
			const opts: CommandOptions = {};
			for (const [key, value] of Object.entries(
				convertAPIOptionsToCommandOptions(opt.options ?? [], resolvedObjects)
			)) {
				opts[key] = value;
			}
			parsedOptions[opt.name] = opts;
		} else if (opt.type === ApplicationCommandOptionType.Channel) {
			if (resolvedObjects?.channels) {
				parsedOptions[opt.name] = resolvedObjects.channels.get(opt.value as string)!;
			}
		} else if (opt.type === ApplicationCommandOptionType.Role) {
			if (resolvedObjects?.roles) {
				parsedOptions[opt.name] = resolvedObjects.roles.get(opt.value as string)!;
			}
		} else if (opt.type === ApplicationCommandOptionType.User) {
			if (resolvedObjects?.users) {
				parsedOptions[opt.name] = {
					user: resolvedObjects.users.get(opt.value as string)!,
					member: resolvedObjects.members?.has(opt.value as string)
						? resolvedObjects.members.get(opt.value as string)!
						: undefined
				};
			}
		} else {
			parsedOptions[opt.name as string] = opt.value as any;
		}
	}

	return parsedOptions;
}

export async function handleAutocomplete(
	command: ICommand | undefined,
	autocompleteData: CommandInteractionOption[],
	member: GuildMember | undefined,
	user: User,
	option?: CommandOption
): Promise<APIApplicationCommandOptionChoice[]> {
	if (!command || !autocompleteData) return [];
	const data = autocompleteData.find(i => 'focused' in i && i.focused === true) ?? autocompleteData[0];
	if (data.type === ApplicationCommandOptionType.SubcommandGroup) {
		const group = command.options.find(c => c.name === data.name);
		if (group?.type !== ApplicationCommandOptionType.SubcommandGroup) return [];
		const subCommand = group.options?.find(
			c => c.name === data.options?.[0].name && c.type === ApplicationCommandOptionType.Subcommand
		);
		if (
			!subCommand ||
			!data.options ||
			!data.options[0] ||
			subCommand.type !== ApplicationCommandOptionType.Subcommand
		) {
			return [];
		}
		const option = data.options[0].options?.find(t => (t as any).focused);
		if (!option) return [];
		const subSubCommand = subCommand.options?.find(o => o.name === option.name);
		return handleAutocomplete(command, [option], member, user, subSubCommand);
	}
	if (data.type === ApplicationCommandOptionType.Subcommand) {
		if (!data.options || !data.options[0]) return [];
		const subCommand = command.options.find(c => c.name === data.name);
		if (subCommand?.type !== ApplicationCommandOptionType.Subcommand) return [];
		const option = data.options.find(o => ('focused' in o ? Boolean(o.focused) : false)) ?? data.options[0];
		const subOption = subCommand.options?.find(c => c.name === option.name);
		if (!subOption) return [];

		return handleAutocomplete(command, [option], member, user, subOption);
	}

	const optionBeingAutocompleted = option ?? command.options.find(o => o.name === data.name);

	if (
		optionBeingAutocompleted &&
		'autocomplete' in optionBeingAutocompleted &&
		optionBeingAutocompleted.autocomplete !== undefined
	) {
		const autocompleteResult = await optionBeingAutocompleted.autocomplete(data.value as never, user, member);
		return autocompleteResult.slice(0, 25).map(i => ({
			name: i.name,
			value: i.value.toString()
		}));
	}
	return [];
}

export type CommandResponse = Promise<null | string | InteractionReplyOptions>;

export type ICommand = Readonly<{
	name: string;
	description: string;
	options: CommandOption[];
	requiredPermissions?: (keyof typeof PermissionFlagsBits)[];
	guildID?: string;
	run(options: CommandRunOptions): CommandResponse;
}>;

interface MahojiOptions {
	developmentServerID: string;
	applicationID: string;
	handlers?: Handlers;
	djsClient: Client;
	commands: ICommand[];
}

export interface Handlers {
	preCommand?: (options: {
		command: ICommand;
		interaction: ChatInputCommandInteraction;
		options: CommandOptions;
	}) => Promise<undefined | { reason: Awaited<InteractionReplyOptions>; dontRunPostCommand?: boolean }>;
	postCommand?: (options: {
		command: ICommand;
		interaction: ChatInputCommandInteraction;
		error: Error | null;
		inhibited: boolean;
		options: CommandOptions;
	}) => Promise<unknown>;
}

export class MahojiClient {
	commands: Map<string, ICommand> = new Map();
	developmentServerID: string;
	applicationID: string;
	handlers: Handlers;
	djsClient: Client;

	constructor(options: MahojiOptions) {
		this.developmentServerID = options.developmentServerID;
		this.applicationID = options.applicationID;
		this.handlers = options.handlers ?? {};
		this.djsClient = options.djsClient;

		for (const command of options.commands) {
			this.commands.set(command.name, command);
		}
	}

	async parseInteraction(interaction: Interaction) {
		const member = interaction.inCachedGuild() ? interaction.member : undefined;

		if (interaction.isAutocomplete()) {
			const command = this.commands.get(interaction.commandName);
			const choices = await handleAutocomplete(
				command,
				(interaction.options as any).data as CommandInteractionOption[],
				member,
				interaction.user
			);
			return interaction.respond(choices);
		}

		if (interaction.isChatInputCommand()) {
			const command = this.commands.get(interaction.commandName);
			if (!command) return null;

			// Permissions
			if (command.requiredPermissions) {
				if (!interaction.member || !interaction.memberPermissions) return null;
				for (const perm of command.requiredPermissions) {
					if (!interaction.memberPermissions.has(PermissionFlagsBits[perm])) {
						return interaction.reply({
							content: "You don't have permission to use this command.",
							ephemeral: true
						});
					}
				}
			}

			const options = convertAPIOptionsToCommandOptions(interaction.options.data, interaction.options.resolved);
			let error: Error | null = null;
			let inhibited = false;
			let runPostCommand = true;
			try {
				const inhibitedResponse = await this.handlers.preCommand?.({
					command,
					interaction,
					options
				});
				if (inhibitedResponse) {
					if (inhibitedResponse.dontRunPostCommand) runPostCommand = false;
					inhibited = true;
					return interaction.reply({
						ephemeral: true,
						...inhibitedResponse.reason
					});
				}

				const response = await command.run({
					interaction,
					options,
					client: this,
					user: interaction.user,
					member: interaction.member,
					channelID: interaction.channelId,
					guildID: interaction.guild?.id,
					userID: interaction.user.id,
					djsClient: this.djsClient
				});
				if (!response) return;
				if (interaction.replied) {
					return interaction.followUp(response);
				}
				if (interaction.deferred) {
					return interaction.editReply(response);
				}
				const replyResponse = await interaction.reply(response);
				return replyResponse;
			} catch (err) {
				if (!(err instanceof Error)) console.error('Received an error that isnt an Error.');
				error = err as Error;
				if (error) {
					return { error };
				}
			} finally {
				if (runPostCommand) {
					await this.handlers.postCommand?.({
						command,
						interaction,
						error,
						inhibited,
						options
					});
				}
			}
		}

		return null;
	}
}
