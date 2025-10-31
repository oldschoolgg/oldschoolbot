import { makeURLSearchParams, REST } from '@discordjs/rest';
import {
	ActivityType,
	type APIApplicationCommandOptionChoice,
	type APIEmoji,
	type APIGuildMember,
	type APIRole,
	Client,
	GatewayOpcodes,
	type GatewayUpdatePresence,
	type MessageCreateOptions,
	type MessageEditOptions,
	PermissionsBitField,
	PresenceUpdateStatus,
	Routes,
	type Snowflake
} from '@oldschoolgg/discord';
import type { IChannel, IInteraction, IMessage } from '@oldschoolgg/schemas';
import { omit } from 'remeda';

import { globalConfig } from '@/lib/constants.js';
import { ReactEmoji } from '@/lib/data/emojis.js';
import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';

export class OldSchoolBotClient extends Client<true> {
	private _rest: REST = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);
	public isShuttingDown = false;
	public allCommands = allCommandsDONTIMPORT;

	// TODO:
	// private async syncMainServerData() {
	// 	const mainServerRoles = await this._rest.get(Routes.guildRoles(globalConfig.supportServerID)) as APIRole[];
	// 	for (const role of mainServerRoles) {
	// 		Cache.MAIN_SERVER.ROLES.set(role.id, role)
	// 	}
	// }

	async onReady() {
		// await this.syncMainServerData();
	}

	async respondToAutocompleteInteraction(interaction: IInteraction, message: APIApplicationCommandOptionChoice[]) {
		const route = Routes.interactionCallback(interaction.id, interaction.token);
		await this._rest.post(route, {
			body:
				typeof message === 'string'
					? {
							type: 4,
							data: { content: message }
						}
					: {
							type: 4,
							data: message
						}
		});
	}

	async sendMessage(channelId: string, message: string | MessageCreateOptions): Promise<IMessage> {
		const route = Routes.channelMessages(channelId);
		const res = await this._rest.post(route, {
			body: typeof message === 'string' ? { content: message } : message
		});
		return res as IMessage;
	}

	async sendDm(userId: string, message: string | MessageCreateOptions) {
		const dmChannel: any = await this.rest.post(Routes.userChannels(), {
			body: { recipient_id: userId }
		});
		return this.sendMessage(dmChannel.id, message);
	}

	async deleteMessage(channelId: string, messageId: string) {
		const route = Routes.channelMessage(channelId, messageId);
		const res = await this._rest.delete(route);
		return res;
	}

	async editMessage(channelId: string, messageId: string, body: MessageEditOptions) {
		const route = Routes.channelMessage(channelId, messageId);
		const res = await this._rest.patch(route, {
			body
		});
		return res;
	}

	async fetchChannel(channelId: string): Promise<IChannel | null> {
		const route = Routes.channel(channelId);
		const res = await this._rest.get(route);
		return (res ?? null) as IChannel | null;
	}

	async fetchChannelMessages(
		channelId: string,
		options: {
			after?: Snowflake;
			around?: Snowflake;
			before?: Snowflake;
			cache?: boolean;
			limit?: number;
		}
	): Promise<IMessage[]> {
		const route = Routes.channelMessages(channelId);
		const res = await this._rest.get(route, {
			query: makeURLSearchParams(options)
		});
		return res as IMessage[];
	}

	async fetchMessage(channelId: string, messageId: string): Promise<IMessage | null> {
		const route = Routes.channelMessage(channelId, messageId);
		const res = await this._rest.get(route);
		return (res ?? null) as IMessage | null;
	}

	async giveRole(guildId: string, userId: string, roleId: string) {
		const route = Routes.guildMemberRole(guildId, userId, roleId);
		await this._rest.put(route);
	}

	async fetchRolesOfGuild(guildId: string) {
		const roles: APIRole[] = (await this._rest.get(Routes.guildRoles(guildId))) as APIRole[];
		return roles;
	}

	async fetchEmoji({ guildId, emojiId }: { guildId: string; emojiId: string }): Promise<APIEmoji | null> {
		const route = Routes.guildEmoji(guildId, emojiId);
		const res = await this._rest.get(route);
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
		const res = await this._rest.get(route);
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
		await this._rest.put(route);
	}
}
