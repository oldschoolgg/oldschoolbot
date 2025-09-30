import type { AbstractCommandAttributes, CommandOptions, ICommand, SpecialResponse } from '@oldschoolgg/toolkit';
import type { InteractionReplyOptions, User } from 'discord.js';

import type { MMember } from '@/lib/structures/MInteraction.js';

declare global {
	type MInteraction = import('@/lib/structures/MInteraction.js').MInteraction;
	type CompatibleResponse = import('@/lib/structures/PaginatedMessage.js').CompatibleResponse;
	interface CommandRunOptions<T extends CommandOptions = {}> {
		interaction: MInteraction;
		options: T;
		user: User;
		member?: MMember;
		channelID: string;
		guildID?: string;
		userID: string;
	}

	type CommandResponse = Promise<null | string | InteractionReplyOptions | SpecialResponse>;

	interface OSBMahojiCommand extends ICommand {
		attributes?: Omit<AbstractCommandAttributes, 'description'>;
	}
}
