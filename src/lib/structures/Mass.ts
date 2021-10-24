/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-promise-reject-errors */
import { MessageReaction, TextChannel, User } from 'discord.js';
import { debounce, sleep, Time } from 'e';
import { KlasaMessage, KlasaUser } from 'klasa';

import { ReactionEmoji } from '../../lib/constants';
import { CustomReactionCollector } from '../../lib/structures/CustomReactionCollector';
import { formatDuration, removeFromArr } from '../../lib/util';
import { UserDenyResult } from './Boss';

export interface MassOptions {
	channel: TextChannel;
	maxSize: number;
	minSize: number;
	leader?: KlasaUser;
	text: string;
	ironmenAllowed: boolean;
	customDenier?: (user: KlasaUser) => Promise<UserDenyResult>;
	automaticStartTime?: number;
}

const emojis = [ReactionEmoji.Join, ReactionEmoji.Stop, ReactionEmoji.Start] as const;
function isActionEmoji(str: string | null): str is ReactionEmoji {
	return emojis.includes(str as ReactionEmoji);
}

export class Mass {
	maxSize: number;
	minSize: number;
	leader?: KlasaUser;
	text: string;
	ironmenAllowed: boolean;
	customDenier: ((user: KlasaUser) => Promise<UserDenyResult>) | undefined;

	channel: TextChannel;
	users: KlasaUser[] = [];
	message: KlasaMessage | null = null;
	automaticStartTime: number;

	constructor(opts: MassOptions) {
		this.maxSize = opts.maxSize;
		this.minSize = opts.minSize;
		this.leader = opts.leader;
		this.text = opts.text;
		this.ironmenAllowed = opts.ironmenAllowed;
		this.customDenier = opts.customDenier?.bind(this);
		this.channel = opts.channel;
		this.automaticStartTime = opts.automaticStartTime ?? Time.Minute * 2;
	}

	update = debounce(async () => {
		this.message!.edit({ content: this.getText(), allowedMentions: { roles: ['896845245873025067'] } });
	}, 500);

	async init() {
		// Check that the leader is okay to join.
		if (this.customDenier && this.leader) {
			const [denied, reason] = await this.customDenier(this.leader);
			if (denied) {
				throw new Error(`The mass couldn't start because the leader doesn't meet the requirements: ${reason}`);
			}
		}
		if (this.leader) {
			this.users.push(this.leader);
		}
		this.message = (await this.channel.send({
			content: this.getText(),
			allowedMentions: { roles: ['896845245873025067'] }
		})) as KlasaMessage;

		const promise = new Promise<KlasaUser[]>(async (resolve, reject) => {
			const start = async () => {
				let usersReacted: User[] = [];
				try {
					const tryGetReactions = (await this.message!.reactions.cache.get(ReactionEmoji.Join)!.users.fetch())
						.array()
						.filter(i => !i.bot);
					usersReacted = tryGetReactions;
				} catch (e) {
					let reason = 'Unknown error';
					if (e.message && e.message === 'Unknown Message') reason = 'Someone deleted the mass';
					reject(new Error(reason));
					return;
				}
				for (const user of usersReacted) {
					if (this.customDenier) {
						const [denied] = await this.customDenier(user);
						if (!denied && !this.users.includes(user)) {
							this.users.push(user);
						}
					}
				}
				if (this.users.length < this.minSize) {
					reject(new Error(`Did not meet minimum mass size of ${this.minSize}`));
				}
				resolve(this.users);
			};
			const collector = new CustomReactionCollector(
				this.message!,

				{
					time: this.automaticStartTime,
					max: this.maxSize,
					dispose: true,
					filter: async (reaction: MessageReaction, user: KlasaUser) => {
						await user.settings.sync();
						if (
							!isActionEmoji(reaction.emoji.id) ||
							(!this.ironmenAllowed && user.isIronman) ||
							user.bot ||
							user.minionIsBusy ||
							!user.hasMinion
						) {
							return false;
						}
						const action = reaction.emoji.id;

						if (
							(action === ReactionEmoji.Join && user === this.leader) ||
							(user !== this.leader && reaction.emoji.id !== ReactionEmoji.Join)
						) {
							reaction.users.remove(user);
						}

						return emojis.includes(reaction.emoji.id);
					}
				}
			);

			collector.on('remove', (reaction: MessageReaction, user: KlasaUser) => {
				if (reaction.emoji.id === ReactionEmoji.Join) {
					this.removeUser(user);
				}
			});

			collector.on('collect', async (reaction, user) => {
				if (!isActionEmoji(reaction.emoji.id)) return;
				if (user.partial) await user.fetch();

				switch (reaction.emoji.id) {
					case ReactionEmoji.Join: {
						if (this.users.length < this.maxSize) {
							await this.addUser(user);
							if (this.users.length >= this.maxSize) {
								collector.stop();
								start();
							}
						}
						break;
					}

					case ReactionEmoji.Stop: {
						if (user === this.leader) {
							reject(new Error(`The leader (${this.leader.username}) cancelled this mass`));
							collector.stop();
						}
						break;
					}

					case ReactionEmoji.Start: {
						if (user === this.leader) {
							start();
							collector.stop();
						}
						break;
					}
				}
			});

			collector.once('end', () => {
				this.message!.removeAllReactions();
				start();
			});

			for (const emoji of this.leader === undefined ? [ReactionEmoji.Join] : emojis) {
				await this.message!.react(emoji);
				await sleep(250);
			}
		});

		const result = await promise;
		return result;
	}

	getText() {
		return `${this.text}
        
**Users Joined:** ${
			this.users.length > 15 ? `${this.users.length} people!` : this.users.map(u => u.username).join(', ')
		}
            
This party will automatically depart in ${formatDuration(this.automaticStartTime)}${
			this.leader === undefined ? '' : ', or if the leader clicks the start or stop button'
		}.`;
	}

	async removeUser(user: KlasaUser) {
		if (user === this.leader) return;
		if (!this.users.includes(user)) return false;
		this.users = removeFromArr(this.users, user);
		this.update();
	}

	async addUser(user: KlasaUser) {
		if (this.users.includes(user)) return;

		if (this.customDenier) {
			const [denied, reason] = await this.customDenier(user);
			if (denied) {
				user.send(`You couldn't join this mass, for this reason: ${reason}`);
				return;
			}
		}

		this.users.push(user);
		this.update();
	}
}
