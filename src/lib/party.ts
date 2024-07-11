import { UserError } from '@oldschoolgg/toolkit/dist/lib/UserError';
import type { TextChannel } from 'discord.js';
import { ButtonBuilder, ButtonStyle, ComponentType, InteractionCollector, userMention } from 'discord.js';
import { Time, debounce, noOp } from 'e';

import { BLACKLISTED_USERS } from './blacklists';
import { SILENT_ERROR, globalConfig, usernameCache } from './constants';
import type { MakePartyOptions } from './types';
import { formatDuration, makeComponents } from './util';
import { CACHED_ACTIVE_USER_IDS } from './util/cachedUserIDs';

const partyLockCache = new Set<string>();
if (globalConfig.isProduction) {
	setInterval(() => {
		debugLog('Clearing partylockcache');
		partyLockCache.clear();
	}, Time.Minute * 20);
}

const buttons = [
	{
		id: 'PARTY_JOIN',
		button: new ButtonBuilder().setLabel('Join').setStyle(ButtonStyle.Primary).setCustomId('PARTY_JOIN')
	},
	{
		id: 'PARTY_LEAVE',
		button: new ButtonBuilder().setLabel('Leave').setStyle(ButtonStyle.Secondary).setCustomId('PARTY_LEAVE')
	},
	{
		id: 'PARTY_CANCEL',
		button: new ButtonBuilder().setLabel('Cancel').setStyle(ButtonStyle.Danger).setCustomId('PARTY_CANCEL')
	},
	{
		id: 'PARTY_START',
		button: new ButtonBuilder().setLabel('Start').setStyle(ButtonStyle.Success).setCustomId('PARTY_START')
	}
] as const;

export async function setupParty(channel: TextChannel, leaderUser: MUser, options: MakePartyOptions): Promise<MUser[]> {
	const usersWhoConfirmed: string[] = [options.leader.id];
	let deleted = false;
	const massTimeout = options.massTimeout ?? Time.Minute * 2;
	let massStarted = false;

	function getMessageContent() {
		const userText =
			usersWhoConfirmed.length > 25
				? `${usersWhoConfirmed.length} users have joined`
				: usersWhoConfirmed.map(u => usernameCache.get(u) ?? userMention(u)).join(', ');
		const allowedMentions = options.allowedMentions ?? { users: [] };
		return {
			content: `${
				options.message
			}\n\n**Users Joined:** ${userText}\n\nThis party will automatically depart in ${formatDuration(
				massTimeout
			)}, or if the leader clicks the start (start early) or stop button.`,
			components: makeComponents(buttons.map(i => i.button)),
			allowedMentions
		};
	}

	const confirmMessage = await channel.send(getMessageContent());

	// Debounce message edits to prevent spam.
	const updateUsersIn = debounce(() => {
		if (deleted) return;
		confirmMessage.edit(getMessageContent());
	}, 500);

	const removeUser = (userID: string) => {
		if (userID === options.leader.id) return;
		const index = usersWhoConfirmed.indexOf(userID);
		if (index !== -1) {
			usersWhoConfirmed.splice(index, 1);
			updateUsersIn();
		}
	};

	const reactionAwaiter = () =>
		new Promise<MUser[]>(async (resolve, reject) => {
			let partyCancelled = false;
			const collector = new InteractionCollector(globalClient, {
				time: massTimeout,
				maxUsers: 1,
				dispose: true,
				channel,
				componentType: ComponentType.Button,
				message: confirmMessage,
				filter: async interaction => {
					CACHED_ACTIVE_USER_IDS.add(interaction.user.id);
					const user = await mUserFetch(interaction.user.id);
					if (
						!options.ironmanAllowed ||
						interaction.user.bot ||
						user.minionIsBusy ||
						!user.user.minion_hasBought
					) {
						interaction.reply({
							content: `You cannot mass if you are busy${
								!options.ironmanAllowed ? ', an ironman' : ''
							}, or have no minion.`,
							ephemeral: true
						});
						return false;
					}

					if (options.usersAllowed && !options.usersAllowed.includes(user.id)) {
						interaction.reply({
							content: 'You are not allowed to join this mass.',
							ephemeral: true
						});
						return false;
					}

					const btn = buttons.find(i => i.id === interaction.customId);
					if (!btn) return false;

					if (options.customDenier && btn.id === 'PARTY_JOIN') {
						const [customDenied, reason] = await options.customDenier(user);
						if (customDenied) {
							interaction.reply({
								content: `You couldn't join this mass, for this reason: ${reason}`,
								ephemeral: true
							});

							return false;
						}
					}

					return true;
				}
			});

			async function startTrip() {
				if (massStarted) return;
				massStarted = true;
				await confirmMessage.delete().catch(noOp);
				if (!partyCancelled && usersWhoConfirmed.length < options.minSize) {
					channel.send(`${leaderUser} Not enough people joined your mass!`);
					reject(new Error(SILENT_ERROR));
					return;
				}

				resolve(await Promise.all(usersWhoConfirmed.map(mUserFetch)));
			}

			collector.on('collect', async interaction => {
				if (BLACKLISTED_USERS.has(interaction.user.id)) return;
				const btn = buttons.find(i => i.id === interaction.customId);
				if (!btn) return;

				function reply(str: string) {
					interaction.reply({ content: str, ephemeral: true });
				}

				switch (btn.id) {
					case 'PARTY_JOIN': {
						if (usersWhoConfirmed.includes(interaction.user.id)) {
							return reply('You are already in this mass.');
						}
						if (
							partyLockCache.has(interaction.user.id) ||
							(options.usersAllowed && !options.usersAllowed.includes(interaction.user.id))
						) {
							return reply('You cannot join this mass.');
						}

						// Add the user
						usersWhoConfirmed.push(interaction.user.id);
						partyLockCache.add(interaction.user.id);
						updateUsersIn();

						reply('You joined this mass.');

						if (usersWhoConfirmed.length === 1) {
							collector.stop('everyoneJoin');
							break;
						}
						break;
					}

					case 'PARTY_LEAVE': {
						if (
							!usersWhoConfirmed.includes(interaction.user.id) ||
							interaction.user.id === options.leader.id
						) {
							reply('You cannot leave this mass.');
							return;
						}
						partyLockCache.delete(interaction.user.id);
						removeUser(interaction.user.id);
						reply('You left this this mass.');
						break;
					}

					case 'PARTY_CANCEL': {
						if (interaction.user.id === options.leader.id) {
							partyCancelled = true;
							reply('You cancelled the mass.');
							reject(
								new UserError(`The leader (${options.leader.usernameOrMention}) cancelled this mass!`)
							);
							collector.stop('partyCreatorEnd');
							return;
						}
						reply('You cannot cancel this mass.');
						break;
					}

					case 'PARTY_START': {
						if (interaction.user.id === options.leader.id) {
							startTrip();
							collector.stop('partyCreatorEnd');
							reply('You started the mass.');
							return;
						}
						reply('You cannot start this mass.');
						break;
					}

					default:
						break;
				}
			});

			collector.once('end', () => {
				deleted = true;
				confirmMessage.delete().catch(noOp);
				for (const user of usersWhoConfirmed) {
					partyLockCache.delete(user);
				}
				setTimeout(() => startTrip(), 250);
			});
		});

	return reactionAwaiter();
}
