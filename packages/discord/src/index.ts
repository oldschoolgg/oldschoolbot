import type { IUser, IMember, IChannel, IRole } from '@oldschoolgg/schemas';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, userMention } from '@discordjs/builders';
import {
	AttachmentBuilder,
	AutocompleteInteraction,
	type BaseMessageOptions,
	ButtonInteraction,
	type CacheType,
	ChatInputCommandInteraction,
	Client,
	Collection,
	type CollectorFilter,
	CommandInteraction,
	type CommandInteractionOption,
	Events,
	type Interaction,
	type InteractionReplyOptions,
	MessageCollector,
	type MessageComponentType,
	type MessageCreateOptions,
	type MessageEditOptions,
	Partials,
	PermissionsBitField,
	type SelectMenuInteraction,
	WebhookClient
} from '@oldschoolgg/discord.js';
import {
	ActivityType,
	ChannelType,
	ComponentType,
	GatewayIntentBits,
	InteractionResponseType,
	MessageFlags,
	PresenceUpdateStatus,
	Routes,
	type APIInteractionDataResolvedChannel,
	type APIInteractionDataResolvedGuildMember,
	type APIRole,
	type APIUser
} from 'discord-api-types/v10';
import { Permissions } from './Permissions.js';

export enum ButtonStyle {
	Primary = 1,
	Secondary = 2,
	Success = 3,
	Danger = 4,
	Link = 5,
	Premium = 6
}

export {
	InteractionResponseType,
	MessageFlags,
	ButtonInteraction,
	MessageCollector,
	AttachmentBuilder,
	Routes,
	PermissionsBitField,
	ButtonBuilder,
	ActionRowBuilder,
	ComponentType,
	userMention,
	ChannelType,
	EmbedBuilder,
	Collection,
	PresenceUpdateStatus,
	GatewayIntentBits,
	ActivityType,
	Events,
	Partials
};

export { WebhookClient, Client };

export type {
	CollectorFilter,
	CacheType,
	MessageCreateOptions,
	MessageEditOptions,
	BaseMessageOptions,
	MessageComponentType
};

// Interactions
export {
	type Interaction,
	ChatInputCommandInteraction,
	type InteractionReplyOptions,
	type SelectMenuInteraction,
	CommandInteraction,
	AutocompleteInteraction
};
export type { CommandInteractionOption };

export * from '@discordjs/formatters';

export * from './util.js';

export type ApplicationCommandOptionChoiceData<Value extends number | string = number | string> = {
	name: string;
	value: Value;
};

export * from './Permissions.js';

export function convertApiUserToZUser(apiUser: APIUser): IUser {
	return {
		id: apiUser.id,
		username: apiUser.username,
		bot: Boolean(apiUser.bot)
	};
}

export function convertApiMemberToZMember(options: {
	userId: string; apiMember: APIInteractionDataResolvedGuildMember;
	guildId: string;
}): IMember {
	return {
		user_id: options.userId,
		guild_id: options.guildId,
		permissions: Permissions.toKeys(options.apiMember.permissions),
		roles: options.apiMember.roles
	}
}

export function convertApiChannelToZChannel({ apiChannel, guildId }: {
	apiChannel: APIInteractionDataResolvedChannel;
	guildId?: string;
}): IChannel {
	return {
		id: apiChannel.id,
		guild_id: guildId ?? null,
		type: apiChannel.type
	};
}

export function convertApiRoleToZRole({ apiRole, guildId }: {
	apiRole: APIRole;
	guildId: string;
}): IRole {
	return {
		id: apiRole.id,
		permissions: Permissions.toKeys(apiRole.permissions),
		guild_id: guildId,
		name: apiRole.name,
		color: apiRole.color
	};
}
