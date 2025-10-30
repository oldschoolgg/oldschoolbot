import { Client, PermissionsBitField } from '@oldschoolgg/discord.js';
import {
	ActivityType,
	type APIEmoji,
	type APIGuildMember,
	type APIRole,
	GatewayOpcodes,
	type GatewayUpdatePresence,
	PresenceUpdateStatus,
	Routes
} from 'discord-api-types/v10';
import { omit } from 'remeda';

import { globalConfig } from '@/lib/constants.js';
import { ReactEmoji } from '@/lib/data/emojis.js';
import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';

export class OldSchoolBotClient extends Client<true> {
	public isShuttingDown = false;
	public allCommands = allCommandsDONTIMPORT;

	// private async syncMainServerData() {
	// 	const mainServerRoles = await globalClient.rest.get(Routes.guildRoles(globalConfig.supportServerID)) as APIRole[];
	// 	for (const role of mainServerRoles) {
	// 		Cache.MAIN_SERVER.ROLES.set(role.id, role)
	// 	}
	// }

	async onReady() {
		// await this.syncMainServerData();
	}

	async giveRole(guildId: string, userId: string, roleId: string) {
		const route = Routes.guildMemberRole(guildId, userId, roleId);
		await globalClient.rest.put(route);
	}

	async fetchRolesOfGuild(guildId: string) {
		const roles: APIRole[] = (await globalClient.rest.get(Routes.guildRoles(guildId))) as APIRole[];
		return roles;
	}

	async fetchEmoji({ guildId, emojiId }: { guildId: string; emojiId: string }): Promise<APIEmoji | null> {
		const route = Routes.guildEmoji(guildId, emojiId);
		const res = await globalClient.rest.get(route);
		return res as APIEmoji | null;
	}

	async fetchMainServerMember(userId: string) {
		const m = await this.fetchMemberWithRoles({ guildId: globalConfig.supportServerID, userId });
		return m;
	}
	// async fetchRawMainServerMember(userId: string): Promise<APIGuildMember | null> {
	// 	const cached = Cache.MAIN_SERVER.MEMBERS.get(userId);
	// 	if (cached) return cached;
	// 	const m = await this.fetchMember({ guildId: globalConfig.supportServerID, userId })
	// 	return m;
	// }

	async fetchMember({ guildId, userId }: { guildId: string; userId: string }): Promise<APIGuildMember | null> {
		const route = Routes.guildMember(guildId, userId);
		const res = await globalClient.rest.get(route);
		return res as APIGuildMember | null;
	}

	async fetchMemberWithRoles({
		guildId,
		userId
	}: {
		guildId: string;
		userId: string;
	}): Promise<null | ({ roles: APIRole[]; permissions: PermissionsBitField } & Omit<APIGuildMember, 'roles'>)> {
		const member = await this.fetchMember({ guildId, userId });
		if (!member) return null;
		const roles = (await this.fetchRolesOfGuild(guildId)).filter(_r => member.roles.includes(_r.id));
		const permissions = new PermissionsBitField(roles.map(role => BigInt(role.permissions))).freeze();
		return { ...omit(member, ['roles']), permissions, roles };
	}

	async setPresence({
		text,
		type = ActivityType.Listening,
		status = PresenceUpdateStatus.Online
	}: {
		text: string;
		type?: ActivityType;
		status?: PresenceUpdateStatus;
	}) {
		const d: GatewayUpdatePresence = {
			op: GatewayOpcodes.PresenceUpdate,
			d: {
				since: Date.now() - process.uptime() * 1000,
				activities: [
					{
						name: text,
						type
					}
				],
				status,
				afk: false
			}
		};
		this._broadcast(d);
	}

	async reactToMsg({
		channelId,
		messageId,
		emojiId
	}: {
		channelId: string;
		messageId: string;
		emojiId: keyof typeof ReactEmoji;
	}) {
		const route = Routes.channelMessageOwnReaction(channelId, messageId, encodeURIComponent(ReactEmoji[emojiId]));
		await globalClient.rest.put(route);
	}
}
