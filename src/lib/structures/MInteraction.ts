import { debounce, deepMerge, formatDuration, Time } from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';
import {
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type CommandInteraction,
	ComponentType,
	type InteractionResponse,
	InteractionResponseType,
	type Message,
	MessageFlags,
	PermissionsBitField,
	Routes
} from 'discord.js';

import { BLACKLISTED_USERS } from '@/lib/blacklists.js';
import { CACHED_ACTIVE_USER_IDS, partyLockCache } from '@/lib/cache.js';
import { SILENT_ERROR } from '@/lib/constants.js';
import { convertAPIOptionsToCommandOptions } from '@/lib/discord/index.js';
import {
	type CompatibleResponse,
	PaginatedMessage,
	type PaginatedMessageOptions
} from '@/lib/structures/PaginatedMessage.js';
import { getUsername } from '@/lib/util.js';

const wasDeferred = new Set();

interface MakePartyOptions {
	maxSize: number;
	minSize: number;
	leader: MUser;
	message: string;
	ironmanAllowed: boolean;
	usersAllowed?: string[];
	customDenier?(user: MUser): Promise<[false] | [true, string]>;
}

export class MInteraction {
	public interaction: CommandInteraction | ButtonInteraction;
	public deferred: boolean;
	public replied: boolean;
	public id: string;
	public ephemeral: boolean;
	public interactionResponse: InteractionResponse | Message | null = null;

	constructor({ interaction }: { interaction: CommandInteraction | ButtonInteraction }) {
		this.interaction = interaction;
		this.id = interaction.id;
		this.replied = interaction.replied;
		this.deferred = interaction.deferred;
		this.ephemeral = interaction.ephemeral ?? false;
	}

	public getDebugInfo() {
		const context: Record<string, string | number | null | boolean> = {
			user_id: this.user.id,
			channel_id: this.channelId,
			guild_id: this.guildId,
			interaction_id: this.id,
			interaction_type: this.interaction.type,
			interaction_created_at: this.createdTimestamp,
			current_timestamp: Date.now(),
			difference_ms: Date.now() - this.createdTimestamp,
			was_deferred: this.isRepliable() ? this.deferred : 'N/A'
		};
		if (this.interaction.isChatInputCommand()) {
			context.options = JSON.stringify(
				convertAPIOptionsToCommandOptions(this.interaction.options.data, this.interaction.options.resolved)
			);
			context.command_name = this.interaction.commandName;
		} else if (this.interaction.isButton()) {
			context.button_id = this.interaction.customId;
		}

		return context;
	}

	public isRepliable() {
		return this.interaction.isRepliable();
	}

	public get createdTimestamp() {
		return this.interaction.createdTimestamp;
	}

	public get commandName() {
		if (this.interaction.isCommand()) return this.interaction.commandName;
		return null;
	}

	public get customId() {
		if (this.interaction.isButton()) return this.interaction.customId;
		return null;
	}

	public get user() {
		return this.interaction.user;
	}

	public get member() {
		const permissions = this.interaction.memberPermissions ?? new PermissionsBitField();
		return {
			permissions
		};
	}

	public get channel() {
		return this.interaction.channel;
	}

	public get client() {
		return this.interaction.client;
	}

	public get channelId() {
		return this.interaction.channelId;
	}

	public get guildId() {
		return this.interaction.guildId;
	}

	public get guild() {
		return this.interaction.guild;
	}

	private handleError(err: unknown) {
		console.error('Interaction error:', err);
	}

	makePaginatedMessage(options: PaginatedMessageOptions) {
		return new PaginatedMessage({ interaction: this, ...options, onError: console.error }).run([
			this.interaction.user.id
		]);
	}

	async defer({ ephemeral }: { ephemeral?: boolean } = {}) {
		this.ephemeral = ephemeral ?? this.ephemeral;
		if (wasDeferred.size > 1000) wasDeferred.clear();
		if (!this.deferred && !wasDeferred.has(this.id)) {
			this.deferred = true;
			wasDeferred.add(this.id);
			try {
				const options: { flags?: number } = {};
				if (this.ephemeral) options.flags = MessageFlags.Ephemeral;
				await this.interaction.deferReply(options);
			} catch (err) {
				this.handleError(err);
			}
		}
	}

	async reply(
		_response: string | CompatibleResponse
	): Promise<InteractionResponse<boolean> | Message<boolean> | null> {
		if (this.replied) {
			throw new Error('Attempted to follow up (reply to an interaction which has already been replied to)');
		}

		const response: CompatibleResponse = typeof _response === 'string' ? { content: _response } : _response;

		if (!('content' in response)) {
			response.content = '';
		}
		if (!('components' in response)) {
			response.components = [];
		}

		try {
			if (this.deferred) {
				this.interactionResponse = await this.interaction.editReply(response);
			} else {
				this.interactionResponse = await this.interaction.reply(response);
			}
		} catch (e: any) {
			console.error(`MInteraction reply error:
Command: ${this.commandName}
Custom ID: ${this.customId}
Response: ${JSON.stringify(response).slice(0, 1000)}
Replied: ${this.replied}
Deferred: ${this.deferred}
Ephemeral: ${this.ephemeral}
Error: ${e.message}`);
		}
		return this.interactionResponse;
	}

	/**
	 * You cannot use ephemeral if more than one user is required to confirm.
	 */
	async confirmation(
		message:
			| string
			| ({ content: string; timeout?: number } & (
					| { ephemeral?: false; users?: string[] }
					| { ephemeral?: boolean; users?: undefined }
			  ))
	) {
		if (process.env.TEST) return;
		const content = typeof message === 'string' ? message : message.content;
		this.ephemeral = typeof message !== 'string' ? (message.ephemeral ?? this.ephemeral) : this.ephemeral;
		const users: string[] = typeof message !== 'string' ? (message.users ?? [this.user.id]) : [this.user.id];
		const timeout: number = typeof message !== 'string' ? (message.timeout ?? 15_000) : 15_000;

		const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('CONFIRM').setLabel('Confirm').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('CANCEL').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
		);

		await this.defer();

		await this.reply({
			content: `${content}\n\nYou have ${Math.floor(timeout / 1000)} seconds to confirm.`,
			components: [confirmRow]
		});

		const confirms = new Set();

		return new Promise<void>((resolve, reject) => {
			const collector = this.interactionResponse!.createMessageComponentCollector({ time: timeout });

			collector.on('collect', buttonInteraction => {
				const silentAck = () =>
					this.client.rest.post(Routes.interactionCallback(buttonInteraction.id, buttonInteraction.token), {
						body: {
							type: InteractionResponseType.DeferredMessageUpdate
						}
					});
				if (!users.includes(buttonInteraction.user.id)) {
					buttonInteraction.reply({
						flags: MessageFlags.Ephemeral,
						content: `This confirmation isn't for you.`
					});
					return;
				}

				if (buttonInteraction.customId === 'CANCEL') {
					// If they cancel, we remove the button component, which means we can't reply to the button interaction.
					this.reply({ content: `The confirmation was cancelled.`, components: [] });
					collector.stop();
					reject(new Error('SILENT_ERROR'));
					return;
				}

				if (confirms.has(buttonInteraction.user.id)) {
					buttonInteraction.reply({ flags: MessageFlags.Ephemeral, content: `You have already confirmed.` });
					return;
				}

				confirms.add(buttonInteraction.user.id);

				if (buttonInteraction.customId === 'CONFIRM') {
					silentAck();
					// All users have confirmed
					if (confirms.size === users.length) {
						collector.stop();
						resolve();
					} else {
						const unconfirmedUsernames = users
							.filter(i => !confirms.has(i))
							.map(i => this.client.users.cache.get(i)?.username ?? 'Unknown User');
						this.reply({
							content: `${content}\n\n${confirms.size}/${users.length} confirmed. Waiting for ${unconfirmedUsernames.join(', ')}...`,
							components: [confirmRow]
						});
					}
				}
			});

			collector.on('end', collected => {
				if (collected.size !== users.length) {
					this.reply({ content: `You ran out of time to confirm.`, components: [] });
					reject(new Error('SILENT_ERROR'));
				}
			});
		});
	}

	returnStringOrFile(string: string | CompatibleResponse): Awaited<CommandResponse> {
		const TOO_LONG_STR = 'The result was too long (over 2000 characters), please read the attached file.';

		if (typeof string === 'string') {
			if (string.length > 2000) {
				return {
					content: TOO_LONG_STR,
					files: [{ attachment: Buffer.from(string), name: 'result.txt' }]
				};
			}
			return string;
		}
		if (string.content && string.content.length > 2000) {
			return deepMerge(
				string,
				{
					content: TOO_LONG_STR,
					files: [{ attachment: Buffer.from(string.content), name: 'result.txt' }]
				},
				{ clone: false }
			);
		}
		return string;
	}

	public async makeParty(options: MakePartyOptions & { message: string }): Promise<MUser[]> {
		if (process.env.TEST) return [options.leader];
		const timeout = Time.Minute * 5;
		const usersWhoConfirmed: string[] = [options.leader.id];
		let massStarted = false;
		let partyCancelled = false;

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('PARTY_JOIN').setLabel('Join').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('PARTY_LEAVE').setLabel('Leave').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('PARTY_CANCEL').setLabel('Cancel').setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId('PARTY_START').setLabel('Start').setStyle(ButtonStyle.Success)
		);

		const getMessageContent = async () => ({
			content: `${options.message}\n\n**Users Joined:** ${(
				await Promise.all(usersWhoConfirmed.map(u => getUsername(u)))
			).join(
				', '
			)}\n\nThis party will automatically depart in ${formatDuration(timeout)}, or if the leader clicks the start (start early) or stop button.`,
			components: [row],
			allowedMentions: { users: [] as string[] }
		});

		await this.defer({ ephemeral: false });
		await this.reply(await getMessageContent());

		const message = this.interactionResponse!;
		const updateUsersIn = debounce(async () => {
			await this.reply(await getMessageContent());
		}, 500);

		const removeUser = (userID: string) => {
			if (userID === options.leader.id) return;
			const idx = usersWhoConfirmed.indexOf(userID);
			if (idx !== -1) {
				usersWhoConfirmed.splice(idx, 1);
				updateUsersIn();
			}
		};

		const silentAck = (bi: ButtonInteraction) =>
			this.client.rest.post(Routes.interactionCallback(bi.id, bi.token), {
				body: { type: InteractionResponseType.DeferredMessageUpdate }
			});

		const startTrip = async (resolve: (v: MUser[]) => void, reject: (e: Error) => void) => {
			if (massStarted) return;
			massStarted = true;
			await this.reply({ content: (await getMessageContent()).content, components: [] });
			if (!partyCancelled && usersWhoConfirmed.length < options.minSize) {
				reject(new Error('SILENT_ERROR'));
				return;
			}
			const members: MUser[] = [];
			for (const id of usersWhoConfirmed) members.push(await mUserFetch(id));
			resolve(members);
		};

		function checkParty(): string | null {
			if (usersWhoConfirmed.length < options.minSize) return `You need atleast ${options.minSize} players.`;
			if (usersWhoConfirmed.length > options.maxSize)
				return `You cannot have more than ${options.minSize} players.`;
			return null;
		}

		return new Promise<MUser[]>((resolve, reject) => {
			const collector = message.createMessageComponentCollector({
				time: timeout,
				componentType: ComponentType.Button
			});

			collector.on('collect', async bi => {
				if (BLACKLISTED_USERS.has(bi.user.id)) return;
				CACHED_ACTIVE_USER_IDS.add(bi.user.id);

				const user = await mUserFetch(bi.user.id);
				if (
					(!options.ironmanAllowed && user.isIronman) ||
					bi.user.bot ||
					user.minionIsBusy ||
					!user.hasMinion
				) {
					await bi.reply({
						content: `You cannot mass if you are busy${!options.ironmanAllowed ? ', an ironman' : ''}, or have no minion.`,
						flags: MessageFlags.Ephemeral
					});
					return;
				}

				if (options.usersAllowed && !options.usersAllowed.includes(user.id)) {
					await bi.reply({
						content: 'You are not allowed to join this mass.',
						flags: MessageFlags.Ephemeral
					});
					return;
				}

				const id = bi.customId as 'PARTY_JOIN' | 'PARTY_LEAVE' | 'PARTY_CANCEL' | 'PARTY_START';

				if (id === 'PARTY_JOIN') {
					if (options.customDenier) {
						const [denied, reason] = await options.customDenier(user);
						if (denied) {
							await bi.reply({
								content: `You couldn't join this mass, for this reason: ${reason}`,
								flags: MessageFlags.Ephemeral
							});
							return;
						}
					}
					if (usersWhoConfirmed.includes(bi.user.id)) {
						await bi.reply({ content: 'You are already in this mass.', flags: MessageFlags.Ephemeral });
						return;
					}
					if (partyLockCache.has(bi.user.id)) {
						await bi.reply({ content: 'You cannot join this mass.', flags: MessageFlags.Ephemeral });
						return;
					}
					usersWhoConfirmed.push(bi.user.id);
					partyLockCache.add(bi.user.id);
					await silentAck(bi);
					updateUsersIn();
					if (usersWhoConfirmed.length >= options.maxSize) collector.stop('everyoneJoin');
					return;
				}

				if (id === 'PARTY_LEAVE') {
					if (!usersWhoConfirmed.includes(bi.user.id) || bi.user.id === options.leader.id) {
						await bi.reply({ content: 'You cannot leave this mass.', flags: MessageFlags.Ephemeral });
						return;
					}
					partyLockCache.delete(bi.user.id);
					removeUser(bi.user.id);
					await silentAck(bi);
					return;
				}

				if (id === 'PARTY_CANCEL') {
					if (bi.user.id !== options.leader.id) {
						await bi.reply({ content: 'You cannot cancel this mass.', flags: MessageFlags.Ephemeral });
						return;
					}
					partyCancelled = true;
					await silentAck(bi);
					collector.stop('partyCreatorEnd');
					this.reply({ content: 'The party was cancelled.', components: [] });
					reject(new Error(SILENT_ERROR));
					return;
				}

				if (id === 'PARTY_START') {
					if (bi.user.id !== options.leader.id) {
						await bi.reply({ content: 'You cannot start this party.', flags: MessageFlags.Ephemeral });
						return;
					}
					const error = checkParty();
					if (error) {
						await bi.reply({ content: error, flags: MessageFlags.Ephemeral });
						return;
					}
					await silentAck(bi);
					collector.stop('partyCreatorEnd');
					await startTrip(resolve, reject);
				}
			});

			collector.once('end', async () => {
				for (const uid of usersWhoConfirmed) partyLockCache.delete(uid);
				if (massStarted || partyCancelled) return;
				TimerManager.setTimeout(() => void startTrip(resolve, reject), 250);
			});
		});
	}
}

export type MMember = typeof MInteraction.prototype.member;
