import {
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	Routes
} from '@oldschoolgg/discord';
import type { IButtonInteraction, IChatInputCommandInteraction, IGuild, IMember, IUser } from '@oldschoolgg/schemas';
import { debounce, deepMerge, formatDuration, Time } from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';
import type {
	APIChatInputApplicationCommandGuildInteraction,
	APIMessage,
	APIMessageComponentGuildInteraction
} from 'discord-api-types/v10';

import { BLACKLISTED_USERS } from '@/lib/blacklists.js';
import { CACHED_ACTIVE_USER_IDS, partyLockCache } from '@/lib/cache.js';
import { SILENT_ERROR } from '@/lib/constants.js';
import { BaseInteraction } from '@/lib/discord/interaction/BaseInteraction.js';
import { InteractionID } from '@/lib/InteractionID.js';
import { PaginatedMessage, type PaginatedMessageOptions } from '@/lib/structures/PaginatedMessage.js';

interface MakePartyOptions {
	maxSize: number;
	minSize: number;
	leader: MUser;
	message: string;
	ironmanAllowed: boolean;
	usersAllowed?: string[];
	customDenier?(user: MUser): Promise<[false] | [true, string]>;
}

type InputItx =
	| {
			interaction: IChatInputCommandInteraction;
			rawInteraction: APIChatInputApplicationCommandGuildInteraction;
	  }
	| {
			interaction: IButtonInteraction;
			rawInteraction: APIMessageComponentGuildInteraction;
	  };

export class MInteraction extends BaseInteraction {
	public interaction: IChatInputCommandInteraction | IButtonInteraction;
	public interactionResponse: APIMessage | null = null;
	public isPaginated = false;
	public isParty = false;
	public isConfirmation = false;

	public guild: IGuild | null = null;
	public member: IMember | null = null;
	public user: IUser;

	constructor({ interaction, rawInteraction }: InputItx) {
		super({ data: interaction, rest: globalClient.rest, applicationId: rawInteraction.application_id });
		this.interaction = interaction;
		this.user = interaction.user;
		this.member = interaction.member ?? null;
	}

	// static getChatInputCommandOptions(interaction: CommandInteraction | AutocompleteInteraction | ButtonInteraction) {
	// 	if (!interaction.isChatInputCommand()) return {};
	// 	const cmdOpts = convertAPIOptionsToCommandOptions(interaction.options.data, interaction.options.resolved);
	// 	return compressMahojiArgs(cmdOpts);
	// }

	// public getChatInputCommandOptions(command: command_name_enum) {
	// 	if (([command_name_enum.bank, command_name_enum.bs] as command_name_enum[]).includes(command)) {
	// 		return undefined;
	// 	}
	// 	return MInteraction.getChatInputCommandOptions(this.interaction);
	// }

	// static getInteractionDebugInfo(interaction: AutocompleteInteraction | MInteraction) {
	// 	const context: Record<string, string | number | null | boolean | undefined> = {
	// 		user_id: interaction.user.id,
	// 		channel_id: interaction.channel?.id,
	// 		guild_id: interaction.guild?.id,
	// 		itx_id: interaction.id,
	// 	};

	// 	if (interaction instanceof MInteraction) {
	// 		context.was_deferred = interaction.deferred;
	// 		context.cmd_name = interaction.commandName;
	// 		context.ephemeral = interaction.ephemeral;
	// 		context.replied = interaction.replied;
	// 		context.is_party = interaction.isParty;
	// 		context.is_confirm = interaction.isConfirmation;
	// 		context.is_paginated = interaction.isPaginated;
	// 		context.button_id = interaction.customId;

	// 		if (interaction.interaction.isChatInputCommand()) {
	// 			context.cmd_options = JSON.stringify(MInteraction.getChatInputCommandOptions(interaction.interaction));
	// 		}
	// 	}

	// 	return context;
	// }

	// public getDebugInfo() {
	// 	return MInteraction.getInteractionDebugInfo(this);
	// }

	// public get commandName() {
	// 	if (this.interaction.isCommand()) return this.interaction.commandName;
	// 	return null;
	// }

	// public get customId() {
	// 	if (this.interaction.isButton()) return this.interaction.customId;
	// 	return null;
	// }

	// public get member() {
	// 	const permissions = this.interaction.memberPermissions ?? new PermissionsBitField();
	// 	return {
	// 		permissions
	// 	};
	// }

	// public get message() {
	// 	if (!this.interaction.isButton()) return null;
	// 	return this.interaction.message;
	// }

	makePaginatedMessage(options: PaginatedMessageOptions) {
		this.isPaginated = true;
		return new PaginatedMessage({ interaction: this, ...options }).run([this.interaction.user.id]);
	}

	async defer({ ephemeral }: { ephemeral?: boolean } = {}) {
		return this.baseDeferReply({ ephemeral });
	}

	// private formatResponseForLogging(response: CompatibleResponse) {
	// 	return JSON.stringify(omit(response, ['files'])).slice(0, 600);
	// }

	async reply(message: SendableMessage) {
		return this.baseReply(message);
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

		const confirmRow = [
			(new ButtonBuilder()
				.setCustomId(InteractionID.Confirmation.Confirm)
				.setLabel('Confirm')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(InteractionID.Confirmation.Cancel)
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Secondary))
		];

		await this.defer();

		await this.reply({
			content: `${content}\n\nYou have ${Math.floor(timeout / 1000)} seconds to confirm.`,
			components: confirmRow
		});

		const confirms = new Set();

		return new Promise<void>((resolve, reject) => {
			const collector = this.interactionResponse!.createMessageComponentCollector<ComponentType.Button>({
				time: timeout
			});

			collector.on('collect', async buttonInteraction => {
				const silentAck = () =>
					globalClient.rest.post(Routes.interactionCallback(buttonInteraction.id, buttonInteraction.token), {
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
						const unconfirmedUsernames = await Promise.all(
							users.filter(i => !confirms.has(i)).map(i => Cache.getBadgedUsername(i))
						);
						this.reply({
							content: `${content}\n\n${confirms.size}/${users.length} confirmed. Waiting for ${unconfirmedUsernames.join(', ')}...`,
							components: confirmRow
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
					files: [{ buffer: Buffer.from(string), name: 'result.txt' }]
				};
			}
			return string;
		}
		if (string.content && string.content.length > 2000) {
			return deepMerge(
				string,
				{
					content: TOO_LONG_STR,
					files: [{ buffer: Buffer.from(string.content), name: 'result.txt' }]
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

		const row: ButtonBuilder[] = [
			(new ButtonBuilder().setCustomId(InteractionID.Party.Join).setLabel('Join').setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(InteractionID.Party.Leave)
				.setLabel('Leave')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId(InteractionID.Party.Cancel).setLabel('Cancel').setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId(InteractionID.Party.Start).setLabel('Start').setStyle(ButtonStyle.Success))
		];

		const getMessageContent = async () => ({
			content: `${options.message}\n\n**Users Joined:** ${(
				await Promise.all(usersWhoConfirmed.map(u => Cache.getBadgedUsername(u)))
			).join(
				', '
			)}\n\nThis party will automatically depart in ${formatDuration(timeout)}, or if the leader clicks the start (start early) or stop button.`,
			components: row,
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
			globalClient.rest.post(Routes.interactionCallback(bi.id, bi.token), {
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
