import type { IChannel, IMember, IRole, IUser } from '@oldschoolgg/schemas';
import type {
	APIInteractionDataResolvedChannel,
	APIInteractionDataResolvedGuildMember,
	APIRole,
	APIUser
} from 'discord-api-types/v10';

import { Permissions } from './Permissions.js';

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
