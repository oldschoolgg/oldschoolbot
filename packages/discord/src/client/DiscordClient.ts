import { makeURLSearchParams, REST } from '@discordjs/rest';
import { CompressionMethod, WebSocketManager, WebSocketShardEvents, WorkerShardingStrategy } from '@discordjs/ws';
import type { IChannel, IInteraction, IMember, IMessage, IRole, IUser, IWebhook } from '@oldschoolgg/schemas';
import { uniqueArr } from '@oldschoolgg/util';
import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import {
	ActivityType,
	type APIApplication,
	type APIApplicationCommand,
	type APIApplicationCommandOptionChoice,
	type APIChannel,
	type APIEmoji,
	type APIGuild,
	type APIGuildMember,
	type APIInteraction,
	type APIRole,
	type APIWebhook,
	GatewayDispatchEvents,
	GatewayOpcodes,
	type GatewayReadyDispatchData,
	type GatewaySendPayload,
	type GatewayUpdatePresence,
	InteractionResponseType,
	MessageReferenceType,
	PresenceUpdateStatus,
	Routes
} from 'discord-api-types/v10';

import { BitField } from '../BitField.js';
import { apiInteractionParse } from '../interactions/apiInteractionParse.js';
import {
	type CollectorOptions,
	createInteractionCollector,
	type InteractionCollector
} from '../interactions/interactionCollector.js';
import type { MInteraction } from '../interactions/MInteraction.js';
import { type PermissionKey, Permissions } from '../Permissions.js';
import {
	type DiscordClientEventsMap,
	type DiscordClientOptions,
	type SendableMessage,
	sendableMsgToApiCreate,
	type UserUsernameFetcher,
	type ValidAPIChannel
} from './types.js';

export class DiscordClient extends AsyncEventEmitter<DiscordClientEventsMap> implements AsyncDisposable {
	// Config
	public isProduction: boolean;
	private mainServerId: string;

	public isReady = false;
	public applicationCommands: APIApplicationCommand[] | null = null;
	public application: APIApplication | null = null;
	public rest: REST;
	public ws: WebSocketManager;

	private userUsernameFetcher: UserUsernameFetcher;

	constructor({
		token,
		intents,
		initialPresence,
		isProduction,
		mainServerId,
		userUsernameFetcher
	}: DiscordClientOptions) {
		super();
		this.isProduction = isProduction;
		this.mainServerId = mainServerId;
		this.userUsernameFetcher = userUsernameFetcher;
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
					this.emit('debug', { message: `Shard ${shardId} is ready.` });
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
					this.emit('rawMessageCreate', _msg);
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

	createInteractionCollector(options: CollectorOptions): InteractionCollector {
		return createInteractionCollector(options);
	}

	private sendableMsgToApiCreate(msg: SendableMessage) {
		return sendableMsgToApiCreate({ msg });
	}

	private async onReady(_d: GatewayReadyDispatchData) {
		const application: APIApplication = (await this.rest.get(Routes.currentApplication())) as APIApplication;
		this.application = application;
		await this.fetchCommands();
		this.isReady = true;
		this.emit('ready', { application });
	}

	public async fetchUserUsername(userId: string): Promise<string> {
		return this.userUsernameFetcher(userId);
	}

	async login(): Promise<void> {
		await this.ws.connect();
		return new Promise<void>(resolve => {
			this.once('ready', () => resolve());
		});
	}

	get applicationId(): string {
		const id = this.application?.id;
		if (!id) throw new Error('Application ID is not set yet.');
		return id;
	}

	async fetchGuild(guildId: string): Promise<APIGuild> {
		return (await this.rest.get(Routes.guild(guildId))) as APIGuild;
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

	async leaveGuild(guildId: string): Promise<void> {
		await this.rest.delete(Routes.userGuild(guildId));
	}

	public apiCommandsRoute(): `/applications/${string}/commands` {
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

	async replyToMessage(repliedMsg: IMessage, response: SendableMessage): Promise<IMessage> {
		const { files, message } = await this.sendableMsgToApiCreate(response);
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
	}

	async createWebhook(channelId: string): Promise<APIWebhook> {
		const data = await this.rest.post(Routes.channelWebhooks(channelId), {
			body: {
				name: this.application!.name
			}
		});
		return data as APIWebhook;
	}

	async fetchWebhooks(channelId: string): Promise<APIWebhook[]> {
		const data = await this.rest.get(Routes.channelWebhooks(channelId));
		return data as APIWebhook[];
	}

	async sendWebhook(webhook: IWebhook, rawMessage: SendableMessage): Promise<void> {
		const { files, message } = await this.sendableMsgToApiCreate(rawMessage);
		const query = makeURLSearchParams({
			wait: true
		});
		await this.rest.post(Routes.webhook(webhook.id, webhook.token), {
			body: message,
			query,
			files: files ?? undefined,
			auth: false
		});
	}

	async sendMessage(channelId: string, rawMessage: SendableMessage): Promise<IMessage> {
		try {
			const { files, message } = await this.sendableMsgToApiCreate(rawMessage);
			const res = await this.rest.post(Routes.channelMessages(channelId), {
				body: message,
				files: files ?? undefined
			});
			return res as IMessage;
		} catch (err) {
			this.emit('error', err as Error);
			throw err;
		}
	}

	async sendDm(userId: string, message: SendableMessage): Promise<IMessage> {
		const dmChannel: APIChannel = (await this.rest.post(Routes.userChannels(), {
			body: { recipient_id: userId }
		})) as APIChannel;
		return this.sendMessage(dmChannel.id, message);
	}

	async deleteMessage(channelId: string, messageId: string): Promise<void> {
		const route = Routes.channelMessage(channelId, messageId);
		await this.rest.delete(route);
	}

	async editMessage(channelId: string, messageId: string, body: SendableMessage): Promise<void> {
		const route = Routes.channelMessage(channelId, messageId);
		await this.rest.patch(route, {
			body
		});
	}

	async fetchChannel(channelId: string): Promise<ValidAPIChannel | null> {
		const res = (await this.rest.get(Routes.channel(channelId))) as ValidAPIChannel | null;
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

	async giveRole(guildId: string, userId: string, roleId: string): Promise<void> {
		const route = Routes.guildMemberRole(guildId, userId, roleId);
		await this.rest.put(route);
	}

	async takeRole(guildId: string, userId: string, roleId: string): Promise<void> {
		const route = Routes.guildMemberRole(guildId, userId, roleId);
		await this.rest.delete(route);
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
		return roles;
	}

	async fetchRole(guildId: string, roleId: string): Promise<IRole | null> {
		const roles = await this.fetchRolesOfGuild(guildId);
		return roles.find(r => r.id === roleId) ?? null;
	}

	async fetchEmoji({ guildId, emojiId }: { guildId: string; emojiId: string }): Promise<APIEmoji | null> {
		const route = Routes.guildEmoji(guildId, emojiId);
		const res = await this.rest.get(route);
		return res as APIEmoji | null;
	}

	async fetchMainServerMember(userId: string): Promise<null | IMember> {
		try {
			const m = await this.fetchMember({ guildId: this.mainServerId, userId });
			return m;
		} catch {
			return null;
		}
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
			permissions,
			joined_at: rawApiMember.joined_at ?? null
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
	}): Promise<void> {
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

	async respondToAutocompleteInteraction(
		interaction: IInteraction,
		choices: APIApplicationCommandOptionChoice[]
	): Promise<void> {
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

	async addReaction({
		channelId,
		messageId,
		emojiId
	}: {
		channelId: string;
		messageId: string;
		emojiId: string;
	}): Promise<void> {
		// Handle format like: :SkyStare:718251514899988488
		if (emojiId.includes(':')) {
			emojiId = emojiId.split(':').slice(-1)[0];
		}
		const route = Routes.channelMessageOwnReaction(channelId, messageId, encodeURIComponent(emojiId));
		await this.rest.put(route);
	}

	apiInteractionParse(itx: APIInteraction): Promise<MInteraction | undefined> {
		return apiInteractionParse(this, itx);
	}

	public async [Symbol.asyncDispose](): Promise<void> {
		await this.ws.destroy();
	}
}
