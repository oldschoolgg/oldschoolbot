import {
	type APIApplicationCommandOptionChoice,
	type APIInteractionDataResolvedChannel,
	type APIInteractionDataResolvedGuildMember,
	type APIRole,
	ApplicationCommandOptionType,
	type Channel,
	type ChatInputCommandInteraction,
	type CommandInteractionOption,
	type GuildMember,
	type PermissionFlagsBits,
	type Role,
	type User
} from 'discord.js';

export function convertCommandOptionToAPIOption(option: CommandOption): any {
	switch (option.type) {
		case 'Number':
		case 'Integer':
		case 'String': {
			return {
				...option,
				type: stringyToApiMap[option.type],
				autocomplete: 'autocomplete' in option
			};
		}

		default: {
			return {
				...option,
				type: stringyToApiMap[option.type],
				options:
					'options' in option && option.options ? option.options.map(convertCommandOptionToAPIOption) : []
			};
		}
	}
}

type StringyApplicationCommandOptionType =
	| 'Subcommand'
	| 'SubcommandGroup'
	| 'String'
	| 'Integer'
	| 'Boolean'
	| 'User'
	| 'Channel'
	| 'Role'
	| 'Mentionable'
	| 'Number';

const stringyToApiMap: Record<StringyApplicationCommandOptionType, ApplicationCommandOptionType> = {
	Subcommand: ApplicationCommandOptionType.Subcommand,
	SubcommandGroup: ApplicationCommandOptionType.SubcommandGroup,
	String: ApplicationCommandOptionType.String,
	Integer: ApplicationCommandOptionType.Integer,
	Boolean: ApplicationCommandOptionType.Boolean,
	User: ApplicationCommandOptionType.User,
	Channel: ApplicationCommandOptionType.Channel,
	Role: ApplicationCommandOptionType.Role,
	Mentionable: ApplicationCommandOptionType.Mentionable,
	Number: ApplicationCommandOptionType.Number
};
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
			type: 'Subcommand' | 'SubcommandGroup';
			options?: CommandOption[];
	  }
	| {
			type: 'String';
			choices?: { name: string; value: string }[];
			autocomplete?: (
				value: string,
				user: MUser,
				member?: GuildMember,
				context?: AutocompleteContext
			) => Promise<APIApplicationCommandOptionChoice[]>;
	  }
	| {
			type: 'Integer' | 'Number';
			choices?: { name: string; value: number }[];
			autocomplete?: (
				value: number,
				user: MUser,
				member?: GuildMember,
				context?: AutocompleteContext
			) => Promise<APIApplicationCommandOptionChoice[]>;
			min_value?: number;
			max_value?: number;
	  }
	| {
			type: 'Boolean' | 'User' | 'Channel' | 'Role' | 'Mentionable';
	  }
);

export interface MahojiUserOption {
	user: User;
	member?: GuildMember | APIInteractionDataResolvedGuildMember;
}

export interface AutocompleteContext {
	options: readonly CommandInteractionOption[];
	focusedOption: CommandInteractionOption;
	option?: CommandOption;
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
