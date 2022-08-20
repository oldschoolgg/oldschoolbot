/* eslint-disable prefer-promise-reject-errors */
import { Message, MessageReaction, TextChannel } from 'discord.js';
import { debounce, noOp, sleep, Time } from 'e';
import { Extendable, ExtendableStore, KlasaMessage, KlasaUser } from 'klasa';

import { BLACKLISTED_USERS } from '../../lib/blacklists';
import { ReactionEmoji, SILENT_ERROR } from '../../lib/constants';
import { CustomReactionCollector } from '../../lib/structures/CustomReactionCollector';
import { MakePartyOptions } from '../../lib/types';

const partyLockCache = new Set<string>();
setInterval(() => partyLockCache.clear(), Time.Minute * 20);

export async function setupParty(
	channel: TextChannel,
	user: KlasaUser,
	options: MakePartyOptions
): Promise<[KlasaUser[], () => Promise<KlasaUser[]>]> {
	const usersWhoConfirmed: KlasaUser[] = [options.leader];
	let deleted = false;

	function getMessageContent() {
		return `${options.message}\n\n**Users Joined:** ${usersWhoConfirmed
			.map(u => u.username)
			.join(
				', '
			)}\n\nThis party will automatically depart in 2 minutes, or if the leader clicks the start (start early) or stop button.`;
	}

	const confirmMessage = (await channel.send(getMessageContent())) as KlasaMessage;
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
		if (deleted || confirmMessage.deleted) return;
		confirmMessage.edit(getMessageContent());
	}, 500);

	const removeUser = (user: KlasaUser) => {
		if (user === options.leader) return;
		const index = usersWhoConfirmed.indexOf(user);
		if (index !== -1) {
			usersWhoConfirmed.splice(index, 1);
			updateUsersIn();
		}
	};

	const reactionAwaiter = () =>
		new Promise<KlasaUser[]>(async (resolve, reject) => {
			let partyCancelled = false;
			const collector = new CustomReactionCollector(confirmMessage, {
				time: 120_000,
				max: options.usersAllowed?.length ?? options.maxSize,
				dispose: true,
				filter: async (reaction: MessageReaction, user: KlasaUser) => {
					await user.settings.sync();
					if (
						(!options.ironmanAllowed && user.isIronman) ||
						user.bot ||
						user.minionIsBusy ||
						!reaction.emoji.id ||
						!user.hasMinion
					) {
						return false;
					}

					if (options.usersAllowed && !options.usersAllowed.includes(user.id)) {
						return false;
					}

					if (options.customDenier && reaction.emoji.id === ReactionEmoji.Join) {
						const [customDenied, reason] = await options.customDenier(user);
						if (customDenied) {
							user.send(`You couldn't join this mass, for this reason: ${reason}`);
							return false;
						}
					}

					return ([ReactionEmoji.Join, ReactionEmoji.Stop, ReactionEmoji.Start] as string[]).includes(
						reaction.emoji.id
					);
				}
			});

			collector.on('remove', (reaction: MessageReaction, user: KlasaUser) => {
				if (!usersWhoConfirmed.includes(user)) return false;
				if (reaction.emoji.id !== ReactionEmoji.Join) return false;
				partyLockCache.delete(user.id);
				removeUser(user);
			});

			async function startTrip() {
				await confirmMessage.delete().catch(noOp);
				if (!partyCancelled && usersWhoConfirmed.length < options.minSize) {
					channel.send(`${user} Not enough people joined your ${options.party ? 'party' : 'mass'}!`);
					reject(new Error(SILENT_ERROR));
					return;
				}

				resolve(usersWhoConfirmed);
			}

			collector.on('collect', async (reaction, user) => {
				if (user.partial) await user.fetch();
				if (BLACKLISTED_USERS.has(user.id)) return;
				switch (reaction.emoji.id) {
					case ReactionEmoji.Join: {
						if (usersWhoConfirmed.includes(user) || partyLockCache.has(user.id)) return;

						if (options.usersAllowed && !options.usersAllowed.includes(user.id)) {
							return;
						}

						// Add the user
						usersWhoConfirmed.push(user);
						partyLockCache.add(user.id);
						updateUsersIn();

						if (usersWhoConfirmed.length >= options.maxSize) {
							collector.stop('everyoneJoin');
							break;
						}

						break;
					}

					case ReactionEmoji.Stop: {
						if (user === options.leader) {
							partyCancelled = true;
							reject(
								`The leader (${options.leader.username}) cancelled this ${
									options.party ? 'party' : 'mass'
								}!`
							);
							collector.stop('partyCreatorEnd');
						}
						break;
					}

					case ReactionEmoji.Start: {
						if (user === options.leader) {
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
					partyLockCache.delete(user.id);
				}
				setTimeout(() => startTrip(), 750);
			});
		});

	return [usersWhoConfirmed, reactionAwaiter];
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	async makePartyAwaiter(this: KlasaMessage, options: MakePartyOptions) {
		if (this.channel.type !== 'text') throw new Error('Tried to make party in non-text channel.');
		const [usersWhoConfirmed, reactionAwaiter] = await setupParty(this.channel, options.leader, options);

		await reactionAwaiter();

		return usersWhoConfirmed;
	}
}
