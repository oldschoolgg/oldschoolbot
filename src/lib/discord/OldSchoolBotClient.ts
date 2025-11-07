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
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	GatewayDispatchEvents,
	type GatewayGuildCreateDispatchData,
	GatewayIntentBits,
	GatewayOpcodes,
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
import { Time, uniqueArr } from '@oldschoolgg/toolkit';
import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';

import { globalConfig } from '@/lib/constants.js';
import { ReactEmoji } from '@/lib/data/emojis.js';
import {
	type CollectorOptions,
	collectSingleInteraction,
	createInteractionCollector
} from '@/lib/discord/collector/collectSingle.js';
import { sendableMsgToApiCreate } from '@/lib/discord/SendableMessage.js';
import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';

export interface OldSchoolBotClientEventsMap {
	interactionCreate: [interaction: APIInteraction];
	guildCreate: [guild: GatewayGuildCreateDispatchData];
	ready: [data: GatewayReadyDispatchData];
	economyLog: [message: string];
	serverNotification: [message: string];
	error: [error: Error];
	messageCreate: [message: IMessage];
}

export class OldSchoolBotClient extends AsyncEventEmitter<OldSchoolBotClientEventsMap> implements AsyncDisposable {
	public rest: REST = new REST({ version: '10' }).setToken(globalConfig.botToken);
	public ws: WebSocketManager;
	public isShuttingDown = false;
	public allCommands = allCommandsDONTIMPORT;
	public applicationCommands: APIApplicationCommand[] | null = null;
	public application: APIApplication | null = null;

	constructor() {
		super();
		this.ws = new WebSocketManager({
			rest: this.rest,
			token: globalConfig.botToken,
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
						await this.onReady();
						this.emit('ready', packet.d);
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

	get applicationId() {
		const id = this.application?.id;
		if (!id) throw new Error('Application ID is not set yet.');
		return id;
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

	async onReady() {
		const application: APIApplication = (await this.rest.get(Routes.currentApplication())) as APIApplication;
		this.application = application;

		// Add owner to admin user IDs
		const ownerId = application.owner?.id;
		if (ownerId && !globalConfig.adminUserIDs.includes(ownerId)) {
			globalConfig.adminUserIDs.push(ownerId);
		}

		Logging.logDebug(`Logged in as ${application.bot?.username} after ${process.uptime()}s`);
		await this.fetchCommands();
	}

	async leaveGuild(guildId: string) {
		Logging.logDebug(`Leaving guild ${guildId}`);
		await this.rest.delete(Routes.userGuild(guildId));
	}

	public apiCommandsRoute() {
		const route = globalConfig.isProduction
			? Routes.applicationCommands(this.applicationId)
			: Routes.applicationGuildCommands(this.applicationId, globalConfig.supportServerID);
		return route;
	}

	private async fetchCommands() {
		const commands = (await this.rest.get(this.apiCommandsRoute())) as APIApplicationCommand[];
		this.applicationCommands = commands;
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
		const apiChannels: APIChannel[] = (await this.rest.get(Routes.guildChannels(guildId))) as APIChannel[];
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

	// async fetchGuild(guildId: string): Promise<IGuild | null> {
	// 	const res = (await this.rest.get(Routes.guild(guildId))) as APIGuild;
	// 	if (!res) return null;
	// 	return {
	// 		id: res.id,
	// 	};
	// }

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
		const m = await this.fetchMember({ guildId: globalConfig.supportServerID, userId });
		return m;
	}
	// async fetchRawMainServerMember(userId: string): Promise<APIGuildMember | null> {
	// 	const cached = Cache.MAIN_SERVER.MEMBERS.get(userId);
	// 	if (cached) return cached;
	// 	const m = await this.fetchMember({ guildId: globalConfig.supportServerID, userId })
	// 	return m;

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

	async pickStringWithButtons({
		options,
		content,
		interaction,
		allowedUsers
	}: {
		allowedUsers?: string[];
		interaction: MInteraction;
		options: { label?: string; id: string; emoji?: string }[];
		content: string;
	}): Promise<{ choice: { label?: string; id: string; emoji?: string }; userId: string } | null> {
		const CUSTOM_ID_PREFIX = `DYN_PICK_STRING_BUTTON_`;
		try {
			const buttons = options.map(opt => {
				const button = new ButtonBuilder()
					.setCustomId(`${CUSTOM_ID_PREFIX}${opt.id}`)
					.setStyle(ButtonStyle.Secondary);
				if (opt.emoji) {
					button.setEmoji({ id: opt.emoji });
				}
				if (opt.label) {
					button.setLabel(opt.label);
				}
				return button;
			});
			allowedUsers ??= [interaction.userId];
			const msg = await interaction.reply({
				content,
				components: buttons,
				withResponse: true
			});
			const res = await collectSingleInteraction(this, {
				messageId: msg!.id,
				channelId: msg!.channel_id,
				users: allowedUsers,
				timeoutMs: Time.Second * 30
			});
			if (!res) return null;
			res.silentButtonAck();
			const resId = res.customId!.replace(CUSTOM_ID_PREFIX, '');
			const choice = options.find(o => o.id === resId)!;
			return { choice, userId: res.userId };
		} catch (err) {
			Logging.logError(err as Error);
			return null;
		}
	}
}
