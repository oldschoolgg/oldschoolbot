import type { SpecialResponse } from '@oldschoolgg/toolkit';
import type { GuildMember, InteractionReplyOptions } from 'discord.js';

import type { CommandOptions } from '@/discord/commandOptions.ts';

declare global {
	export type MahojiUserOption = import('./discord/index.js').MahojiUserOption;
	export type AnyCommand = import('./discord/index.js').AnyCommand;
	export type CommandOption = import('./discord/index.js').CommandOption;
	export type CommandResponse = import('./discord/index.js').CommandResponse;
	export type CommandRunOptions = import('./discord/index.js').CommandRunOptions<MUserInstance>;
	export type CommandOptions = import('./discord/index.js').CommandOptions;
	export type StringAutoComplete = import('./discord/index.js').StringAutoComplete;
	export type NumberAutoComplete = import('./discord/index.js').NumberAutoComplete;

	type RUser = import('@/structures/RUser.js').RUser;
	type RoboChimpClient = import('@/discord/client.js').RoboChimpClientClass;
	var globalClient: RoboChimpClient;

	export type MInteraction = import('@oldschoolgg/discord').MInteraction;

	type RoboChimpCommand = import('@/discord/commandOptions.js').RoboChimpCommand;
	type RNGProvider = import('@oldschoolgg/rng').RNGProvider;
	interface CommandRunOptions<T extends CommandOptions = {}> {
		interaction: MInteraction;
		options: T;
		client: RoboChimpClient;
		user: RUser;
		member: GuildMember | null;
		channelID: string;
		guildID?: string;
		userID: string;
	}

}
