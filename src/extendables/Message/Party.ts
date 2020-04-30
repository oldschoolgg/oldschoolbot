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
): Promise<
	[
		(str: string) => Promise<KlasaMessage>,
		KlasaUser[],
		(onChange: () => void) => Promise<KlasaUser[]>
	]
> {
	const confirmMessage = await msg.send(options.message);
	await confirmMessage.react(ReactionEmoji.Join);
	await confirmMessage.react(ReactionEmoji.Leave);
	await confirmMessage.react(ReactionEmoji.Stop);

	// Debounce message edits to prevent spam.
	const debouncedEdit = debounce((str: string) => confirmMessage.edit(str), 500);
	const usersWhoConfirmed: KlasaUser[] = [options.leader];

	const reactionAwaiter = (onChange: () => void) =>
		new Promise<KlasaUser[]>(async (resolve, reject) => {
			const collector = new CustomReactionCollector(
				confirmMessage,
				(reaction: MessageReaction, user: KlasaUser) => {
					if (user.isIronman || user.bot) return false;
					return ([
						ReactionEmoji.Join,
						ReactionEmoji.Leave,
						ReactionEmoji.Stop
					] as string[]).includes(reaction.emoji.id || reaction.emoji.name);
				},
				{ time: 120_000 }
			);

			for await (const [reaction, user] of collector) {
				switch (reaction.emoji.id ?? reaction.emoji.name) {
					case ReactionEmoji.Join: {
						// Sanity!
						if (usersWhoConfirmed.includes(user)) continue;
						// If only SOME may join, check
						if (options.usersAllowed && !options.usersAllowed.includes(user.id))
							continue;

						// TODO(Magna): Handle maxSize pls thx

						// Add the user
						usersWhoConfirmed.push(user);
						onChange();
						break;
					}
					case ReactionEmoji.Leave: {
						// The leader cannot leave
						if (user === options.leader) continue;
						const index = usersWhoConfirmed.indexOf(user);
						if (index !== -1) {
							console.log(`${user.username} just left.`);
							usersWhoConfirmed.splice(index, 1);
							onChange();
						}
						break;
					}
					case ReactionEmoji.Stop: {
						if (user === options.leader) {
							reject(
								`The leader canceled this ${options.party ? 'party' : 'amass'}!`
							);
							collector.stop('partyCreatorEnd');
						}
						break;
					}
				}
			}

			confirmMessage.removeAllReactions();

			// If only the leader is overall in, sad beans
			if (usersWhoConfirmed.length === 1) {
				reject(`Nobody joined your ${options.party ? 'party' : 'mass'}! Sad :c`);
			} else if (usersWhoConfirmed.length < options.minSize) {
				reject(`Not enough people joined your ${options.party ? 'party' : 'mass'}!`);
			} else {
				resolve(usersWhoConfirmed);
			}
		});

	return [debouncedEdit, usersWhoConfirmed, reactionAwaiter];
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	async makePartyAwaiter(this: KlasaMessage, options: MakePartyOptions) {
		const [debouncedEdit, usersWhoConfirmed, reactionAwaiter] = await _setup(this, options);

		await reactionAwaiter(() => {
			debouncedEdit(
				`${options.message}\n\n**Users Joined:** ${usersWhoConfirmed
					.map(u => u.username)
					.join(', ')}`
			);
		});

		return usersWhoConfirmed;
	}
}
