declare const __BOT_TYPE__: 'OSB' | 'BSO';
import type { CommandOptions, MahojiClient, ICommand, AbstractCommandAttributes } from "@oldschoolgg/toolkit/discord-util";
import type { ChatInputCommandInteraction, User, BaseInteraction, InteractionReplyOptions } from "discord.js";

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
