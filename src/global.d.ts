import type { SpecialResponse } from '@oldschoolgg/toolkit';
import type { InteractionReplyOptions } from 'discord.js';

import type { AbstractCommandAttributes, ICommand } from '@/lib/discord/commandOptions.ts';
import type { MMember } from '@/lib/structures/MInteraction.js';

declare global {
	type CommandOption = import('@/lib/discord/commandOptions.js').CommandOption;
	type MInteraction = import('@/lib/structures/MInteraction.js').MInteraction;
	type CompatibleResponse = import('@/lib/structures/PaginatedMessage.js').CompatibleResponse;
	type MahojiUserOption = import('@/lib/discord/commandOptions.js').MahojiUserOption;
	interface CommandRunOptions<T extends CommandOptions = {}> {
		interaction: MInteraction;
		options: T;
		user: MUser;
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
