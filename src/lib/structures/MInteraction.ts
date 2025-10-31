import {
	ActionRowBuilder,
	type AutocompleteInteraction,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type CommandInteraction,
	ComponentType,
	InteractionResponseType,
	type Message,
	MessageFlags,
	PermissionsBitField,
	Routes
} from '@oldschoolgg/discord';
import { debounce, deepMerge, formatDuration, Time } from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';
import { omit } from 'remeda';

import { command_name_enum } from '@/prisma/main.js';
import { BLACKLISTED_USERS } from '@/lib/blacklists.js';
import { CACHED_ACTIVE_USER_IDS, partyLockCache } from '@/lib/cache.js';
import { SILENT_ERROR } from '@/lib/constants.js';
import { convertAPIOptionsToCommandOptions } from '@/lib/discord/index.js';
import { InteractionID } from '@/lib/InteractionID.js';
import {
	type CompatibleResponse,
	PaginatedMessage,
	type PaginatedMessageOptions
} from '@/lib/structures/PaginatedMessage.js';
import { compressMahojiArgs } from '@/lib/util/commandUsage.js';

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
	public id: string;
	public ephemeral: boolean;
	public interactionResponse: Message | null = null;
	public isPaginated = false;
	public isParty = false;
	public isConfirmation = false;

	constructor({ interaction }: { interaction: CommandInteraction | ButtonInteraction }) {
		this.interaction = interaction;
		this.id = interaction.id;
		this.ephemeral = interaction.ephemeral ?? false;
	}

	get replied() {
		return this.interaction.replied;
	}

	get deferred() {
		return this.interaction.deferred;
	}

	get type() {
		return this.interaction.type;
	}

	static getChatInputCommandOptions(interaction: CommandInteraction | AutocompleteInteraction | ButtonInteraction) {
		if (!interaction.isChatInputCommand()) return {};
		const cmdOpts = convertAPIOptionsToCommandOptions(interaction.options.data, interaction.options.resolved);
		return compressMahojiArgs(cmdOpts);
	}

	public getChatInputCommandOptions(command: command_name_enum) {
		if (([command_name_enum.bank, command_name_enum.bs] as command_name_enum[]).includes(command)) {
			return undefined;
		}
		return MInteraction.getChatInputCommandOptions(this.interaction);
	}

	static getInteractionDebugInfo(interaction: AutocompleteInteraction | MInteraction) {
		const context: Record<string, string | number | null | boolean> = {
			user_id: interaction.user.id,
			channel_id: interaction.channelId,
			guild_id: interaction.guildId,
			itx_id: interaction.id,
			itx_type: interaction.type,
			itx_created_at: interaction.createdTimestamp,
			itx_diff_s: ((Date.now() - interaction.createdTimestamp) / 1000).toFixed(1)
		};

		if (interaction instanceof MInteraction) {
			context.was_deferred = interaction.deferred;
			context.cmd_name = interaction.commandName;
			context.ephemeral = interaction.ephemeral;
			context.replied = interaction.replied;
			context.is_party = interaction.isParty;
			context.is_confirm = interaction.isConfirmation;
			context.is_paginated = interaction.isPaginated;
			context.button_id = interaction.customId;

			if (interaction.interaction.isChatInputCommand()) {
				context.cmd_options = JSON.stringify(MInteraction.getChatInputCommandOptions(interaction.interaction));
			}
		}

		return context;
	}

	public getDebugInfo() {
		return MInteraction.getInteractionDebugInfo(this);
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

	public get createdAt() {
		return this.interaction.createdAt;
	}

	public get message() {
		if (!this.interaction.isButton()) return null;
		return this.interaction.message;
	}

	makePaginatedMessage(options: PaginatedMessageOptions) {
		this.isPaginated = true;
		return new PaginatedMessage({ interaction: this, ...options }).run([this.interaction.user.id]);
	}

	async defer({ ephemeral }: { ephemeral?: boolean } = {}) {
		this.ephemeral = ephemeral ?? this.ephemeral;
		if (!this.deferred) {
			try {
				const options: { flags?: number } = {};
				if (this.ephemeral) options.flags = MessageFlags.Ephemeral;
				await this.interaction.deferReply(options);
			} catch (err) {
				Logging.logError(err as Error, {
					action: 'DEFER',
					...this.getDebugInfo()
				});
			}
		}
	}

	private formatResponseForLogging(response: CompatibleResponse) {
		return JSON.stringify(omit(response, ['files'])).slice(0, 600);
	}

	async reply(_response: string | CompatibleResponse): Promise<Message<boolean> | null> {
		const response: CompatibleResponse = typeof _response === 'string' ? { content: _response } : _response;

		if (!('content' in response)) {
			response.content = '';
		}
		if (!('components' in response)) {
			response.components = [];
		}

		if (response.ephemeral) {
			this.ephemeral = true;
			delete response.ephemeral;
			response.flags = MessageFlags.Ephemeral;
		}

		try {
			if (this.replied || this.deferred) {
				this.interactionResponse = await this.interaction.editReply(
					omit({ ...response, withResponse: true }, ['flags', 'ephemeral'])
				);
			} else {
				const interactionCallbackResponse = await this.interaction.reply({ ...response, withResponse: true });
				this.interactionResponse = interactionCallbackResponse.resource?.message ?? null;
			}
		} catch (err) {
			Logging.logError(err as Error, {
				action: `REPLY (${this.deferred ? 'editReply' : 'reply'})`,
				...this.getDebugInfo(),
				response: this.formatResponseForLogging(response)
			});
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
		this.isConfirmation = true;
		if (process.env.TEST) return;
		const content = typeof message === 'string' ? message : message.content;
		this.ephemeral = typeof message !== 'string' ? (message.ephemeral ?? this.ephemeral) : this.ephemeral;
		const users: string[] = typeof message !== 'string' ? (message.users ?? [this.user.id]) : [this.user.id];
		const timeout: number = typeof message !== 'string' ? (message.timeout ?? 15_000) : 15_000;

		const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(InteractionID.Confirmation.Confirm)
				.setLabel('Confirm')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(InteractionID.Confirmation.Cancel)
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Secondary)
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

				if (buttonInteraction.customId === InteractionID.Confirmation.Cancel) {
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

				if (buttonInteraction.customId === InteractionID.Confirmation.Confirm) {
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
		this.isParty = true;
		if (process.env.TEST) return [options.leader];
		const timeout = Time.Minute * 5;
		const usersWhoConfirmed: string[] = [options.leader.id];
		let massStarted = false;
		let partyCancelled = false;

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId(InteractionID.Party.Join).setLabel('Join').setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(InteractionID.Party.Leave)
				.setLabel('Leave')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId(InteractionID.Party.Cancel).setLabel('Cancel').setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId(InteractionID.Party.Start).setLabel('Start').setStyle(ButtonStyle.Success)
		);

		const getMessageContent = async () => ({
			content: `${options.message}\n\n**Users Joined:** ${(
				await Promise.all(usersWhoConfirmed.map(u => Cache.getBadgedUsername(u)))
			).join(
				', '
			)}\n\nThis party will automatically depart in ${formatDuration(timeout)}, or if the leader clicks the start (start early) or stop button.`,
			components: [row],
			allowedMentions: { users: [] as string[] }
		});

		await this.defer({ ephemeral: false });
		await this.reply(await getMessageContent());

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
			const collector = this.interactionResponse!.createMessageComponentCollector<ComponentType.Button>({
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

				const id = bi.customId as (typeof InteractionID.Party)[keyof typeof InteractionID.Party];

				if (id === InteractionID.Party.Join) {
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

				if (id === InteractionID.Party.Leave) {
					if (!usersWhoConfirmed.includes(bi.user.id) || bi.user.id === options.leader.id) {
						await bi.reply({ content: 'You cannot leave this mass.', flags: MessageFlags.Ephemeral });
						return;
					}
					partyLockCache.delete(bi.user.id);
					removeUser(bi.user.id);
					await silentAck(bi);
					return;
				}

				if (id === InteractionID.Party.Cancel) {
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

				if (id === InteractionID.Party.Start) {
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
