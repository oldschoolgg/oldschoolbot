/* eslint-disable prefer-promise-reject-errors */
import { Extendable, ExtendableStore, KlasaMessage, KlasaUser } from 'klasa';
import { Message, MessageReaction } from 'discord.js';
import { debounce } from 'lodash';

import { MakePartyOptions } from '../../lib/types';
import { ReactionEmoji } from '../../lib/constants';
import { CustomReactionCollector } from '../../lib/structures/CustomReactionCollector';

async function _setup(
	msg: KlasaMessage,
	options: MakePartyOptions
): Promise<[KlasaUser[], () => Promise<KlasaUser[]>]> {
	const confirmMessage = await msg.send(options.message);
	await confirmMessage.react(ReactionEmoji.Join);
	await confirmMessage.react(ReactionEmoji.Stop);

	// Debounce message edits to prevent spam.
	const usersWhoConfirmed: KlasaUser[] = [options.leader];

	const updateUsersIn = debounce(() => {
		confirmMessage.edit(
			`${options.message}\n\n**Users Joined:** ${usersWhoConfirmed
				.map(u => u.username)
				.join(', ')}`
		);
	}, 500);

	const removeUser = (user: KlasaUser) => {
		console.log(`Removing ${user.username}`);
		if (user === options.leader) return;
		const index = usersWhoConfirmed.indexOf(user);
		if (index !== -1) {
			usersWhoConfirmed.splice(index, 1);
			updateUsersIn();
		}
	};

	const reactionAwaiter = () =>
		new Promise<KlasaUser[]>(async (resolve, reject) => {
			const collector = new CustomReactionCollector(
				confirmMessage,
				(reaction: MessageReaction, user: KlasaUser) => {
					if (user.isIronman || user.bot) return false;
					return ([ReactionEmoji.Join, ReactionEmoji.Stop] as string[]).includes(
						reaction.emoji.name
					);
				},
				{
					time: 120_000,
					max: options.usersAllowed?.length ?? options.maxSize,
					dispose: true
				}
			);

			collector.on('remove', (reaction: MessageReaction, user: KlasaUser) => {
				console.log(`remove event triggered for ${user.username}`);
				if (!usersWhoConfirmed.includes(user)) return false;
				if (reaction.emoji.name !== ReactionEmoji.Join) return false;
				removeUser(user);
			});

			collector.on('collect', async (reaction, user) => {
				if (user.partial) await user.fetch();
				switch (reaction.emoji.id || reaction.emoji.name) {
					case ReactionEmoji.Join: {
						if (usersWhoConfirmed.includes(user)) return;

						if (options.usersAllowed && !options.usersAllowed.includes(user.id)) {
							return;
						}

						if (usersWhoConfirmed.length >= options.maxSize) {
							collector.stop('everyoneJoin');
							break;
						}

						// Add the user
						usersWhoConfirmed.push(user);
						updateUsersIn();
						break;
					}

					case ReactionEmoji.Stop: {
						if (user === options.leader) {
							reject(`The leader canceled this ${options.party ? 'party' : 'mass'}!`);
							collector.stop('partyCreatorEnd');
						}
						break;
					}
				}
			});

			collector.once('end', () => {
				confirmMessage.removeAllReactions();

				if (usersWhoConfirmed.length === 1) {
					reject(`Nobody joined your ${options.party ? 'party' : 'mass'}! Sad :c`);
				} else if (usersWhoConfirmed.length < options.minSize) {
					reject(`Not enough people joined your ${options.party ? 'party' : 'mass'}!`);
				} else {
					resolve(usersWhoConfirmed);
				}
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
