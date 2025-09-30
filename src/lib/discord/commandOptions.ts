import {
	type APIApplicationCommandOptionChoice,
	type APIInteractionDataResolvedChannel,
	type APIInteractionDataResolvedGuildMember,
	type APIRole,
	ApplicationCommandOptionType,
	type Channel,
	type ChatInputCommandInteraction,
	type GuildMember,
	type PermissionFlagsBits,
	type Role,
	type User
} from 'discord.js';

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
				options:
					'options' in option && option.options ? option.options.map(convertCommandOptionToAPIOption) : []
			};
		}
	}
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

export type CommandOption = {
	name: string;
	description: string;
	required?: boolean;
} & (
	| {
			type: ApplicationCommandOptionType.Subcommand | ApplicationCommandOptionType.SubcommandGroup;
			options?: CommandOption[];
	  }
	| {
			type: ApplicationCommandOptionType.String;
			choices?: { name: string; value: string }[];
			autocomplete?: (
				value: string,
				user: MUser,
				member?: GuildMember
			) => Promise<APIApplicationCommandOptionChoice[]>;
	  }
	| {
			type: ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number;
			choices?: { name: string; value: number }[];
			autocomplete?: (
				value: number,
				user: MUser,
				member?: GuildMember
			) => Promise<APIApplicationCommandOptionChoice[]>;
			min_value?: number;
			max_value?: number;
	  }
	| {
			type:
				| ApplicationCommandOptionType.Boolean
				| ApplicationCommandOptionType.User
				| ApplicationCommandOptionType.Channel
				| ApplicationCommandOptionType.Role
				| ApplicationCommandOptionType.Mentionable;
	  }
);

export interface MahojiUserOption {
	user: User;
	member?: GuildMember | APIInteractionDataResolvedGuildMember;
}

export type MahojiCommandOption =
	| number
	| string
	| MahojiUserOption
	| Channel
	| APIInteractionDataResolvedChannel
	| Role
	| APIRole
	| boolean;

export interface CommandOptions {
	[key: string]: MahojiCommandOption | CommandOptions;
}

export type ICommand = Readonly<{
	name: string;
	description: string;
	options: CommandOption[];
	requiredPermissions?: (keyof typeof PermissionFlagsBits)[];
	guildID?: string;
	run(options: CommandRunOptions): CommandResponse;
}>;

export type CategoryFlag =
	| 'minion'
	| 'settings'
	| 'patron'
	| 'skilling'
	| 'pvm'
	| 'minigame'
	| 'utility'
	| 'fun'
	| 'simulation';

export interface AbstractCommandAttributes {
	examples?: string[];
	categoryFlags?: CategoryFlag[];
	enabled?: boolean;
	cooldown?: number;
	requiresMinionNotBusy?: boolean;
	requiresMinion?: boolean;
	description: string;
}
