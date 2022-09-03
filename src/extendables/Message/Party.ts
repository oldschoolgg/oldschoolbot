/* eslint-disable prefer-promise-reject-errors */
import { userMention } from '@discordjs/builders';
import { MessageReaction, TextChannel, User } from 'discord.js';
import { debounce, noOp, sleep, Time } from 'e';

import { BLACKLISTED_USERS } from '../../lib/blacklists';
import { ReactionEmoji, SILENT_ERROR, usernameCache } from '../../lib/constants';
import { CustomReactionCollector } from '../../lib/structures/CustomReactionCollector';
import { MakePartyOptions } from '../../lib/types';
import { mUserFetch } from '../../mahoji/mahojiSettings';

const partyLockCache = new Set<string>();
setInterval(() => partyLockCache.clear(), Time.Minute * 20);

export async function setupParty(
	channel: TextChannel,
	user: MUser,
	options: MakePartyOptions
): Promise<[MUser[], () => Promise<MUser[]>]> {
	const usersWhoConfirmed: string[] = [options.leader.id];
	let deleted = false;

	function getMessageContent() {
		return `${options.message}\n\n**Users Joined:** ${usersWhoConfirmed
			.map(u => usernameCache.get(u) ?? userMention(u))
			.join(
				', '
			)}\n\nThis party will automatically depart in 2 minutes, or if the leader clicks the start (start early) or stop button.`;
	}

	const confirmMessage = await channel.send(getMessageContent());
	async function addEmojis() {
		await confirmMessage.react(ReactionEmoji.Join);
		await sleep(50);
		await confirmMessage.react(ReactionEmoji.Stop);
		await sleep(50);
		await confirmMessage.react(ReactionEmoji.Start);
	}

	addEmojis();

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
			const collector = new CustomReactionCollector(confirmMessage, {
				time: 120_000,
				max: options.usersAllowed?.length ?? options.maxSize,
				dispose: true,
				filter: async (reaction: MessageReaction, _user: User) => {
					const user = await mUserFetch(_user.id);
					if (
						(!options.ironmanAllowed && user.user.minion_ironman) ||
						_user.bot ||
						user.minionIsBusy ||
						!reaction.emoji.id ||
						!user.user.minion_hasBought
					) {
						return false;
					}

					if (options.usersAllowed && !options.usersAllowed.includes(user.id)) {
						return false;
					}

					if (options.customDenier && reaction.emoji.id === ReactionEmoji.Join) {
						const [customDenied, reason] = await options.customDenier(user);
						if (customDenied) {
							const fullUser = globalClient.users.cache.get(user.id);
							if (fullUser) {
								fullUser.send(`You couldn't join this mass, for this reason: ${reason}`).catch(noOp);
							}
							return false;
						}
					}

					return ([ReactionEmoji.Join, ReactionEmoji.Stop, ReactionEmoji.Start] as string[]).includes(
						reaction.emoji.id
					);
				}
			});

			collector.on('remove', (reaction: MessageReaction, user: User) => {
				if (!usersWhoConfirmed.includes(user.id)) return false;
				if (reaction.emoji.id !== ReactionEmoji.Join) return false;
				partyLockCache.delete(user.id);
				removeUser(user.id);
			});

			async function startTrip() {
				await confirmMessage.delete().catch(noOp);
				if (!partyCancelled && usersWhoConfirmed.length < options.minSize) {
					channel.send(`${user} Not enough people joined your ${options.party ? 'party' : 'mass'}!`);
					reject(new Error(SILENT_ERROR));
					return;
				}

				resolve(await Promise.all(usersWhoConfirmed.map(mUserFetch)));
			}

			collector.on('collect', async (reaction, user) => {
				if (user.partial) await user.fetch();
				if (BLACKLISTED_USERS.has(user.id)) return;

				const mUser = await mUserFetch(user.id);
				switch (reaction.emoji.id) {
					case ReactionEmoji.Join: {
						if (usersWhoConfirmed.includes(mUser.id) || partyLockCache.has(user.id)) return;

						if (options.usersAllowed && !options.usersAllowed.includes(user.id)) {
							return;
						}

						// Add the user
						usersWhoConfirmed.push(user.id);
						partyLockCache.add(user.id);
						updateUsersIn();

						if (usersWhoConfirmed.length >= options.maxSize) {
							collector.stop('everyoneJoin');
							break;
						}

						break;
					}

					case ReactionEmoji.Stop: {
						if (user.id === options.leader.id) {
							partyCancelled = true;
							reject(
								`The leader (${options.leader.usernameOrMention}) cancelled this ${
									options.party ? 'party' : 'mass'
								}!`
							);
							collector.stop('partyCreatorEnd');
						}
						break;
					}

					case ReactionEmoji.Start: {
						if (user.id === options.leader.id) {
							startTrip();
							collector.stop('partyCreatorEnd');
						}
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
				setTimeout(() => startTrip(), 750);
			});
		});

	return [await Promise.all(usersWhoConfirmed.map(mUserFetch)), reactionAwaiter];
}
