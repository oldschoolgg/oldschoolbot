declare const __BOT_TYPE__: 'OSB' | 'BSO';

import type { AbstractCommandAttributes, CommandOptions, ICommand, MahojiClient } from '@oldschoolgg/toolkit';
import type { BaseInteraction, ChatInputCommandInteraction, InteractionReplyOptions, User } from 'discord.js';

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
