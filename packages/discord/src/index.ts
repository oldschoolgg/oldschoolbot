import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, userMention } from '@discordjs/builders';
import type { IChannel, IMember, IRole, IUser } from '@oldschoolgg/schemas';
import {
	ActivityType,
	type APIApplication,
	type APIApplicationCommand,
	type APIApplicationCommandBasicOption,
	type APIApplicationCommandOption,
	type APIApplicationCommandOptionChoice,
	type APIApplicationCommandSubcommandOption,
	type APIAttachment,
	type APIChannel,
	type APIChatInputApplicationCommandGuildInteraction,
	type APIChatInputApplicationCommandInteraction,
	type APIEmoji,
	type APIGuild,
	type APIGuildMember,
	type APIInteraction,
	type APIInteractionDataResolvedChannel,
	type APIInteractionDataResolvedGuildMember,
	type APIMessage,
	type APIMessageComponentInteraction,
	type APIRole,
	type APIUser,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChannelType,
	ComponentType,
	GatewayDispatchEvents,
	type GatewayGuildCreateDispatchData,
	GatewayIntentBits,
	GatewayOpcodes,
	type GatewayReadyDispatchData,
	type GatewaySendPayload,
	type GatewayUpdatePresence,
	InteractionResponseType,
	InteractionType,
	MessageFlags,
	MessageReferenceType,
	PresenceUpdateStatus,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	type RESTPostAPIChannelMessageJSONBody,
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
	type APIMessageComponentInteraction,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	type RESTPostAPIChannelMessageJSONBody,
	type APIApplicationCommandOptionChoice,
	type GatewayReadyDispatchData,
	type GatewaySendPayload,
	type GatewayUpdatePresence,
	type APIApplicationCommand,
	type APIEmoji,
	type APIChannel,
	type APIChatInputApplicationCommandInteraction,
	type APIApplicationCommandSubcommandOption,
	type APIGuild,
	type APIAttachment,
	type APIApplicationCommandBasicOption,
	type APIApplicationCommandOption,
	type APIApplication,
	type APIMessage,
	type GatewayGuildCreateDispatchData,
	type APIGuildMember,
	type APIInteraction,
	type APIRole,
	type APIChatInputApplicationCommandGuildInteraction,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	GatewayDispatchEvents,
	InteractionResponseType,
	MessageFlags,
	MessageReferenceType,
	GatewayOpcodes,
	Routes,
	ButtonBuilder,
	InteractionType,
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

export * from './Permissions.js';
export * from './util.js';

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
