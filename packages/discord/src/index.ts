import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, userMention } from '@discordjs/builders';
import type { IChannel, IMember, IRole, IUser } from '@oldschoolgg/schemas';
import {
	ActivityType,
	type APIInteractionDataResolvedChannel,
	type APIInteractionDataResolvedGuildMember,
	type APIRole,
	type APIUser,
	ChannelType,
	ComponentType,
	GatewayIntentBits,
	InteractionResponseType,
	MessageFlags,
	PresenceUpdateStatus,
	Routes
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
	Routes,
	ButtonBuilder,
	ActionRowBuilder,
	ComponentType,
	userMention,
	ChannelType,
	EmbedBuilder,
	PresenceUpdateStatus,
	GatewayIntentBits,
	ActivityType
};

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
	userId: string;
	apiMember: APIInteractionDataResolvedGuildMember;
	guildId: string;
}): IMember {
	return {
		user_id: options.userId,
		guild_id: options.guildId,
		permissions: Permissions.toKeys(options.apiMember.permissions),
		roles: options.apiMember.roles
	};
}

export function convertApiChannelToZChannel({
	apiChannel,
	guildId
}: {
	apiChannel: APIInteractionDataResolvedChannel;
	guildId?: string;
}): IChannel {
	return {
		id: apiChannel.id,
		guild_id: guildId ?? null,
		type: apiChannel.type
	};
}

export function convertApiRoleToZRole({ apiRole, guildId }: { apiRole: APIRole; guildId: string }): IRole {
	return {
		id: apiRole.id,
		permissions: Permissions.toKeys(apiRole.permissions),
		guild_id: guildId,
		name: apiRole.name,
		color: apiRole.color
	};
}

export * from './BitField.js';
