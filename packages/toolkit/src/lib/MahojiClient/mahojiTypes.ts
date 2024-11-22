import type {
	APIApplicationCommandOptionChoice,
	APIInteractionDataResolvedChannel,
	APIInteractionDataResolvedGuildMember,
	APIRole,
	ApplicationCommandOptionType,
	BaseInteraction,
	Channel,
	ChatInputCommandInteraction,
	Client,
	GuildMember,
	Role,
	User
} from 'discord.js';
import type { MahojiClient } from './Mahoji';

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
				user: User,
				member?: GuildMember
			) => Promise<APIApplicationCommandOptionChoice[]>;
	  }
	| {
			type: ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number;
			choices?: { name: string; value: number }[];
			autocomplete?: (
				value: number,
				user: User,
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

export interface CommandRunOptions<T extends CommandOptions = {}> {
	interaction: ChatInputCommandInteraction;
	options: T;
	client: MahojiClient;
	user: User;
	member?: BaseInteraction['member'];
	channelID: string;
	guildID?: string;
	userID: string;
	djsClient: Client;
}
