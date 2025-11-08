import { makeURLSearchParams, REST } from '@discordjs/rest';
import { CompressionMethod, WebSocketManager, WebSocketShardEvents, WorkerShardingStrategy } from '@discordjs/ws';
import {
	ActivityType,
	type APIApplication,
	type APIApplicationCommand,
	type APIApplicationCommandOptionChoice,
	type APIChannel,
	type APIEmoji,
	type APIGuildMember,
	type APIInteraction,
	type APIRole,
	BitField,
	ChannelType,
	GatewayDispatchEvents,
	type GatewayGuildCreateDispatchData,
	type GatewayIntentBits,
	GatewayOpcodes,
	type GatewayPresenceUpdateData,
	type GatewayReadyDispatchData,
	type GatewaySendPayload,
	type GatewayUpdatePresence,
	InteractionResponseType,
	MessageReferenceType,
	type PermissionKey,
	Permissions,
	PresenceUpdateStatus,
	Routes
} from '@oldschoolgg/discord';
import type { IChannel, IInteraction, IMember, IMessage, IRole, IUser } from '@oldschoolgg/schemas';
import { uniqueArr } from '@oldschoolgg/toolkit';
import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';

import { ReactEmoji } from '@/lib/data/emojis.js';
import { sendableMsgToApiCreate } from '@/lib/discord/SendableMessage.js';

export interface DiscordClientEventsMap {
	interactionCreate: [interaction: APIInteraction];
	guildCreate: [guild: GatewayGuildCreateDispatchData];
	ready: [data: { application: APIApplication }];
	economyLog: [message: string];
	serverNotification: [message: string];
	error: [error: Error];
	messageCreate: [message: IMessage];
}

export interface DiscordClientOptions {
	isProduction: boolean;
	mainServerId: string;
	token: string;
	intents: GatewayIntentBits[];
	initialPresence: { activity: GatewayPresenceUpdateData['activities'][0]; status: PresenceUpdateStatus };
}

export class DiscordClient extends AsyncEventEmitter<DiscordClientEventsMap> implements AsyncDisposable {
	public rest: REST;
	public ws: WebSocketManager;
	public applicationCommands: APIApplicationCommand[] | null = null;
	public application: APIApplication | null = null;
	public isProduction: boolean;
	private mainServerId: string;

	constructor({ token, intents, initialPresence, isProduction, mainServerId }: DiscordClientOptions) {
		super();
		this.isProduction = isProduction;
		this.mainServerId = mainServerId;
		this.rest = new REST({ version: '10' }).setToken(token);
		this.ws = new WebSocketManager({
			rest: this.rest,
			token: token,
			intents: new BitField(intents).bitfield,
			buildStrategy: manager => new WorkerShardingStrategy(manager, { shardsPerWorker: 4 }),
			initialPresence: {
				since: Date.now() - process.uptime() * 1000,
				activities: [initialPresence.activity],
				status: initialPresence.status,
				afk: false
			},
			compression: CompressionMethod.ZlibNative
		});

		this.ws.on(WebSocketShardEvents.Dispatch, async (packet, shardId) => {
			switch (packet.t) {
				case 'READY': {
					if (shardId === 0) {
						await this.onReady(packet.d);
					}
					break;
				}
				case GatewayDispatchEvents.InteractionCreate: {
					this.emit('interactionCreate', packet.d);
					break;
				}
				case GatewayDispatchEvents.MessageCreate: {
					const _msg = packet.d;
					if (_msg.author.bot) return;
					const msg: IMessage = {
						id: _msg.id,
						content: _msg.content,
						author_id: _msg.author.id,
						channel_id: _msg.channel_id,
						guild_id: _msg.guild_id ?? null
					};
					this.emit('messageCreate', msg);
					break;
				}
				case GatewayDispatchEvents.GuildCreate: {
					this.emit('guildCreate', packet.d);
					break;
				}
			}
		});
	}

	private async onReady(_d: GatewayReadyDispatchData) {
		const application: APIApplication = (await this.rest.get(Routes.currentApplication())) as APIApplication;
		this.application = application;
		await this.fetchCommands();
	}

	async login() {
		await this.ws.connect();
	}

	get applicationId() {
		const id = this.application?.id;
		if (!id) throw new Error('Application ID is not set yet.');
		return id;
	}

	/**
	 * REST Methods
	 */
	async channelIsSendable(channelId: IChannel | string): Promise<boolean> {
		const channel = typeof channelId === 'string' ? await Cache.getChannel(channelId) : channelId;
		if (!channel) return false;
		if (
			![ChannelType.DM, ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread].includes(
				channel.type
			)
		) {
			return false;
		}
		return true;
	}

	async fetchChannelsOfGuild(guildId: string): Promise<IChannel[]> {
		const apiChannels: APIChannel[] = (await this.rest.get(Routes.guildChannels(guildId))) as APIChannel[];
		const channels: IChannel[] = apiChannels.map(c => ({
			id: c.id,
			guild_id: guildId,
			type: c.type
		}));
		return channels;
	}

	async leaveGuild(guildId: string) {
		Logging.logDebug(`Leaving guild ${guildId}`);
		await this.rest.delete(Routes.userGuild(guildId));
	}

	public apiCommandsRoute() {
		const route = this.isProduction
			? Routes.applicationCommands(this.applicationId)
			: Routes.applicationGuildCommands(this.applicationId, this.mainServerId);
		return route;
	}

	private async fetchCommands() {
		const commands = (await this.rest.get(this.apiCommandsRoute())) as APIApplicationCommand[];
		this.applicationCommands = commands;
	}

	async memberHasPermissions(member: IMember, perms: PermissionKey[]): Promise<boolean> {
		return perms.every(perm => member.permissions.includes(perm));
	}

	async replyToMessage(repliedMsg: IMessage, response: SendableMessage): Promise<IMessage | null> {
		try {
			const { files, message } = await sendableMsgToApiCreate(response);
			message.message_reference = {
				message_id: repliedMsg.id,
				type: MessageReferenceType.Default,
				channel_id: repliedMsg.channel_id,
				guild_id: repliedMsg.guild_id ?? undefined
			};
			const res = await this.rest.post(Routes.channelMessages(repliedMsg.channel_id), {
				body: message,
				files: files ?? undefined
			});
			return res as IMessage;
		} catch (err) {
			Logging.logError(err as Error, {
				action: 'replyToMessage',
				messageId: repliedMsg.id,
				channelId: repliedMsg.channel_id
			});
			return null;
		}
	}

	async sendMessage(channelId: string, rawMessage: SendableMessage): Promise<IMessage | null> {
		try {
			const { files, message } = await sendableMsgToApiCreate(rawMessage);
			const res = await this.rest.post(Routes.channelMessages(channelId), {
				body: message,
				files: files ?? undefined
			});
			return res as IMessage;
		} catch (err) {
			Logging.logError(err as Error, {
				action: 'sendMessage',
				channelId,
				message: JSON.stringify(rawMessage).slice(0, 300)
			});
			return null;
		}
	}

	async sendDm(userId: string, message: SendableMessage) {
		const dmChannel: APIChannel = (await this.rest.post(Routes.userChannels(), {
			body: { recipient_id: userId }
		})) as APIChannel;
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

	async fetchChannel(channelId: string): Promise<APIChannel | null> {
		const res = (await this.rest.get(Routes.channel(channelId))) as APIChannel | null;
		if (!res) return null;
		return res;
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
		const m = await this.fetchMember({ guildId: this.mainServerId, userId });
		return m;
	}

	async fetchUser(userId: string): Promise<IUser> {
		const res = await this.rest.get(Routes.user(userId));
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
		await this.sendPacket(d);
	}

	private async sendPacket(packet: GatewaySendPayload) {
		const shardIds = await this.ws.getShardIds();
		return Promise.all(shardIds.map(shardId => this.ws.send(shardId, packet)));
	}

	async respondToAutocompleteInteraction(interaction: IInteraction, choices: APIApplicationCommandOptionChoice[]) {
		const route = Routes.interactionCallback(interaction.id, interaction.token);
		await this.rest.post(route, {
			body: {
				type: InteractionResponseType.ApplicationCommandAutocompleteResult,
				data: {
					choices
				}
			}
		});
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
}
