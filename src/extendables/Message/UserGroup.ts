/* eslint-disable prefer-promise-reject-errors */
import { Message, MessageReaction } from 'discord.js';
import { Time } from 'e';
import { Extendable, ExtendableStore, KlasaMessage, KlasaUser } from 'klasa';
import { debounce } from 'ts-debounce';

import { ReactionEmoji } from '../../lib/constants';
import { CustomReactionCollector } from '../../lib/structures/CustomReactionCollector';
import { cleanMentions, formatDuration, sleep } from '../../lib/util';

export interface UserGroupOptions {
	messageContent: (users: KlasaUser[]) => string;
	duration: number;
	onCancel: () => string;
	emojis: {
		join: string;
		start: string;
		cancel: string;
	};
	ironmenAllowed: boolean;
}

async function _setup(
	msg: KlasaMessage,
	options: UserGroupOptions
): Promise<[KlasaUser[], () => Promise<KlasaUser[]>]> {
	const users: KlasaUser[] = [];

	const { join, start, cancel } = options.emojis;

	const confirmMessage = (await msg.channel.send(
		cleanMentions(msg.guild, options.messageContent(users))
	)) as KlasaMessage;

	async function addEmojis() {
		await confirmMessage.react(join);
		await sleep(250);
		await confirmMessage.react(cancel);
		await sleep(250);
		await confirmMessage.react(start);
	}

	await addEmojis();

	const startTime = Date.now();
	const finishTime = Date.now() + options.duration;
	const timeRemaining = Math.max(0, finishTime - startTime);
	const bottom =
		timeRemaining === 0
			? `**Finished**`
			: `**Time Remaining:** ${formatDuration(timeRemaining)}.`;
	async function updateMsgContent() {
		const str = `${options.messageContent(users)}

${bottom}
`;
		await confirmMessage.edit(cleanMentions(msg.guild, str));
	}

	updateMsgContent();

	const updateUsersIn = debounce(updateMsgContent, 1000);

	const removeUser = (user: KlasaUser) => {
		const index = users.indexOf(user);
		if (index !== -1) {
			users.splice(index, 1);
			updateUsersIn();
		}
	};

	const interval = setInterval(updateMsgContent, Time.Second * 20);

	const reactionAwaiter = () =>
		new Promise<KlasaUser[]>(async (resolve, reject) => {
			const collector = new CustomReactionCollector(
				confirmMessage,
				(reaction: MessageReaction, user: KlasaUser) => {
					if (user.bot || !reaction.emoji.id) {
						return false;
					}

					return [join, cancel, start].includes(reaction.emoji.id);
				},
				{
					time: options.duration,
					dispose: true
				}
			);

			collector.on('remove', (reaction: MessageReaction, user: KlasaUser) => {
				if (!users.includes(user)) return false;
				if (reaction.emoji.id !== ReactionEmoji.Join) return false;
				removeUser(user);
			});

			function finish() {
				resolve(users);
			}

			collector.on('collect', async (reaction, user) => {
				if (user.partial) await user.fetch();
				if (!reaction.emoji.id) return;
				switch (reaction.emoji.id) {
					case join: {
						if (users.includes(user)) return;
						if (!options.ironmenAllowed && user.isIronman) return;
						users.push(user);
						updateUsersIn();
						break;
					}

					case cancel: {
						if (user === msg.author) {
							reject(options.onCancel());
							collector.stop('partyCreatorEnd');
						}
						break;
					}

					case start: {
						if (user === msg.author) {
							finish();
							collector.stop('partyCreatorEnd');
						}
						break;
					}
				}
			});

			collector.once('end', () => {
				confirmMessage.removeAllReactions();
				clearInterval(interval);
				setTimeout(() => finish(), 300);
			});
		});

	return [users, reactionAwaiter];
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	async makeGroup(this: KlasaMessage, options: UserGroupOptions) {
		const [users, reactionAwaiter] = await _setup(this, options);

		await reactionAwaiter();

		return users;
	}
}
