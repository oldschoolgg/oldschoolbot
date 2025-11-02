import { makeURLSearchParams, REST } from '@discordjs/rest';
import { CompressionMethod, WebSocketManager, WebSocketShardEvents, WorkerShardingStrategy } from '@discordjs/ws';
import {
	ActivityType,
	type APIApplicationCommand,
	type APIApplicationCommandOptionChoice,
	type APIEmoji,
	type APIGuild,
	type APIGuildMember,
	type APIInteraction,
	type APIRole,
	BitField,
	GatewayDispatchEvents,
	GatewayIntentBits,
	GatewayOpcodes,
	type GatewayReadyDispatchData,
	type GatewaySendPayload,
	type GatewayUpdatePresence,
	MessageReferenceType,
	type PermissionKey,
	Permissions,
	PresenceUpdateStatus,
	Routes
} from '@oldschoolgg/discord';
import type { IChannel, IGuild, IInteraction, IMember, IMessage, IRole, IUser } from '@oldschoolgg/schemas';
import { uniqueArr } from '@oldschoolgg/toolkit';
import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';

import { globalConfig } from '@/lib/constants.js';
import { ReactEmoji } from '@/lib/data/emojis.js';
import { type CollectorOptions, createInteractionCollector } from '@/lib/discord/collector/collectSingle.js';
import { sendableMsgToApiCreate } from '@/lib/discord/SendableMessage.js';
import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';

export interface OldSchoolBotClientEventsMap {
	interactionCreate: [interaction: APIInteraction];
	guildCreate: [guild: APIGuild];
	ready: [data: GatewayReadyDispatchData];
	economyLog: [message: string];
	serverNotification: [message: string];
	error: [error: Error];
	messageCreate: [message: IMessage];
}

export class OldSchoolBotClient extends AsyncEventEmitter<OldSchoolBotClientEventsMap> implements AsyncDisposable {
	public rest: REST = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);
	public ws: WebSocketManager;
	public isShuttingDown = false;
	public allCommands = allCommandsDONTIMPORT;
	public applicationCommands: APIApplicationCommand[] | null = null;
	public applicationUser: IUser | null = null;

	constructor() {
		super();
		this.ws = new WebSocketManager({
			rest: this.rest,
			token: process.env.DISCORD_TOKEN,
			intents: new BitField([
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.DirectMessageReactions,
				GatewayIntentBits.GuildWebhooks
			]).bitfield,
			// shardCount: 6,
			// fetchGatewayInformation() {
			// 	return this.rest.get(Routes.gatewayBot()) as Promise<RESTGetAPIGatewayBotResult>;
			// },
			buildStrategy: manager => new WorkerShardingStrategy(manager, { shardsPerWorker: 4 }),
			initialPresence: {
				since: Date.now() - process.uptime() * 1000,
				activities: [
					{
						name: 'Starting Up...',
						type: ActivityType.Listening
					}
				],
				status: PresenceUpdateStatus.DoNotDisturb,
				afk: false
			},
			compression: CompressionMethod.ZlibNative
			// buildStrategy: (manager) => new WorkerShardingStrategy(manager, { shardsPerWorker: 'all' }),
		});

		this.ws.on(WebSocketShardEvents.Dispatch, async (packet, shardId) => {
			switch (packet.t) {
				case 'READY': {
					if (shardId === 0) {
						this.emit('ready', packet.d);
						this.onReady(packet.d);
					}
					break;
				}
				case GatewayDispatchEvents.InteractionCreate: {
					this.emit('interactionCreate', packet.d);
					break;
				}
				case GatewayDispatchEvents.MessageCreate: {
					const _msg = packet.d;
					const member = _msg.guild_id ? await Cache.getMember(_msg.guild_id, _msg.author.id) : null;
					const msg: IMessage = {
						id: _msg.id,
						content: _msg.content,
						author_id: _msg.author.id,
						channel_id: _msg.channel_id,
						guild_id: _msg.guild_id ?? null,
						author: {
							id: _msg.author.id,
							username: _msg.author.username,
							bot: Boolean(_msg.author.bot)
						},
						member
					};
					this.emit('messageCreate', msg);
					break;
				}
			}
		});
	}

	addEventListener<K extends keyof OldSchoolBotClientEventsMap>(
		event: K,
		listener: (...args: OldSchoolBotClientEventsMap[K]) => Promise<void> | void
	): void {
		this.on(event, listener as any);
	}

	removeEventListener<K extends keyof OldSchoolBotClientEventsMap>(
		event: K,
		listener: (...args: OldSchoolBotClientEventsMap[K]) => Promise<void> | void
	): void {
		this.off(event, listener as any);
	}

	async login() {
		await this.ws.connect();
	}
	// TODO:
	// private async syncMainServerData() {
	// 	const mainServerRoles = await this.rest.get(Routes.guildRoles(globalConfig.supportServerID)) as APIRole[];
	// 	for (const role of mainServerRoles) {
	// 		Cache.MAIN_SERVER.ROLES.set(role.id, role)
	// 	}
	// }

	async onReady(data: GatewayReadyDispatchData) {
		this.applicationUser = { ...data.user, bot: true };

		await this.fetchCommands();
		// await this.syncMainServerData();
	}

	private async fetchCommands() {
		const commands = (await this.rest.get(
			Routes.applicationCommands(this.applicationUser!.id)
		)) as APIApplicationCommand[];
		this.applicationCommands = commands;
	}

	async respondToAutocompleteInteraction(interaction: IInteraction, message: APIApplicationCommandOptionChoice[]) {
		const route = Routes.interactionCallback(interaction.id, interaction.token);
		await this.rest.post(route, {
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
	// async respondToButtonInteraction(interaction: IInteraction, message: APIApplicationCommandOptionChoice[]) {
	// 	const route = Routes.interactionCallback(interaction.id, interaction.token);
	// 	await this.rest.post(route, {
	// 		body:
	// 			typeof message === 'string'
	// 				? {
	// 					type: 4,
	// 					data: { content: message }
	// 				}
	// 				: {
	// 					type: 4,
	// 					data: message
	// 				}
	// 	});
	// }

	async fetchChannelsOfGuild(guildId: string): Promise<IChannel[]> {
		const apiChannels: any[] = (await this.rest.get(Routes.guildChannels(guildId))) as any[];
		const channels: IChannel[] = apiChannels.map(c => ({
			id: c.id,
			guild_id: guildId,
			type: c.type
		}));
		return channels;
	}

	async memberHasPermissions(member: IMember, perms: PermissionKey[]): Promise<boolean> {
		return perms.every(perm => member.permissions.includes(perm));
	}

	async replyToMessage(message: IMessage, response: SendableMessage): Promise<IMessage> {
		const data = await sendableMsgToApiCreate(response);
		data.message.message_reference = {
			message_id: message.id,
			type: MessageReferenceType.Default,
			channel_id: message.channel_id,
			guild_id: message.guild_id ?? undefined
		};
		const res = await this.rest.post(Routes.channelMessages(message.channel_id), {
			body: sendableMsgToApiCreate(message)
		});
		return res as IMessage;
	}

	async sendMessage(channelId: string, message: SendableMessage): Promise<IMessage> {
		const res = await this.rest.post(Routes.channelMessages(channelId), {
			body: sendableMsgToApiCreate(message)
		});
		return res as IMessage;
	}

	async sendDm(userId: string, message: SendableMessage) {
		const dmChannel: any = await this.rest.post(Routes.userChannels(), {
			body: { recipient_id: userId }
		});
		return this.sendMessage(dmChannel.id, message);
	}

	async deleteMessage(channelId: string, messageId: string) {
		const route = Routes.channelMessage(channelId, messageId);
		const res = await this.rest.delete(route);
		return res;
	}

	async editMessage(channelId: string, messageId: string, body: SendableMessage) {
		const route = Routes.channelMessage(channelId, messageId);
		const res = await this.rest.patch(route, {
			body
		});
		return res;
	}

	async fetchGuild(guildId: string): Promise<IGuild | null> {
		const res = (await this.rest.get(Routes.guild(guildId))) as APIGuild;
		if (!res) return null;
		return {
			id: res.id,
			name: res.name
		};
	}

	async fetchChannel(channelId: string): Promise<IChannel | null> {
		const route = Routes.channel(channelId);
		const res = await this.rest.get(route);
		return (res ?? null) as IChannel | null;
	}

	async fetchChannelMessages(
		channelId: string,
		options: {
			after?: string;
			around?: string;
			before?: string;
			cache?: boolean;
			limit?: number;
		}
	): Promise<IMessage[]> {
		const route = Routes.channelMessages(channelId);
		const res = await this.rest.get(route, {
			query: makeURLSearchParams(options)
		});
		return res as IMessage[];
	}

	async fetchMessage(channelId: string, messageId: string): Promise<IMessage | null> {
		const route = Routes.channelMessage(channelId, messageId);
		const res = await this.rest.get(route);
		return (res ?? null) as IMessage | null;
	}

	async giveRole(guildId: string, userId: string, roleId: string) {
		const route = Routes.guildMemberRole(guildId, userId, roleId);
		await this.rest.put(route);
	}

	async fetchRolesOfGuild(guildId: string): Promise<IRole[]> {
		const apiRoles: APIRole[] = (await this.rest.get(Routes.guildRoles(guildId))) as APIRole[];
		const roles: IRole[] = apiRoles.map(r => ({
			id: r.id,
			guild_id: guildId,
			name: r.name,
			color: r.color,
			permissions: Permissions.toKeys(r.permissions)
		}));
		await Cache.bulkSetRoles(roles);
		return roles;
	}

	async fetchEmoji({ guildId, emojiId }: { guildId: string; emojiId: string }): Promise<APIEmoji | null> {
		const route = Routes.guildEmoji(guildId, emojiId);
		const res = await this.rest.get(route);
		return res as APIEmoji | null;
	}

	async fetchMainServerMember(userId: string): Promise<null | IMember> {
		const m = await this.fetchMember({ guildId: globalConfig.supportServerID, userId });
		return m;
	}
	// async fetchRawMainServerMember(userId: string): Promise<APIGuildMember | null> {
	// 	const cached = Cache.MAIN_SERVER.MEMBERS.get(userId);
	// 	if (cached) return cached;
	// 	const m = await this.fetchMember({ guildId: globalConfig.supportServerID, userId })
	// 	return m;

	async fetchUser(userId: string): Promise<IUser> {
		const route = Routes.user(userId);
		const res = await this.rest.get(route);
		return res as IUser;
	}

	async fetchMember({ guildId, userId }: { guildId: string; userId: string }): Promise<IMember> {
		const rawApiMember = (await this.rest.get(Routes.guildMember(guildId, userId))) as APIGuildMember | null;
		if (!rawApiMember) throw new Error(`No member found for ${userId} in ${guildId}`);
		const roles: IRole[] = (await this.fetchRolesOfGuild(guildId)).filter(_r => rawApiMember.roles.includes(_r.id));
		const permissions: PermissionKey[] = uniqueArr(roles.flatMap(r => r.permissions));

		return {
			user_id: rawApiMember.user.id,
			guild_id: guildId,
			roles: rawApiMember.roles,
			permissions
		};
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
		this.sendPacket(d);
	}

	async sendPacket(packet: GatewaySendPayload) {
		const shardIds = await this.ws.getShardIds();
		return Promise.all(shardIds.map(shardId => this.ws.send(shardId, packet)));
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
		await this.rest.put(route);
	}

	public async [Symbol.asyncDispose]() {
		await this.ws.destroy();
	}

	createInteractionCollector(options: CollectorOptions) {
		return createInteractionCollector(this, options);
	}
}
