import type { SpecialResponse } from '@oldschoolgg/toolkit';
import type { InteractionReplyOptions } from 'discord.js';

import type { CommandOptions } from '@/discord/commandOptions.ts';

declare global {
	type RUser = import('@/structures/RUser.js').RUser;
	type RoboChimpClient = import('@/discord/client.js').RoboChimpClientClass;
	var globalClient: RoboChimpClient;

	type RoboChimpCommand = import('@/discord/commandOptions.js').RoboChimpCommand;
	type CommandOption = import('@/discord/commandOptions.js').CommandOption;
	type MInteraction = import('@/structures/MInteraction.js').MInteraction;
	type CompatibleResponse = import('@/structures/PaginatedMessage.js').CompatibleResponse;
	type MahojiUserOption = import('@/discord/commandOptions.js').MahojiUserOption;
	type RNGProvider = import('@oldschoolgg/rng').RNGProvider;
	interface CommandRunOptions<T extends CommandOptions = {}> {
		interaction: MInteraction;
		options: T;
		client: RoboChimpClient;
		user: RUser;
		member?: MMember;
		channelID: string;
		guildID?: string;
		userID: string;
	}

	type CommandResponse = Promise<null | string | InteractionReplyOptions | SpecialResponse>;
}
