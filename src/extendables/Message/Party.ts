/* eslint-disable prefer-promise-reject-errors */
import { Message, MessageReaction } from 'discord.js';
import { debounce, sleep } from 'e';
import { Extendable, ExtendableStore, KlasaMessage, KlasaUser } from 'klasa';

import { ReactionEmoji } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { CustomReactionCollector } from '../../lib/structures/CustomReactionCollector';
import { MakePartyOptions } from '../../lib/types';

async function _setup(
	msg: KlasaMessage,
	options: MakePartyOptions
): Promise<[KlasaUser[], () => Promise<KlasaUser[]>]> {
	const usersWhoConfirmed: KlasaUser[] = [options.leader];

	function getMessageContent() {
		return `${options.message}\n\n**Users Joined:** ${usersWhoConfirmed
			.map(u => u.username)
			.join(
				', '
			)}\n\nThis party will automatically depart in 2 minutes, or if the leader clicks the start (start early) or stop button.`;
	}

	const confirmMessage = (await msg.channel.send(getMessageContent())) as KlasaMessage;
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
						const [customDenied, reason] = options.customDenier(user);
						if (customDenied) {
							user.send(`You couldn't join this mass, for this reason: ${reason}`);
							reaction.users.remove(user);
							return false;
						}
					}

					if (
						(reaction.emoji.id === ReactionEmoji.Join && user === options.leader) ||
						(user !== options.leader && reaction.emoji.id !== ReactionEmoji.Join)
					) {
						reaction.users.remove(user);
					}

					return ([ReactionEmoji.Join, ReactionEmoji.Stop, ReactionEmoji.Start] as string[]).includes(
						reaction.emoji.id
					);
				}
			});

			collector.on('remove', (reaction: MessageReaction, user: KlasaUser) => {
				if (!usersWhoConfirmed.includes(user)) return false;
				if (reaction.emoji.id !== ReactionEmoji.Join) return false;
				removeUser(user);
			});

			function startTrip() {
				if (usersWhoConfirmed.length < options.minSize) {
					reject(`${msg.author} Not enough people joined your ${options.party ? 'party' : 'mass'}!`);
					return;
				}

				resolve(usersWhoConfirmed);
			}

			collector.on('collect', async (reaction, user) => {
				if (user.partial) await user.fetch();
				if (user.client.settings?.get(ClientSettings.UserBlacklist).includes(user.id)) return;
				switch (reaction.emoji.id) {
					case ReactionEmoji.Join: {
						if (usersWhoConfirmed.includes(user)) return;

						if (options.usersAllowed && !options.usersAllowed.includes(user.id)) {
							return;
						}

						// Add the user
						usersWhoConfirmed.push(user);
						updateUsersIn();

						if (usersWhoConfirmed.length >= options.maxSize) {
							collector.stop('everyoneJoin');
							break;
						}

						break;
					}

					case ReactionEmoji.Stop: {
						if (user === options.leader) {
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
				confirmMessage.removeAllReactions();
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
		const [usersWhoConfirmed, reactionAwaiter] = await _setup(this, options);

		await reactionAwaiter();

		return usersWhoConfirmed;
	}
}
