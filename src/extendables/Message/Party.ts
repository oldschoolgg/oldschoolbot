/* eslint-disable prefer-promise-reject-errors */
import { userMention } from '@discordjs/builders';
import {
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	InteractionCollector,
	MessageEditOptions,
	MessageOptions,
	TextChannel
} from 'discord.js';
import { debounce, noOp, Time } from 'e';

import { BLACKLISTED_USERS } from '../../lib/blacklists';
import { SILENT_ERROR, usernameCache } from '../../lib/constants';
import { MakePartyOptions } from '../../lib/types';
import { UserError } from '../../lib/UserError';
import { makeComponents } from '../../lib/util';
import { CACHED_ACTIVE_USER_IDS } from '../../lib/util/cachedUserIDs';

const partyLockCache = new Set<string>();
setInterval(() => partyLockCache.clear(), Time.Minute * 20);

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

	function getMessageContent(): MessageOptions & MessageEditOptions {
		return {
			content: `${options.message}\n\n**Users Joined:** ${usersWhoConfirmed
				.map(u => usernameCache.get(u) ?? userMention(u))
				.join(
					', '
				)}\n\nThis party will automatically depart in 2 minutes, or if the leader clicks the start (start early) or stop button.`,
			components: makeComponents(buttons.map(i => i.button)),
			allowedMentions: {
				users: []
			}
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
				time: Time.Minute * 2,
				maxUsers: options.usersAllowed?.length ?? options.maxSize,
				dispose: true,
				channel,
				componentType: ComponentType.Button,
				message: confirmMessage,
				filter: async interaction => {
					CACHED_ACTIVE_USER_IDS.add(interaction.user.id);
					const user = await mUserFetch(interaction.user.id);
					if (
						(!options.ironmanAllowed && user.user.minion_ironman) ||
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
				const mUser = await mUserFetch(interaction.user.id);
				const btn = buttons.find(i => i.id === interaction.customId);
				if (!btn) return;

				function reply(str: string) {
					interaction.reply({ content: str, ephemeral: true });
				}

				switch (btn.id) {
					case 'PARTY_JOIN': {
						if (usersWhoConfirmed.includes(mUser.id)) {
							return reply('You are already in this mass.');
						}
						if (
							partyLockCache.has(mUser.id) ||
							(options.usersAllowed && !options.usersAllowed.includes(mUser.id))
						) {
							return reply('You cannot join this mass.');
						}

						// Add the user
						usersWhoConfirmed.push(mUser.id);
						partyLockCache.add(mUser.id);
						updateUsersIn();

						reply('You joined this mass.');

						if (usersWhoConfirmed.length >= options.maxSize) {
							collector.stop('everyoneJoin');
							break;
						}
						break;
					}

					case 'PARTY_LEAVE': {
						if (!usersWhoConfirmed.includes(mUser.id) || mUser.id === options.leader.id) {
							reply('You cannot leave this mass.');
							return;
						}
						partyLockCache.delete(mUser.id);
						removeUser(mUser.id);
						reply('You left this this mass.');
						break;
					}

					case 'PARTY_CANCEL': {
						if (mUser.id === options.leader.id) {
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
						if (mUser.id === options.leader.id) {
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
