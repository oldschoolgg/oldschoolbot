import type { ChatInputCommandInteraction, User, BaseInteraction, InteractionReplyOptions } from "discord.js";
import type { AbstractCommandAttributes, CommandOptions, ICommand, MahojiClient } from "./util/discord/index.js";

declare global {
	interface CommandRunOptions<T extends CommandOptions = {}> {
		interaction: ChatInputCommandInteraction;
		options: T;
		client: MahojiClient;
		user: User;
		member?: BaseInteraction['member'];
		channelID: string;
		guildID?: string;
		userID: string;
	}

	type CommandResponse = Promise<null | string | InteractionReplyOptions>;

	interface OSBMahojiCommand extends ICommand {
		attributes?: Omit<AbstractCommandAttributes, 'description'>;
	}
}

// biome-ignore lint/complexity/noUselessEmptyExport:
export {};
