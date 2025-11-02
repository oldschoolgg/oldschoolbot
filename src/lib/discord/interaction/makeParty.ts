import { BLACKLISTED_USERS } from "@/lib/blacklists.js";
import { CACHED_ACTIVE_USER_IDS, partyLockCache } from "@/lib/cache.js";
import { SILENT_ERROR } from "@/lib/constants.js";
import { InteractionID } from "@/lib/InteractionID.js";
import type { MakePartyOptions } from "@/lib/types/index.js";
import { ButtonBuilder } from "@discordjs/builders";
import type { ButtonInteraction } from "@oldschoolgg/discord.js";
import { Time, debounce, formatDuration } from "@oldschoolgg/toolkit";
import { TimerManager } from "@sapphire/timer-manager";
import { ButtonStyle, Routes, InteractionResponseType, ComponentType, MessageFlags } from "discord-api-types/v10";


export async function makeParty(interaction: MInteraction, options: MakePartyOptions & { message: string }): Promise<MUser[]> {
	interaction.isParty = true;
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

	await interaction.defer({ ephemeral: false });
	await interaction.reply(await getMessageContent());

	const updateUsersIn = debounce(async () => {
		await interaction.reply(await getMessageContent());
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
		await interaction.reply({ content: (await getMessageContent()).content, components: [] });
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
		const collector = interaction.interactionResponse!.createMessageComponentCollector<ComponentType.Button>({
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
				interaction.reply({ content: 'The party was cancelled.', components: [] });
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
