/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-promise-reject-errors */
import { Message, MessageReaction, TextChannel, User } from 'discord.js';
import { debounce, sleep, Time } from 'e';

import { ReactionEmoji } from '../../lib/constants';
import { CustomReactionCollector } from '../../lib/structures/CustomReactionCollector';
import { formatDuration, removeFromArr } from '../../lib/util';
import { UserDenyResult } from './Boss';

export interface MassOptions {
	channel: TextChannel;
	maxSize: number;
	minSize: number;
	leader: MUser;
	text: string;
	ironmenAllowed: boolean;
	customDenier?: (user: MUser) => Promise<UserDenyResult>;
	automaticStartTime?: number;
}

const emojis = [ReactionEmoji.Join, ReactionEmoji.Stop, ReactionEmoji.Start] as const;
function isActionEmoji(str: string | null) {
	return emojis.includes(str as string);
}

export class Mass {
	maxSize: number;
	minSize: number;
	leader: MUser;
	text: string;
	ironmenAllowed: boolean;
	customDenier: ((user: MUser) => Promise<UserDenyResult>) | undefined;

	channel: TextChannel;
	users: MUser[] = [];
	message: Message | null = null;
	automaticStartTime: number;
	started: boolean = false;

	constructor(opts: MassOptions) {
		this.maxSize = opts.maxSize;
		this.minSize = opts.minSize;
		this.leader = opts.leader;
		this.text = opts.text;
		this.ironmenAllowed = opts.ironmenAllowed;
		this.customDenier = opts.customDenier?.bind(this);
		this.channel = opts.channel;
		this.automaticStartTime = opts.automaticStartTime ?? Time.Minute * 2;
		this.started = false;
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
		this.message = await this.channel.send({
			content: this.getText(),
			allowedMentions: { roles: ['896845245873025067'] }
		});

		const promise = new Promise<MUser[]>(async (resolve, reject) => {
			const start = async () => {
				if (this.started) return false;
				this.started = true;
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
					filter: async (reaction: MessageReaction, user: User) => {
						const mUser = await mUserFetch(user.id);
						if (
							!isActionEmoji(reaction.emoji.id) ||
							(!this.ironmenAllowed && mUser.isIronman) ||
							user.bot ||
							mUser.minionIsBusy ||
							!mUser.user.minion_hasBought
						) {
							return false;
						}
						const action = reaction.emoji.id;

						if (
							(action === ReactionEmoji.Join && user.id === this.leader.id) ||
							(mUser.id !== this.leader.id && reaction.emoji.id !== ReactionEmoji.Join)
						) {
							reaction.users.remove(user);
						}

						return isActionEmoji(reaction.emoji.id);
					}
				}
			);

			collector.on('remove', (reaction: MessageReaction, user: MUser) => {
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
								await start();
								collector.stop();
							}
						}
						break;
					}

					case ReactionEmoji.Stop: {
						if (user.id === this.leader.id) {
							reject(new Error(`The leader (${this.leader.usernameOrMention}) cancelled this mass`));
							collector.stop();
						}
						break;
					}

					case ReactionEmoji.Start: {
						if (user.id === this.leader.id) {
							await start();
							collector.stop();
						}
						break;
					}

					default: {
					}
				}
			});

			collector.once('end', async () => {
				await start();
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
			this.users.length > 15
				? `${this.users.length} people!`
				: this.users.map(u => u.usernameOrMention).join(', ')
		}
            
This party will automatically depart in ${formatDuration(this.automaticStartTime)}${
			this.leader === undefined ? '' : ', or if the leader clicks the start or stop button'
		}.`;
	}

	async removeUser(user: MUser) {
		if (user === this.leader) return;
		if (!this.users.includes(user)) return false;
		this.users = removeFromArr(this.users, user);
		this.update();
	}

	async addUser(user: User) {
		const mUser = await mUserFetch(user.id);
		if (this.users.some(u => u.id === mUser.id)) return;

		if (this.customDenier) {
			const [denied, reason] = await this.customDenier(mUser);
			if (denied) {
				user.send(`You couldn't join this mass, for this reason: ${reason}`);
				return;
			}
		}

		this.users.push(mUser);
		this.update();
	}
}
