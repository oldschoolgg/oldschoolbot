import { Extendable, ExtendableStore, KlasaMessage, KlasaUser } from 'klasa';
import { Message, MessageReaction, Collection } from 'discord.js';
import { debounce } from 'lodash';

import { MakePartyOptions } from '../../lib/types';
import { ReactionEmoji } from '../../lib/constants';

async function _setup(
	msg: KlasaMessage,
	options: MakePartyOptions
): Promise<
	[
		(str: string) => Promise<KlasaMessage>,
		KlasaUser[],
		(onChange: () => any) => Promise<Collection<string, MessageReaction>>
	]
> {
	const confirmMessage = await msg.send(options.message);
	await confirmMessage.react(ReactionEmoji.Join);
	await confirmMessage.react(ReactionEmoji.Leave);

	// Debounce message edits to prevent spam.
	const debouncedEdit = debounce((str: string) => confirmMessage.edit(str), 500);
	let usersWhoConfirmed: KlasaUser[] = [options.leader];

	function reactionAwaiter(onChange: () => any) {
		return confirmMessage
			.awaitReactions(
				(reaction: MessageReaction, user: KlasaUser) => {
					if (user.isIronman || user.bot) return false;

					// Leaving
					if (
						options.leader !== user &&
						reaction.emoji.id === ReactionEmoji.Leave &&
						usersWhoConfirmed.includes(user)
					) {
						console.log(`${user.username} just left.`);
						usersWhoConfirmed = usersWhoConfirmed.filter(u => u !== user);
						onChange();
						return true;
					}

					// Stopping
					// if (
					// 	user === options.leader &&
					// 	reaction.emoji.toString() === ReactionEmoji.Stop
					// ) {
					// 	throw `The leader has stopped this party creation.`;
					// }

					if (reaction.emoji.toString() !== ReactionEmoji.Join) return false;
					if (usersWhoConfirmed.includes(user)) return false;

					if (options.usersAllowed && !options.usersAllowed.includes(user.id)) {
						return false;
					}

					usersWhoConfirmed.push(user);
					onChange();

					return true;
				},
				{
					time: 30_000,
					...options
				}
			)
			.finally(() => confirmMessage.removeAllReactions());
	}

	return [debouncedEdit, usersWhoConfirmed, reactionAwaiter];
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	async makeMassParty(this: KlasaMessage, options: MakePartyOptions) {
		const [debouncedEdit, usersWhoConfirmed, reactionAwaiter] = await _setup(this, options);

		try {
			const reactions = await reactionAwaiter(() => {
				debouncedEdit(
					`${options.message}\n\n**Users Joined:** ${usersWhoConfirmed
						.map(u => u.username)
						.join(', ')}`
				);
				return true;
			});

			if (reactions.size === 0) {
				throw new Error(`Nobody joined your mass! Sad :(`);
			}
		} catch (err) {
			throw typeof err === 'string'
				? new Error(err)
				: new Error('The time ran out, not everyone accepted the invite.');
		}

		return usersWhoConfirmed;
	}

	async makeInviteParty(this: KlasaMessage, options: MakePartyOptions) {
		const [debouncedEdit, usersWhoConfirmed, reactionAwaiter] = await _setup(this, options);

		try {
			const reactions = await reactionAwaiter(() => {
				debouncedEdit(
					`${options.message}\n\n**Users Joined:** ${usersWhoConfirmed
						.map(u => u.username)
						.join(', ')}`
				);
			});

			if (reactions.size === 0) {
				throw new Error(`Nobody joined your party! Sad :(`);
			}
		} catch (err) {
			throw typeof err === 'string'
				? new Error(err)
				: new Error('The time ran out, not everyone accepted the invite.');
		}

		return usersWhoConfirmed;
	}
}
